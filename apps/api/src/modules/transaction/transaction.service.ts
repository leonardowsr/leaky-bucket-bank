import {
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common";
import { PrismaService } from "../_prisma/prisma.service";
import {
	CreateTransactionDto,
	UpdateTransactionDto,
} from "./dto/create-transaction.dto";

@Injectable()
export class TransactionService {
	constructor(private prisma: PrismaService) {}

	async updateStatus(id: string, status: "approved" | "recused") {
		return this.prisma.transaction.update({
			where: { id },
			data: {
				status,
			},
		});
	}

	async createPendingTransaction(createTransactionDto: CreateTransactionDto) {
		return this.prisma.transaction.create({
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
	}

	async updateTransaction(updateTransactionDto: UpdateTransactionDto) {
		const { transaction } = await this.prisma.$transaction(async (ctx) => {
			const updatedSender = await ctx.account.update({
				where: { id: updateTransactionDto.senderId },
				data: {
					balance: {
						decrement: updateTransactionDto.amount,
					},
				},
			});

			const updatedReceiver = await ctx.account.update({
				where: { id: updateTransactionDto.receiverId },
				data: {
					balance: {
						increment: updateTransactionDto.amount,
					},
				},
			});

			const transaction = await ctx.transaction.update({
				where: { id: updateTransactionDto.transactionId },
				data: {
					amount: updateTransactionDto.amount,
					receiver: {
						connect: { id: updateTransactionDto.receiverId },
					},
					sender: {
						connect: { id: updateTransactionDto.senderId },
					},
				},
			});

			return { updatedSender, updatedReceiver, transaction };
		});
		return transaction;
	}

	async validateTransaction(createTransactionDto: CreateTransactionDto) {
		const [sender, receiver] = await Promise.all([
			this.prisma.account.findUnique({
				where: { id: createTransactionDto.senderId, deletedAt: null },
				select: { balance: true, id: true, userId: true },
			}),
			this.prisma.account.findUnique({
				where: { id: createTransactionDto.receiverId, deletedAt: null },
				select: { balance: true, id: true },
			}),
		]);

		if (!sender) throw new NotFoundException("Sender não encontrado");
		if (!receiver) throw new NotFoundException("Receiver não encontrado");

		if (sender.balance < createTransactionDto.amount)
			throw new UnprocessableEntityException("Saldo insuficiente");
	}

	async findAll() {
		return await this.prisma.transaction.findMany({
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

	async findAllByAccount(
		accountId: string,
		limit = 100,
		page = 1,
		type?: "sent" | "received",
	) {
		const accountExists = await this.prisma.account.findUnique({
			where: { id: accountId, deletedAt: null },
		});

		if (!accountExists) {
			throw new NotFoundException("Account não encontrado");
		}

		const where =
			type === "sent"
				? { senderId: accountId }
				: type === "received"
					? { receiverId: accountId }
					: { OR: [{ senderId: accountId }, { receiverId: accountId }] };

		return this.prisma.transaction.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: "desc" },
			select: {
				amount: true,
				id: true,
				createdAt: true,
				senderId: true,
				receiverId: true,
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

	async transactionStatusUpdateMapper(transactionId: string) {
		const transaction = await this.prisma.transaction.findUnique({
			where: { id: transactionId },
			select: {
				status: true,
			},
		});

		if (!transaction) {
			throw new NotFoundException("Transação não encontrada");
		}

		return { status: transaction.status };
	}
}
