import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateAccountKeyDto {
	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440000",
		description: "UUID da conta à qual a chave PIX será vinculada",
		format: "uuid",
	})
	@IsNotEmpty({ message: "accountId não pode estar vazio" })
	@IsString({ message: "accountId deve ser uma string válida" })
	@IsUUID("4", { message: "accountId deve ser um UUID válido" })
	accountId: string;

	@ApiProperty({
		example: "user@email.com",
		description: "Chave PIX (email, telefone, CPF, CNPJ ou chave aleatória)",
	})
	@IsNotEmpty({ message: "key não pode estar vazia" })
	@IsString({ message: "key deve ser uma string válida" })
	key: string;
}

export class UpdateAccountKeyDto {
	@ApiProperty({
		example: "newuser@email.com",
		description: "Nova chave PIX",
	})
	@IsNotEmpty({ message: "key não pode estar vazia" })
	@IsString({ message: "key deve ser uma string válida" })
	key: string;
}
