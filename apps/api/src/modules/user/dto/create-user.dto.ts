import { IsEmail, IsString } from "class-validator";
export class CreateUserDto {
	@IsString({ message: "Nome é obrigatório" })
	name: string;

	@IsEmail({}, { message: "Email inválido" })
	email: string;

	@IsString({ message: "Senha é obrigatória" })
	password: string;
}
