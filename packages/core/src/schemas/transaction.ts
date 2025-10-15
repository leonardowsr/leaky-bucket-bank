import { z } from "zod";

/**
 * Schema base do Transaction com todas as propriedades
 */
export const transactionSchema = z.object({
	id: z.string().uuid(),
	amount: z.number().int().positive("Valor deve ser positivo"),
	senderId: z.string().uuid(),
	receiverId: z.string().uuid(),
	createdAt: z.date(),
});

/**
 * Schema para criar uma Transaction (omite campos auto-gerados)
 */
export const createTransactionSchema = transactionSchema.omit({
	id: true,
	createdAt: true,
});

/**
 * Schema para transferência entre contas
 */
export const transferSchema = z.object({
	fromAccountId: z.string().uuid(),
	toAccountId: z.string().uuid(),
	amount: z.number().int().positive("Valor deve ser positivo"),
});

/**
 * Schema para consultar extrato (filtros opcionais)
 */
export const transactionFilterSchema = z.object({
	accountId: z.string().uuid(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	minAmount: z.number().int().optional(),
	maxAmount: z.number().int().optional(),
});

/**
 * Schema para resposta de Transaction com detalhes
 */
export const transactionWithDetailsSchema = transactionSchema.extend({
	senderAccountNumber: z.string(),
	receiverAccountNumber: z.string(),
	type: z.enum(["SENT", "RECEIVED"]).optional(), // Para identificar tipo na perspectiva do usuário
});

/**
 * Types inferidos dos schemas
 */
export type Transaction = z.infer<typeof transactionSchema>;
export type CreateTransaction = z.infer<typeof createTransactionSchema>;
export type Transfer = z.infer<typeof transferSchema>;
export type TransactionFilter = z.infer<typeof transactionFilterSchema>;
export type TransactionWithDetails = z.infer<
	typeof transactionWithDetailsSchema
>;
