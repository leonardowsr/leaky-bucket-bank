import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from "class-validator";

export class CreateTransactionDto {
	@ApiProperty({
		example: 10000,
		description: "Valor da transação em centavos",
		minimum: 1,
		type: "number",
	})
	@IsNotEmpty({ message: "Amount não pode estar vazio" })
	@IsNumber(
		{ allowInfinity: false, allowNaN: false },
		{ message: "Amount deve ser um número válido" },
	)
	@Min(1, { message: "Amount deve ser maior que zero" })
	amount: number;

	@ApiProperty({
		example: "0a422f47-0c11-4961-951e-01250933e20c",
		description: "UUID da conta remetente (de onde o dinheiro será debitado)",
		format: "uuid",
	})
	@IsNotEmpty({ message: "senderId não pode estar vazio" })
	@IsString({ message: "senderId deve ser uma string válida" })
	@IsUUID("4", { message: "senderId deve ser um UUID válido" })
	senderId: string;

	@ApiProperty({
		example: "receiver@email.com",
		description:
			"Chave PIX da conta destinatária (para onde o dinheiro será creditado)",
	})
	@IsNotEmpty({ message: "receiverKey não pode estar vazia" })
	@IsString({ message: "receiverKey deve ser uma string válida" })
	receiverKey: string;
}

export class UpdateTransactionDto extends CreateTransactionDto {
	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440000",
		description: "UUID único da transação a ser atualizada",
		format: "uuid",
	})
	@IsNotEmpty({ message: "transactionId não pode estar vazio" })
	@IsString({ message: "transactionId deve ser uma string válida" })
	@IsUUID("4", { message: "transactionId deve ser um UUID válido" })
	transactionId: string;
}

export class TransactionStatusDto {
	@ApiProperty({
		example: "approved",
		description: "Status atual da transação",
	})
	@IsNotEmpty({ message: "status não pode estar vazio" })
	@IsString({ message: "status deve ser uma string válida" })
	status: string;
}
