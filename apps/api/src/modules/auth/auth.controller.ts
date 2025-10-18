import { Public } from "@api/config/configuration";
import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Res,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CookieOptions, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto, RefreshTokenDto, RegisterDto } from "./dto/auth.dto";
import { RegisterResponseDto } from "./dto/auth-response.dto";

const COOKIE_OPTIONS: CookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: "none",
	maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias,
};

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("login")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Faz login do usuário",
		description:
			"Autentica um usuário com email e senha, retornando tokens JWT em cookies",
	})
	@ApiBody({
		type: LoginDto,
		description: "Credenciais do usuário",
	})
	@ApiResponse({
		status: 200,
		description: "Login realizado com sucesso",
	})
	@ApiResponse({
		status: 400,
		description: "Email ou senha inválidos",
	})
	@ApiResponse({
		status: 401,
		description: "Usuário não autorizado",
	})
	async login(@Body() loginDto: LoginDto, @Res() res: Response) {
		const { access_token, refresh_token } =
			await this.authService.login(loginDto);

		res.cookie("access_token", access_token, {
			...COOKIE_OPTIONS,
			maxAge: 60 * 60 * 1000, // 1 hora
		});
		res.cookie("refresh_token", refresh_token, COOKIE_OPTIONS);

		return res.json({ success: true });
	}

	@Public()
	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: "Registra um novo usuário",
		description: "Cria uma nova conta de usuário com email, nome e senha",
	})
	@ApiBody({
		type: RegisterDto,
		description: "Dados do novo usuário",
	})
	@ApiResponse({
		status: 201,
		description: "Usuário registrado com sucesso",
		type: RegisterResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: "Email já existe ou dados inválidos",
	})
	@ApiResponse({
		status: 409,
		description: "Conflito - usuário já existe",
	})
	async register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Public()
	@Post("refresh-token")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Renova o token de acesso",
		description: "Gera um novo access token usando um refresh token do cookie",
	})
	@ApiResponse({
		status: 200,
		description: "Token renovado com sucesso",
	})
	@ApiResponse({
		status: 401,
		description: "Refresh token inválido ou expirado",
	})
	async refreshToken(@Body() dto: RefreshTokenDto, @Res() res: Response) {
		if (!dto.refreshToken) {
			return res.status(401).json({ message: "Refresh token não encontrado" });
		}

		try {
			const { access_token, refresh_token: newRefreshToken } =
				await this.authService.refreshToken({
					refreshToken: dto.refreshToken,
				});

			res.cookie("access_token", access_token, {
				...COOKIE_OPTIONS,
				maxAge: 60 * 60 * 1000, // 1 hora
			});
			res.cookie("refresh_token", newRefreshToken, COOKIE_OPTIONS);

			return res.json({ success: true });
		} catch {
			return res.status(401).json({ message: "Refresh token inválido" });
		}
	}
}
