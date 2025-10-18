import { ApiProperty } from "@nestjs/swagger";

export class TransactionResponseDto {
	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440000",
		description: "UUID único da transação",
		format: "uuid",
	})
	id: string;

	@ApiProperty({
		example: 10000,
		description: "Valor da transação em centavos",
		minimum: 1,
	})
	amount: number;

	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440001",
		description: "UUID da conta remetente",
		format: "uuid",
	})
	senderId: string;

	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440002",
		description: "UUID da conta destinatária",
		format: "uuid",
	})
	receiverId: string;

	@ApiProperty({
		example: "pending",
		enum: ["recused", "approved", "pending"],
		description: "Status da transação",
	})
	status: string;

	@ApiProperty({
		example: "2024-10-16T00:00:00Z",
		description: "Data de criação da transação",
		format: "date-time",
	})
	createdAt: string;
}

export class CreateTransactionResponseDto {
	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440000",
		description: "UUID único da transação criada",
		format: "uuid",
	})
	transactionId: string;

	@ApiProperty({
		example: "PENDING",
		enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"],
		description: "Status inicial da transação (sempre PENDING na criação)",
	})
	status: string;
}
