import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export class CreateAccountDto {
	@ApiProperty({
		example: 100000,
		description: "Saldo inicial da conta em centavos",
		minimum: 0,
	})
	@IsNumber(
		{ allowInfinity: false, allowNaN: false },
		{ message: "Balance deve ser um número válido" },
	)
	@Min(0, { message: "Balance não pode ser negativo" })
	balance: number;
}

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
