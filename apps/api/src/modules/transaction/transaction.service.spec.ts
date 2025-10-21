import {
	NotFoundException,
	UnprocessableEntityException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../_prisma/prisma.service";
import { TransactionService } from "./transaction.service";

describe("TransactionService", () => {
	let service: any;
	let prisma: any;

	beforeEach(async () => {
		const mockPrismaService = {
			transaction: {
				update: jest.fn(),
				create: jest.fn(),
				findMany: jest.fn(),
				findUnique: jest.fn(),
			},
			account: {
				findUnique: jest.fn(),
				update: jest.fn(),
			},
			accountKey: {
				findUnique: jest.fn(),
			},
			$transaction: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TransactionService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		service = module.get<TransactionService>(TransactionService);
		prisma = module.get<PrismaService>(PrismaService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should update transaction status", async () => {
		const id = "trans-id";
		const status = "approved";
		const updatedTransaction = { id, status };

		prisma.transaction.update.mockResolvedValue(updatedTransaction);

		const result = await service.updateStatus(id, status);

		expect(prisma.transaction.update).toHaveBeenCalledWith({
			where: { id },
			data: { status },
		});
		expect(result).toEqual(updatedTransaction);
	});

	it("should create pending transaction", async () => {
		const createDto = {
			senderId: "sender-id",
			receiverKey: "receiver-key",
			amount: 100,
		};
		const accountKey = { account: { id: "receiver-id" } };
		const transaction = { id: "trans-id", amount: 100 };

		prisma.accountKey.findUnique.mockResolvedValue(accountKey);
		prisma.transaction.create.mockResolvedValue(transaction);

		const result = await service.createPendingTransaction(createDto);

		expect(prisma.accountKey.findUnique).toHaveBeenCalledWith({
			where: { key: createDto.receiverKey, deletedAt: null },
			select: { account: { select: { id: true, deletedAt: true } } },
		});
		expect(prisma.transaction.create).toHaveBeenCalledWith({
			data: {
				amount: createDto.amount,
				receiver: { connect: { id: "receiver-id" } },
				sender: { connect: { id: createDto.senderId } },
			},
		});
		expect(result).toEqual(transaction);
	});

	it("should validate transaction successfully", async () => {
		const createDto = {
			senderId: "sender-id",
			receiverKey: "receiver-key",
			amount: 100,
		};
		const sender = { id: "sender-id", balance: 200, userId: "user-id" };
		const receiverAccountKey = {
			account: { id: "receiver-id", balance: 0, deletedAt: null },
		};

		prisma.account.findUnique.mockResolvedValue(sender);
		prisma.accountKey.findUnique.mockResolvedValue(receiverAccountKey);

		await expect(
			service.validateTransaction(createDto),
		).resolves.toBeUndefined();
	});

	it("should throw NotFoundException for invalid sender", async () => {
		const createDto = {
			senderId: "invalid-sender",
			receiverKey: "receiver-key",
			amount: 100,
		};

		prisma.account.findUnique.mockResolvedValue(null);

		await expect(service.validateTransaction(createDto)).rejects.toThrow(
			NotFoundException,
		);
	});

	it("should throw UnprocessableEntityException for insufficient balance", async () => {
		const createDto = {
			senderId: "sender-id",
			receiverKey: "receiver-key",
			amount: 100,
		};
		const sender = { id: "sender-id", balance: 50, userId: "user-id" };
		const receiverAccountKey = {
			account: { id: "receiver-id", balance: 0, deletedAt: null },
		};

		prisma.account.findUnique.mockResolvedValue(sender);
		prisma.accountKey.findUnique.mockResolvedValue(receiverAccountKey);

		await expect(service.validateTransaction(createDto)).rejects.toThrow(
			UnprocessableEntityException,
		);
	});

	it("should find all transactions", async () => {
		const transactions = [{ id: "1", amount: 100 }];
		prisma.transaction.findMany.mockResolvedValue(transactions);

		const result = await service.findAll();

		expect(prisma.transaction.findMany).toHaveBeenCalledWith({
			orderBy: { createdAt: "desc" },
			select: {
				amount: true,
				id: true,
				createdAt: true,
				receiver: {
					select: {
						accountNumber: true,
						id: true,
						user: { select: { id: true, name: true } },
					},
				},
			},
		});
		expect(result).toEqual(transactions);
	});

	it("should find transactions by account", async () => {
		const accountId = "account-id";
		const transactions = [{ id: "1", amount: 100 }];
		const account = { id: accountId };

		prisma.account.findUnique.mockResolvedValue(account);
		prisma.transaction.findMany.mockResolvedValue(transactions);

		const result = await service.findAllByAccount(accountId);

		expect(result).toEqual(transactions);
	});

	it("should find one transaction", async () => {
		const id = "trans-id";
		const transaction = { id, amount: 100 };

		prisma.transaction.findUnique.mockResolvedValue(transaction);

		const result = await service.findOne(id);

		expect(result).toEqual(transaction);
	});

	it("should map transaction status", async () => {
		const transactionId = "trans-id";
		const transaction = { status: "approved" };

		prisma.transaction.findUnique.mockResolvedValue(transaction);

		const result = await service.transactionStatusUpdateMapper(transactionId);

		expect(result).toEqual({ status: "approved" });
	});
});
