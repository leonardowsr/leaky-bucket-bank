import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDto {
	@ApiProperty({
		example: true,
		description:
			"Indica sucesso no login. Os tokens são setados em cookies HttpOnly",
	})
	success: boolean;
}

export class RefreshTokenResponseDto {
	@ApiProperty({
		example: true,
		description:
			"Indica sucesso na renovação do token. O novo access token é setado em um cookie HttpOnly",
	})
	success: boolean;
}

export class RegisterResponseDto {
	@ApiProperty({
		example: true,
		description: "Indica sucesso no registro",
	})
	success: boolean;
}
