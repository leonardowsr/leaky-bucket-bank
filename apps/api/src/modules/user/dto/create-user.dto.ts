import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {
	@ApiProperty({
		example: "John Doe",
		description: "Nome completo do usuário",
		minLength: 3,
	})
	@IsString({ message: "Nome é obrigatório" })
	@IsNotEmpty({ message: "Nome não pode ser vazio" })
	@MinLength(3, { message: "Nome deve ter pelo menos 3 caracteres" })
	name: string;

	@ApiProperty({
		example: "john.doe@example.com",
		description: "Email único do usuário",
		format: "email",
	})
	@IsEmail({}, { message: "Email inválido" })
	@IsNotEmpty({ message: "Email não pode ser vazio" })
	email: string;

	@ApiProperty({
		example: "strongPassword123",
		description: "Senha do usuário",
		minLength: 8,
	})
	@IsString({ message: "Senha é obrigatória" })
	@IsNotEmpty({ message: "Senha não pode ser vazia" })
	@MinLength(8, { message: "Senha deve ter pelo menos 8 caracteres" })
	password: string;
}
