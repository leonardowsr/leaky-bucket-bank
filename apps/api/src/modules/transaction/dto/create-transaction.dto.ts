import { ApiProperty } from "@nestjs/swagger";
import {
	IsNotEmpty,
	IsNumber,
	IsString,
	IsUUID,
	Min,
	Validate,
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "IsNotEqualTo", async: false })
export class IsNotEqualToConstraint implements ValidatorConstraintInterface {
	validate(value: any, args: ValidationArguments) {
		const [relatedPropertyName] = args.constraints;
		const relatedValue = (args.object as any)[relatedPropertyName];
		return value !== relatedValue;
	}

	defaultMessage(args: ValidationArguments) {
		const [relatedPropertyName] = args.constraints;
		return `${args.property} não pode ser igual a ${relatedPropertyName}`;
	}
}
export class CreateTransactionDto {
	@ApiProperty({ example: 10000, description: "Amount em centavos" })
	@IsNotEmpty()
	@IsNumber(
		{ allowInfinity: false, allowNaN: false },
		{ message: "Amount deve ser um número válido" },
	)
	@Min(0, { message: "Amount deve ser maior que zero" })
	amount: number;

	@ApiProperty({
		example: "0a422f47-0c11-4961-951e-01250933e20c",
		description: "ID do account remetente",
	})
	@IsNotEmpty()
	@IsString({ message: "senderId deve ser uma string válida" })
	@IsUUID("4", { message: "senderId deve ser um UUID válido" })
	senderId: string;

	@ApiProperty({
		example: "cdf7b6eb-adeb-4df1-a64e-3faeae120628",
		description: "ID do account destinatário",
	})
	@IsNotEmpty()
	@IsString({ message: "receiverId deve ser uma string válida" })
	@IsUUID("4", { message: "receiverId deve ser um UUID válido" })
	@Validate(IsNotEqualToConstraint, ["senderId"], {
		message: "receiverId não pode ser igual a senderId",
	})
	receiverId: string;
}
