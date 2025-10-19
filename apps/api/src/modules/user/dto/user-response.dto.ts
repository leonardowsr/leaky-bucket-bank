import { ApiProperty } from "@nestjs/swagger";

class UserBasicInfoDto {
	@ApiProperty({
		example: "John Doe",
		description: "Nome completo do usuário",
	})
	name: string;

	@ApiProperty({
		example: "john@example.com",
		description: "Email do usuário",
		format: "email",
	})
	email: string;
}

class AccountInfoDto {
	@ApiProperty({
		example: "1234567890",
		description: "Número da conta bancária",
	})
	accountNumber: string;

	@ApiProperty({
		example: 100000,
		description: "Saldo da conta em centavos",
		minimum: 0,
	})
	balance: number;

	@ApiProperty({
		description: "Chaves PIX vinculadas à conta",
		isArray: true,
		required: false,
		type: Object,
	})
	accountKeys?: { key: string }[];
}

export class UserResponseDto {
	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440000",
		description: "UUID único do usuário",
		format: "uuid",
	})
	id: string;

	@ApiProperty({
		example: "John Doe",
		description: "Nome completo do usuário",
	})
	name: string;

	@ApiProperty({
		example: "john@example.com",
		description: "Email do usuário",
		format: "email",
	})
	email: string;

	@ApiProperty({
		type: AccountInfoDto,
		description: "Informações da conta bancária do usuário",
		required: false,
	})
	account?: AccountInfoDto;

	@ApiProperty({
		example: "2024-10-16T00:00:00Z",
		description: "Data de criação do usuário",
		format: "date-time",
		required: false,
	})
	createdAt?: string;

	@ApiProperty({
		example: "2024-10-16T00:00:00Z",
		description: "Data da última atualização do usuário",
		format: "date-time",
		required: false,
	})
	updatedAt?: string;

	@ApiProperty({
		example: 10,
		description: "Quantidade de tokens disponíveis para o usuário",
	})
	tokenCount: number;

	@ApiProperty({
		example: "2024-10-20T12:34:56Z",
		description: "Data e hora do último token consumido pelo usuário",
		format: "date-time",
	})
	usedTokenAt: string;
}
