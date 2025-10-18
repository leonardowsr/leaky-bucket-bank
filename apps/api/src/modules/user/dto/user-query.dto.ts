import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min } from "class-validator";

export class UserQueryDto {
	@ApiProperty({
		example: 1,
		description: "Número da página (começa em 1)",
		required: false,
		minimum: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsNumber({}, { message: "page deve ser um número" })
	@Min(1, { message: "page deve ser maior ou igual a 1" })
	page?: number;

	@ApiProperty({
		example: 10,
		description: "Quantidade de usuários por página",
		required: false,
		minimum: 1,
		maximum: 100,
	})
	@IsOptional()
	@Type(() => Number)
	@IsNumber({}, { message: "limit deve ser um número" })
	@Min(1, { message: "limit deve ser maior ou igual a 1" })
	limit?: number;
}
