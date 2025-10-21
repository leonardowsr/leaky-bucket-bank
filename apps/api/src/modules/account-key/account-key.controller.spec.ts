import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../_prisma/prisma.service";
import { AccountKeyController } from "./account-key.controller";
import { AccountKeyService } from "./account-key.service";

describe("AccountKeyController", () => {
	let controller: AccountKeyController;
	let service: any;

	beforeEach(async () => {
		const mockAccountKeyService = {
			create: jest.fn(),
			findAll: jest.fn(),
			findByKey: jest.fn(),
			findOne: jest.fn(),
			update: jest.fn(),
			remove: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AccountKeyController],
			providers: [
				{
					provide: AccountKeyService,
					useValue: mockAccountKeyService,
				},
				{
					provide: PrismaService,
					useValue: {
						user: { findUnique: jest.fn() },
					},
				},
			],
		}).compile();

		controller = module.get<AccountKeyController>(AccountKeyController);
		service = module.get<AccountKeyService>(AccountKeyService);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	it("should create an account key", async () => {
		const createDto = { key: "test-key", accountId: "account-id" };
		const result = { id: "key-id", ...createDto };

		service.create.mockResolvedValue(result);

		const response = await controller.create(createDto);

		expect(service.create).toHaveBeenCalledWith(createDto);
		expect(response).toEqual(result);
	});

	it("should find all account keys for user", async () => {
		const userId = "user-id";
		const keys = [{ id: "1", key: "key1" }];
		const mockRequest = { user: { sub: userId } } as any;

		service.findAll.mockResolvedValue(keys);

		const result = await controller.findAll(mockRequest);

		expect(service.findAll).toHaveBeenCalledWith(userId);
		expect(result).toEqual(keys);
	});

	it("should find account key by key value", async () => {
		const key = "test-key";
		const result = {
			id: "key-id",
			key,
			accountId: "account-id",
			accountNumber: "12345",
			recipientName: "John Doe",
			createdAt: new Date(),
		};

		service.findByKey.mockResolvedValue(result);

		const response = await controller.findByKey(key);

		expect(service.findByKey).toHaveBeenCalledWith(key);
		expect(response).toEqual(result);
	});

	it("should find one account key", async () => {
		const id = "key-id";
		const result = { id, key: "test-key" };

		service.findOne.mockResolvedValue(result);

		const response = await controller.findOne(id);

		expect(service.findOne).toHaveBeenCalledWith(id);
		expect(response).toEqual(result);
	});

	it("should update an account key", async () => {
		const id = "key-id";
		const updateDto = { key: "new-key" };
		const result = { id, ...updateDto };

		service.update.mockResolvedValue(result);

		const response = await controller.update(id, updateDto);

		expect(service.update).toHaveBeenCalledWith(id, updateDto);
		expect(response).toEqual(result);
	});

	it("should remove an account key", async () => {
		const id = "key-id";
		const result = { id };

		service.remove.mockResolvedValue(result);

		const response = await controller.remove(id);

		expect(service.remove).toHaveBeenCalledWith(id);
		expect(response).toEqual(result);
	});
});
