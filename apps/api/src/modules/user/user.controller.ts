import { Controller, Get, Param, Query, Req } from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { UserQueryDto } from "./dto/user-query.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { UserService } from "./user.service";

@ApiTags("users")
@ApiBearerAuth("JWT-auth")
@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@ApiOperation({
		summary: "Lista todos os usuários",
		description:
			"Retorna uma lista paginada de usuários cadastrados no sistema",
	})
	@ApiQuery({
		name: "page",
		required: false,
		type: Number,
		description: "Número da página (começa em 1)",
		example: 1,
	})
	@ApiQuery({
		name: "limit",
		required: false,
		type: Number,
		description: "Quantidade de usuários por página",
		example: 10,
	})
	@ApiResponse({
		status: 200,
		description: "Lista de usuários retornada com sucesso",
		type: [UserResponseDto],
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	findAll(
		@Req() req: Request & { user: { sub: string } },
		@Query() query: UserQueryDto,
	) {
		const userId = req.user.sub;
		return this.userService.findAll(query, userId);
	}

	@Get("me")
	@ApiOperation({
		summary: "Obtém dados do usuário autenticado",
		description:
			"Retorna os dados do próprio usuário autenticado via token JWT",
	})
	@ApiResponse({
		status: 200,
		description: "Dados do usuário retornados com sucesso",
		type: UserResponseDto,
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 404,
		description: "Usuário não encontrado",
	})
	findMeUser(@Req() req: Request & { user: { sub: string } }) {
		const userId = req.user.sub;
		return this.userService.findMe(userId);
	}

	@Get(":id")
	@ApiParam({
		name: "id",
		description: "UUID do usuário a ser recuperado",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiOperation({
		summary: "Obtém um usuário específico",
		description: "Retorna os dados de um usuário pelo seu UUID",
	})
	@ApiResponse({
		status: 200,
		description: "Usuário encontrado e retornado com sucesso",
		type: UserResponseDto,
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 404,
		description: "Usuário não encontrado com esse UUID",
	})
	findOne(@Param("id") id: string) {
		return this.userService.findOne(id);
	}
}
