import { z } from "zod";

/**
 * Schema base do User com todas as propriedades
 */
export const userSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1, "Nome é obrigatório"),
	email: z.string().email("Email inválido"),
	password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
	tokenCount: z.number().int().default(10),
	usedTokenAt: z.date(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

/**
 * Schema para criar um User (omite campos auto-gerados)
 */
export const createUserSchema = userSchema.omit({
	id: true,
	tokenCount: true,
	usedTokenAt: true,
	createdAt: true,
	updatedAt: true,
});

/**
 * Schema para atualizar um User (todos os campos opcionais exceto id)
 */
export const updateUserSchema = userSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	})
	.partial();

/**
 * Schema para login (apenas email e password)
 */
export const loginUserSchema = userSchema.pick({
	email: true,
	password: true,
});

/**
 * Schema para resposta pública (sem password)
 */
export const publicUserSchema = userSchema.omit({
	password: true,
});

/**
 * Types inferidos dos schemas
 */
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
