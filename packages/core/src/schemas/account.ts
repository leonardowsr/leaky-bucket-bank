import { z } from "zod";

/**
 * Schema base do Account com todas as propriedades
 */
export const accountSchema = z.object({
	id: z.string().uuid(),
	accountNumber: z.string().min(1, "Número da conta é obrigatório"),
	balance: z.number().int().default(0),
	userId: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().nullable(),
});

/**
 * Schema para criar um Account (omite campos auto-gerados)
 */
export const createAccountSchema = accountSchema.omit({
	id: true,
	balance: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

/**
 * Schema para atualizar um Account
 */
export const updateAccountSchema = accountSchema
	.omit({
		id: true,
		userId: true,
		createdAt: true,
		updatedAt: true,
	})
	.partial();

/**
 * Schema para operações de depósito/saque
 */
export const accountOperationSchema = z.object({
	accountId: z.string().uuid(),
	amount: z.number().int().positive("Valor deve ser positivo"),
});

/**
 * Schema para resposta pública do Account
 */
export const publicAccountSchema = accountSchema.omit({
	deletedAt: true,
});

/**
 * Types inferidos dos schemas
 */
export type Account = z.infer<typeof accountSchema>;
export type CreateAccount = z.infer<typeof createAccountSchema>;
export type UpdateAccount = z.infer<typeof updateAccountSchema>;
export type AccountOperation = z.infer<typeof accountOperationSchema>;
export type PublicAccount = z.infer<typeof publicAccountSchema>;
