import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../_prisma/prisma.service";
import { AccountService } from "./account.service";

describe("AccountService", () => {
	let service: any;
	let prisma: any;

	beforeEach(async () => {
		const mockPrismaService = {
			user: {
				findUnique: jest.fn(),
			},
			account: {
				findUnique: jest.fn(),
				create: jest.fn(),
				findMany: jest.fn(),
				update: jest.fn(),
			},
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AccountService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		service = module.get<AccountService>(AccountService);
		prisma = module.get<PrismaService>(PrismaService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should create an account", async () => {
		const createDto = { balance: 1000 };
		const userId = "user-id";
		const user = { id: userId };
		const account = {
			id: "account-id",
			accountNumber: "12345",
			userId,
			balance: 1000,
		};

		prisma.user.findUnique.mockResolvedValue(user);
		prisma.account.findUnique.mockResolvedValue(null);
		prisma.account.create.mockResolvedValue(account);

		const result = await service.create(createDto, userId);

		expect(result).toEqual(account);
	});

	it("should throw NotFoundException if user not found", async () => {
		const createDto = { balance: 1000 };
		const userId = "invalid-user";

		prisma.user.findUnique.mockResolvedValue(null);

		await expect(service.create(createDto, userId)).rejects.toThrow(
			NotFoundException,
		);
	});

	it("should throw ConflictException if user already has account", async () => {
		const createDto = { balance: 1000 };
		const userId = "user-id";
		const user = { id: userId };
		const existingAccount = { id: "existing-account" };

		prisma.user.findUnique.mockResolvedValue(user);
		prisma.account.findUnique.mockResolvedValue(existingAccount);

		await expect(service.create(createDto, userId)).rejects.toThrow(
			ConflictException,
		);
	});

	it("should find all accounts", async () => {
		const accounts = [{ id: "1", balance: 1000 }];

		prisma.account.findMany.mockResolvedValue(accounts);

		const result = await service.findAll();

		expect(result).toEqual(accounts);
	});

	it("should find me account", async () => {
		const userId = "user-id";
		const account = {
			id: "account-id",
			accountNumber: "12345",
			balance: 1000,
			userId,
			accountKeys: [{ id: "key1", key: "test", createdAt: new Date() }],
		};

		prisma.account.findUnique.mockResolvedValue(account);

		const result = await service.findMe(userId);

		expect(result).toEqual(account);
	});

	it("should throw NotFoundException if account not found for user", async () => {
		const userId = "user-id";

		prisma.account.findUnique.mockResolvedValue(null);

		await expect(service.findMe(userId)).rejects.toThrow(NotFoundException);
	});

	it("should find one account", async () => {
		const id = "account-id";
		const account = { id, balance: 1000 };

		prisma.account.findUnique.mockResolvedValue(account);

		const result = await service.findOne(id);

		expect(result).toEqual(account);
	});

	it("should update an account", async () => {
		const id = "account-id";
		const updateDto = { balance: 2000 };
		const account = { id, deletedAt: null };
		const updatedAccount = { id, ...updateDto };

		prisma.account.findUnique.mockResolvedValue(account);
		prisma.account.update.mockResolvedValue(updatedAccount);

		const result = await service.update(id, updateDto);

		expect(result).toEqual(updatedAccount);
	});

	it("should remove an account (soft delete)", async () => {
		const id = "account-id";

		const result = await service.remove(id);

		expect(prisma.account.update).toHaveBeenCalledWith({
			where: { id },
			data: { deletedAt: expect.any(Date) },
		});
		expect(result).toBeUndefined();
	});

	it("should process loan request", async () => {
		const accountId = "account-id";
		const account = { id: accountId, deletedAt: null };

		prisma.account.findUnique.mockResolvedValue(account);
		prisma.account.update.mockResolvedValue({ ...account, balance: 1000000 });

		const result = await service.loanRequest(accountId);

		expect(result).toEqual({
			message: "Empréstimo aprovado e saldo atualizado com sucesso.",
		});
	});

	it("should throw NotFoundException for loan request on invalid account", async () => {
		const accountId = "invalid-account";

		prisma.account.findUnique.mockResolvedValue(null);

		await expect(service.loanRequest(accountId)).rejects.toThrow(
			NotFoundException,
		);
	});
});
