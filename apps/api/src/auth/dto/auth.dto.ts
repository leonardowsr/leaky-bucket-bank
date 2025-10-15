import { ApiProperty } from "@nestjs/swagger";
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength,
} from "class-validator";

export class LoginDto {
	@ApiProperty({ example: "user@example.com" })
	@IsNotEmpty({ message: "Email é obrigatório" })
	@IsEmail({}, { message: "Email inválido" })
	email: string;

	@ApiProperty({ example: "strongPassword123" })
	@IsNotEmpty({ message: "Senha é obrigatória" })
	password: string;
}

export class RegisterDto {
	@ApiProperty({ example: "John Doe" })
	@IsString({ message: "Nome é obrigatório" })
	name: string;

	@ApiProperty({ example: "user@example.com" })
	@IsEmail({ ignore_max_length: false }, { message: "Email inválido" })
	@MaxLength(255, { message: "Email deve ter no máximo 255 caracteres" })
	@IsNotEmpty({ message: "Email é obrigatório" })
	email: string;

	@ApiProperty({ example: "strongPassword123" })
	@IsString({ message: "Senha é obrigatória" })
	@IsNotEmpty({ message: "Senha é obrigatória" })
	@MinLength(8, { message: "Senha deve ter pelo menos 8 caracteres" })
	password: string;
}

export class RefreshTokenDto {
	@ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
	@IsString({ message: "Refresh token é obrigatório" })
	@IsNotEmpty({ message: "Refresh token é obrigatório" })
	refreshToken: string;
}
