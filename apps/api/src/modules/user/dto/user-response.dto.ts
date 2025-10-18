import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
	@ApiProperty({
		example: "550e8400-e29b-41d4-a716-446655440000",
		description: "UUID único do usuário",
		format: "uuid",
	})
	id: string;

	@ApiProperty({
		example: "John Doe",
		description: "Nome completo do usuário",
	})
	name: string;

	@ApiProperty({
		example: "john@example.com",
		description: "Email do usuário",
		format: "email",
	})
	email: string;

	@ApiProperty({
		example: "2024-10-16T00:00:00Z",
		description: "Data de criação do usuário",
		format: "date-time",
	})
	createdAt: string;

	@ApiProperty({
		example: "2024-10-16T00:00:00Z",
		description: "Data da última atualização do usuário",
		format: "date-time",
	})
	updatedAt: string;
}
