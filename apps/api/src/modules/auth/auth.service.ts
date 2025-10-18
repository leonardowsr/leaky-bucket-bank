import { configuration } from "@api/config/configuration";
import { RefreshTokenPayload } from "@api/interfaces/auth";
import { PrismaService } from "@api/modules/_prisma/prisma.service";
import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginDto, RefreshTokenDto, RegisterDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
	) {}
	async login(loginDto: LoginDto) {
		const user = await this.prisma.user.findUnique({
			where: { email: loginDto.email },
		});

		const checkPassword = await bcrypt.compare(
			loginDto.password,
			user?.password || "",
		);

		if (!user || !checkPassword) {
			throw new UnauthorizedException("Credenciais inválidas");
		}

		const payload = { sub: user.id, email: user.email };
		const accessToken = this.jwtService.sign(payload, { expiresIn: "1h" });
		const refreshToken = this.jwtService.sign(
			{ ...payload, refresh: true },
			{
				expiresIn: configuration.jwt.refreshExpire,
			},
		);

		return {
			access_token: accessToken,
			refresh_token: refreshToken,
		};
	}

	async register(registerDto: RegisterDto) {
		const saltRounds = 10;
		const passwordHashed = await bcrypt.hash(registerDto.password, saltRounds);
		const emailExists = await this.prisma.user.findUnique({
			where: { email: registerDto.email },
		});

		if (emailExists) {
			throw new ConflictException("Email já está em uso");
		}
		await this.prisma.$transaction(async (ctx) => {
			const user = await ctx.user.create({
				data: {
					email: registerDto.email,
					password: passwordHashed,
					name: registerDto.name,
				},
			});
			const randomAccountNumber = Math.floor(
				100000 + Math.random() * 900000,
			).toString();

			await ctx.account.create({
				data: {
					accountNumber: randomAccountNumber,
					balance: 100,
					userId: user.id,
				},
			});
		});

		return { success: true };
	}

	async refreshToken(refreshTokenDto: RefreshTokenDto) {
		try {
			await this.jwtService.verifyAsync(refreshTokenDto.refreshToken);
			const decoded = this.jwtService.decode<RefreshTokenPayload>(
				refreshTokenDto.refreshToken,
			);
			const user = await this.prisma.user.findFirst({
				where: { id: decoded.sub },
			});

			if (!user) {
				throw new UnauthorizedException("Usuário não encontrado");
			}

			const payload = { sub: user.id, email: user.email };
			const accessToken = this.jwtService.sign(payload, {
				expiresIn: configuration.jwt.accessExpire,
			});
			const newRefreshToken = this.jwtService.sign(
				{ ...payload, refresh: true },
				{
					expiresIn: configuration.jwt.refreshExpire,
				},
			);

			return {
				access_token: accessToken,
				refresh_token: newRefreshToken,
			};
		} catch {
			throw new UnauthorizedException("Refresh token inválido");
		}
	}
}
