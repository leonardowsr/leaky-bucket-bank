import { ApiProperty } from "@nestjs/swagger";

export class AccountResponseDto {
	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440000",
		description: "UUID único da conta",
		format: "uuid",
	})
	id: string;

	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440001",
		description: "UUID do usuário proprietário da conta",
		format: "uuid",
	})
	userId: string;

	@ApiProperty({
		example: "123456",
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
		example: "2024-10-16T00:00:00Z",
		description: "Data de criação da conta",
		format: "date-time",
	})
	createdAt: string;

	@ApiProperty({
		example: "2024-10-16T00:00:00Z",
		description: "Data da última atualização da conta",
		format: "date-time",
	})
	updatedAt: string;
}
