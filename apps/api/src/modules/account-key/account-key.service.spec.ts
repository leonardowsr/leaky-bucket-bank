import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../_prisma/prisma.service";
import { AccountKeyService } from "./account-key.service";

describe("AccountKeyService", () => {
	let service: any;
	let prisma: any;

	beforeEach(async () => {
		const mockPrismaService = {
			accountKey: {
				findUnique: jest.fn(),
				create: jest.fn(),
				findMany: jest.fn(),
				update: jest.fn(),
				delete: jest.fn(),
			},
			account: {
				findUnique: jest.fn(),
			},
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AccountKeyService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		service = module.get<AccountKeyService>(AccountKeyService);
		prisma = module.get<PrismaService>(PrismaService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should create an account key", async () => {
		const createDto = { key: "test-key", accountId: "account-id" };
		const account = { id: "account-id" };
		const accountKey = { id: "key-id", ...createDto };

		prisma.accountKey.findUnique.mockResolvedValue(null);
		prisma.account.findUnique.mockResolvedValue(account);
		prisma.accountKey.create.mockResolvedValue(accountKey);

		const result = await service.create(createDto);

		expect(result).toEqual(accountKey);
	});

	it("should throw BadRequestException if key already exists", async () => {
		const createDto = { key: "existing-key", accountId: "account-id" };
		const existingKey = { id: "existing-id", key: "existing-key" };
		const account = { id: "account-id" };

		prisma.accountKey.findUnique.mockResolvedValue(existingKey);
		prisma.account.findUnique.mockResolvedValue(account);

		await expect(service.create(createDto)).rejects.toThrow(
			BadRequestException,
		);
	});

	it("should throw NotFoundException if account not found", async () => {
		const createDto = { key: "test-key", accountId: "invalid-account" };

		prisma.accountKey.findUnique.mockResolvedValue(null);
		prisma.account.findUnique.mockResolvedValue(null);

		await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
	});

	it("should find all account keys for user", async () => {
		const userId = "user-id";
		const keys = [{ id: "1", key: "key1" }];

		prisma.accountKey.findMany.mockResolvedValue(keys);

		const result = await service.findAll(userId);

		expect(result).toEqual(keys);
	});

	it("should find account key by key value", async () => {
		const key = "test-key";
		const accountKey = {
			id: "key-id",
			key,
			accountId: "account-id",
			account: {
				accountNumber: "12345",
				user: { name: "John Doe" },
			},
			createdAt: new Date(),
		};

		prisma.accountKey.findUnique.mockResolvedValue(accountKey);

		const result = await service.findByKey(key);

		expect(result).toEqual({
			id: "key-id",
			key,
			accountId: "account-id",
			accountNumber: "12345",
			recipientName: "John Doe",
			createdAt: accountKey.createdAt,
		});
	});

	it("should throw NotFoundException if key not found", async () => {
		const key = "non-existent-key";

		prisma.accountKey.findUnique.mockResolvedValue(null);

		await expect(service.findByKey(key)).rejects.toThrow(NotFoundException);
	});

	it("should find one account key", async () => {
		const id = "key-id";
		const accountKey = { id, key: "test-key" };

		prisma.accountKey.findUnique.mockResolvedValue(accountKey);

		const result = await service.findOne(id);

		expect(result).toEqual(accountKey);
	});

	it("should update an account key", async () => {
		const id = "key-id";
		const updateDto = { key: "new-key" };
		const updatedKey = { id, ...updateDto };

		prisma.accountKey.findUnique.mockResolvedValue({ id });
		prisma.accountKey.update.mockResolvedValue(updatedKey);

		const result = await service.update(id, updateDto);

		expect(result).toEqual(updatedKey);
	});

	it("should remove an account key", async () => {
		const id = "key-id";
		const accountKey = { id, key: "test-key" };

		prisma.accountKey.findUnique.mockResolvedValue({ id });
		prisma.accountKey.delete.mockResolvedValue(accountKey);

		const result = await service.remove(id);

		expect(result).toEqual(accountKey);
	});
});
