import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
} from "@nestjs/common";
import {
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { AccountKeyService } from "./account-key.service";
import { AccountKeyResponseDto } from "./dto/account-key-response.dto";
import {
	CreateAccountKeyDto,
	UpdateAccountKeyDto,
} from "./dto/create-account-key.dto";

@ApiTags("Account Keys")
@Controller("account-key")
export class AccountKeyController {
	constructor(private readonly accountKeyService: AccountKeyService) {}

	@Post()
	@ApiOperation({
		summary: "Criar nova chave PIX",
		description: "Cria uma nova chave PIX vinculada a uma conta",
	})
	@ApiResponse({
		status: 201,
		description: "Chave PIX criada com sucesso",
		type: AccountKeyResponseDto,
	})
	@ApiResponse({ status: 400, description: "Chave PIX já cadastrada" })
	@ApiResponse({ status: 404, description: "Conta não encontrada" })
	create(@Body() createAccountKeyDto: CreateAccountKeyDto) {
		return this.accountKeyService.create(createAccountKeyDto);
	}

	@Get()
	@ApiOperation({
		summary: "Listar chaves PIX do usuário",
		description: "Lista todas as chaves PIX vinculadas às contas do usuário",
	})
	@ApiResponse({
		status: 200,
		description: "Lista de chaves PIX",
		type: [AccountKeyResponseDto],
	})
	findAll(@Req() req: Request & { user: { sub: string } }) {
		const userId = req.user.sub as string;
		return this.accountKeyService.findAll(userId);
	}

	@Get("search")
	@ApiOperation({
		summary: "Buscar chave PIX por valor",
		description:
			"Busca uma chave PIX pelo seu valor e retorna informações da conta vinculada",
	})
	@ApiQuery({
		name: "key",
		required: true,
		description: "Valor da chave PIX (email, CPF, telefone, etc)",
		example: "user@example.com",
	})
	@ApiResponse({
		status: 200,
		description: "Chave PIX encontrada com dados da conta",
		schema: {
			type: "object",
			properties: {
				id: { type: "string", format: "uuid" },
				key: { type: "string" },
				accountId: { type: "string", format: "uuid" },
				accountNumber: { type: "string" },
				recipientName: { type: "string" },
				createdAt: { type: "string", format: "date-time" },
			},
		},
	})
	@ApiResponse({ status: 404, description: "Chave PIX não encontrada" })
	findByKey(@Query("key") key: string) {
		return this.accountKeyService.findByKey(key);
	}

	@Get(":id")
	@ApiOperation({
		summary: "Buscar chave PIX por ID",
		description: "Retorna uma chave PIX específica pelo seu ID",
	})
	@ApiParam({
		name: "id",
		description: "UUID da chave PIX",
		format: "uuid",
	})
	@ApiResponse({
		status: 200,
		description: "Chave PIX encontrada",
		type: AccountKeyResponseDto,
	})
	@ApiResponse({ status: 404, description: "Chave PIX não encontrada" })
	findOne(@Param("id") id: string) {
		return this.accountKeyService.findOne(id);
	}

	@Patch(":id")
	@ApiOperation({
		summary: "Atualizar chave PIX",
		description: "Atualiza o valor de uma chave PIX existente",
	})
	@ApiParam({
		name: "id",
		description: "UUID da chave PIX",
		format: "uuid",
	})
	@ApiResponse({
		status: 200,
		description: "Chave PIX atualizada com sucesso",
		type: AccountKeyResponseDto,
	})
	@ApiResponse({ status: 404, description: "Chave PIX não encontrada" })
	update(
		@Param("id") id: string,
		@Body() updateAccountKeyDto: UpdateAccountKeyDto,
	) {
		return this.accountKeyService.update(id, updateAccountKeyDto);
	}

	@Delete(":id")
	@ApiOperation({
		summary: "Remover chave PIX",
		description: "Remove uma chave PIX (exclusão lógica)",
	})
	@ApiParam({
		name: "id",
		description: "UUID da chave PIX",
		format: "uuid",
	})
	@ApiResponse({
		status: 200,
		description: "Chave PIX removida com sucesso",
	})
	@ApiResponse({ status: 404, description: "Chave PIX não encontrada" })
	remove(@Param("id") id: string) {
		return this.accountKeyService.remove(id);
	}
}
