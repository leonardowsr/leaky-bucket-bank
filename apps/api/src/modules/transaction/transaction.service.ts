import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prismaModule/prisma.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";

@Injectable()
export class TransactionService {
	constructor(private prisma: PrismaService) {}
	async create(createTransactionDto: CreateTransactionDto) {
		const { transaction } = await this.prisma.$transaction(async (ctx) => {
			const sender = await ctx.account.findUnique({
				where: { id: createTransactionDto.senderId, deletedAt: null },
				select: { balance: true, id: true, userId: true },
			});
			if (!sender) {
				throw new NotFoundException("Sender não encontrado");
			}

			if (sender.balance < createTransactionDto.amount) {
				throw new NotFoundException("Saldo insuficiente");
			}

			const receiver = await ctx.account.findUnique({
				where: { id: createTransactionDto.receiverId, deletedAt: null },
				select: { balance: true, id: true },
			});

			if (!receiver) {
				throw new NotFoundException("Receiver não encontrado");
			}

			await ctx.user.update({
				where: { id: sender.userId },
				data: { usedTokenAt: new Date() },
			});

			const updatedSender = await ctx.account.update({
				where: { id: createTransactionDto.senderId },
				data: {
					balance: {
						decrement: createTransactionDto.amount,
					},
				},
			});

			const updatedReceiver = await ctx.account.update({
				where: { id: createTransactionDto.receiverId },
				data: {
					balance: {
						increment: createTransactionDto.amount,
					},
				},
			});

			const transaction = await ctx.transaction.create({
				data: {
					amount: createTransactionDto.amount,
					receiver: {
						connect: { id: createTransactionDto.receiverId },
					},
					sender: {
						connect: { id: createTransactionDto.senderId },
					},
				},
			});

			return { updatedSender, updatedReceiver, transaction };
		});
		return transaction;
	}

	findAll() {
		return this.prisma.transaction.findMany({
			orderBy: { createdAt: "desc" },
			select: {
				amount: true,
				id: true,
				createdAt: true,
				receiver: {
					select: {
						accountNumber: true,
						id: true,
						user: {
							select: { id: true, name: true },
						},
					},
				},
			},
		});
	}

	findAllByAccount(accountId: string) {
		const accountExists = this.prisma.account.findUnique({
			where: { id: accountId, deletedAt: null },
		});

		if (!accountExists) {
			throw new NotFoundException("Account não encontrado");
		}

		return this.prisma.transaction.findMany({
			where: {
				senderId: accountId,
			},
			orderBy: { createdAt: "desc" },
			select: {
				amount: true,
				id: true,
				createdAt: true,
				receiver: {
					select: {
						accountNumber: true,
						id: true,
						user: {
							select: { id: true, name: true },
						},
					},
				},
			},
		});
	}
	findOne(id: string) {
		return this.prisma.transaction.findUnique({
			where: { id },
			select: {
				amount: true,
				id: true,
				createdAt: true,
				receiver: {
					select: {
						accountNumber: true,
						id: true,
						user: {
							select: { id: true, name: true },
						},
					},
				},
				sender: {
					select: {
						accountNumber: true,
						id: true,
						user: {
							select: { id: true, name: true },
						},
					},
				},
			},
		});
	}
}
