import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsUUID } from "class-validator";

export class CreateAccountDto {
	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440000",
		description: "ID do usuário",
	})
	@IsUUID("4", { message: "userId deve ser um UUID válido" })
	userId: string;

	@ApiProperty({ example: "123456", description: "Número da conta" })
	@IsString({ message: "Account number deve ser uma string válida" })
	accountNumber?: string;

	@ApiProperty({ example: 100000, description: "Saldo da conta em centavos" })
	@IsNumber({}, { message: "Balance deve ser um número válido" })
	balance: number;
}

export class UpdateAccountDto {}
