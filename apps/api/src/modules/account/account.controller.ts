/** biome-ignore-all lint/complexity/useLiteralKeys: no need */
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Req,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { AccountService } from "./account.service";
import { CreateAccountDto, UpdateAccountDto } from "./dto/account.dto";
import { AccountResponseDto } from "./dto/account-response.dto";

@ApiTags("account")
@ApiBearerAuth("JWT-auth")
@Controller("account")
export class AccountController {
	constructor(private readonly accountService: AccountService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: "Cria uma nova conta bancária",
		description:
			"Registra uma nova conta bancária para o usuário autenticado. Cada usuário pode ter apenas UMA conta, que é criada automaticamente durante o registro.",
	})
	@ApiBody({
		type: CreateAccountDto,
		description: "Dados da conta a ser criada",
	})
	@ApiResponse({
		status: 201,
		description: "Conta criada com sucesso",
		type: AccountResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: "Dados inválidos",
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 409,
		description: "Usuário já possui uma conta",
	})
	create(@Body() createAccountDto: CreateAccountDto, @Req() request: Request) {
		const userId = request["user"].sub as string;
		if (!userId) {
			throw new BadRequestException("User ID não fornecido");
		}
		return this.accountService.create(createAccountDto, userId);
	}

	@Get()
	@ApiOperation({
		summary: "Lista todas as contas",
		description: "Retorna uma lista de todas as contas bancárias do sistema",
	})
	@ApiResponse({
		status: 200,
		description: "Lista de contas retornada com sucesso",
		type: [AccountResponseDto],
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	findAll() {
		return this.accountService.findAll();
	}

	@Get("me")
	@ApiOperation({
		summary: "Lista contas do usuário autenticado",
		description:
			"Retorna todas as contas bancárias do usuário autenticado via token JWT",
	})
	@ApiResponse({
		status: 200,
		description: "Contas do usuário retornadas com sucesso",
		type: [AccountResponseDto],
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 404,
		description: "Nenhuma conta encontrada para o usuário",
	})
	findAllByUser(@Req() request: Request) {
		const userId = request["user"].sub as string;
		if (!userId) {
			throw new BadRequestException("User ID não fornecido");
		}
		return this.accountService.findAllByUser(userId);
	}

	@Get("me/single")
	@ApiOperation({
		summary: "Retorna a conta única do usuário",
		description:
			"Retorna a única conta bancária do usuário autenticado. Cada usuário tem apenas uma conta.",
	})
	@ApiResponse({
		status: 200,
		description: "Conta do usuário retornada com sucesso",
		type: AccountResponseDto,
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 404,
		description: "Conta não encontrada para o usuário",
	})
	findMe(@Req() request: Request) {
		const userId = request["user"].sub as string;
		if (!userId) {
			throw new BadRequestException("User ID não fornecido");
		}
		return this.accountService.findMe(userId);
	}

	@Get(":id")
	@ApiParam({
		name: "id",
		description: "UUID da conta a ser recuperada",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiOperation({
		summary: "Obtém uma conta específica",
		description: "Retorna os dados de uma conta bancária pelo seu UUID",
	})
	@ApiResponse({
		status: 200,
		description: "Conta encontrada e retornada com sucesso",
		type: AccountResponseDto,
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 404,
		description: "Conta não encontrada com esse UUID",
	})
	findOne(@Param("id") id: string) {
		return this.accountService.findOne(id);
	}

	@Patch(":id")
	@ApiParam({
		name: "id",
		description: "UUID da conta a ser atualizada",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiOperation({
		summary: "Atualiza uma conta bancária",
		description: "Atualiza os dados de uma conta bancária existente",
	})
	@ApiBody({
		type: UpdateAccountDto,
		description: "Dados da conta a serem atualizados",
	})
	@ApiResponse({
		status: 200,
		description: "Conta atualizada com sucesso",
		type: AccountResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: "Dados inválidos",
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 404,
		description: "Conta não encontrada",
	})
	update(@Param("id") id: string, @Body() updateAccountDto: UpdateAccountDto) {
		return this.accountService.update(id, updateAccountDto);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiParam({
		name: "id",
		description: "UUID da conta a ser deletada",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiOperation({
		summary: "Deleta uma conta bancária",
		description: "Remove uma conta bancária do sistema",
	})
	@ApiResponse({
		status: 204,
		description: "Conta deletada com sucesso",
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 404,
		description: "Conta não encontrada",
	})
	remove(@Param("id") id: string) {
		return this.accountService.remove(id);
	}

	@Post(":id/loan")
	@ApiParam({
		name: "id",
		description: "UUID da conta para a qual o empréstimo está sendo solicitado",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@ApiOperation({
		summary: "Solicita um empréstimo para uma conta",
		description: "Aprova um empréstimo e atualiza o saldo da conta",
	})
	@ApiResponse({
		status: 200,
		description: "Empréstimo aprovado e saldo atualizado com sucesso",
	})
	@ApiResponse({
		status: 401,
		description: "Token JWT ausente ou inválido",
	})
	@ApiResponse({
		status: 404,
		description: "Conta não encontrada",
	})
	loanRequest(@Param("id") id: string) {
		return this.accountService.loanRequest(id);
	}
}
