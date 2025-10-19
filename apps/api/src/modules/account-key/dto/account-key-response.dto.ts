import { ApiProperty } from "@nestjs/swagger";

export class AccountKeyResponseDto {
	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440003",
		description: "UUID único da chave PIX",
		format: "uuid",
	})
	id: string;

	@ApiProperty({
		example: "user@email.com",
		description: "Chave PIX (email, telefone, CPF, CNPJ ou chave aleatória)",
	})
	key: string;

	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440000",
		description: "UUID da conta à qual a chave está vinculada",
		format: "uuid",
	})
	accountId: string;

	@ApiProperty({
		example: "2024-10-16T00:00:00Z",
		description: "Data de criação da chave PIX",
		format: "date-time",
	})
	createdAt: string;
}
