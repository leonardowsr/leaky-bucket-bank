import { z } from "zod";

/**
 * Schema para registro de novo usuário
 */
export const registerSchema = z
	.object({
		name: z.string().min(1, "Nome é obrigatório"),
		email: z.string().email("Email inválido"),
		password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
		confirmPassword: z
			.string()
			.min(6, "Confirmação de senha deve ter no mínimo 6 caracteres"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"],
	});

/**
 * Schema para login
 */
export const loginSchema = z.object({
	email: z.string().email("Email inválido"),
	password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

/**
 * Schema para resposta de autenticação (com token)
 */
export const authResponseSchema = z.object({
	user: z.object({
		id: z.string().uuid(),
		name: z.string(),
		email: z.string().email(),
		tokenCount: z.number().int(),
	}),
	token: z.string(),
	expiresIn: z.number().int(),
});

/**
 * Schema para refresh token
 */
export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, "Refresh token é obrigatório"),
});

/**
 * Schema para alterar senha
 */
export const changePasswordSchema = z
	.object({
		currentPassword: z
			.string()
			.min(6, "Senha atual deve ter no mínimo 6 caracteres"),
		newPassword: z
			.string()
			.min(6, "Nova senha deve ter no mínimo 6 caracteres"),
		confirmNewPassword: z
			.string()
			.min(6, "Confirmação de senha deve ter no mínimo 6 caracteres"),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "As senhas não coincidem",
		path: ["confirmNewPassword"],
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: "Nova senha deve ser diferente da atual",
		path: ["newPassword"],
	});

/**
 * Schema para recuperação de senha (solicitar)
 */
export const forgotPasswordSchema = z.object({
	email: z.string().email("Email inválido"),
});

/**
 * Schema para recuperação de senha (resetar)
 */
export const resetPasswordSchema = z
	.object({
		token: z.string().min(1, "Token é obrigatório"),
		newPassword: z
			.string()
			.min(6, "Nova senha deve ter no mínimo 6 caracteres"),
		confirmNewPassword: z
			.string()
			.min(6, "Confirmação de senha deve ter no mínimo 6 caracteres"),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "As senhas não coincidem",
		path: ["confirmNewPassword"],
	});

/**
 * Types inferidos dos schemas
 */
export type Register = z.infer<typeof registerSchema>;
export type Login = z.infer<typeof loginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type RefreshToken = z.infer<typeof refreshTokenSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
