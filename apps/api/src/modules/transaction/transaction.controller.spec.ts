import { configuration } from "@api/config/configuration";
import { ClientProxy } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../_prisma/prisma.service";
import { TransactionController } from "./transaction.controller";
import { TransactionService } from "./transaction.service";

describe("TransactionController", () => {
	let controller: TransactionController;
	let service: any;
	let clientProxy: any;

	beforeEach(async () => {
		const mockTransactionService = {
			validateTransaction: jest.fn(),
			createPendingTransaction: jest.fn(),
			findAll: jest.fn(),
			findAllByAccount: jest.fn(),
			findOne: jest.fn(),
			transactionStatusUpdateMapper: jest.fn(),
		};

		const mockClientProxy = {
			emit: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [TransactionController],
			providers: [
				{
					provide: TransactionService,
					useValue: mockTransactionService,
				},
				{
					provide: configuration.rabbitmq.injection_name,
					useValue: mockClientProxy,
				},
				{
					provide: PrismaService,
					useValue: {
						user: { findUnique: jest.fn() },
					},
				},
			],
		}).compile();

		controller = module.get<TransactionController>(TransactionController);
		service = module.get<TransactionService>(TransactionService);
		clientProxy = module.get<ClientProxy>(
			configuration.rabbitmq.injection_name,
		);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	it("should create a transaction", async () => {
		const createDto = {
			senderId: "sender-id",
			receiverKey: "receiver-key",
			amount: 100,
		};
		const transaction = { id: "trans-id", status: "pending" };

		service.validateTransaction.mockResolvedValue(undefined);
		service.createPendingTransaction.mockResolvedValue(transaction);
		clientProxy.emit.mockReturnValue(undefined);

		const result = await controller.create(createDto);

		expect(service.validateTransaction).toHaveBeenCalledWith(createDto);
		expect(service.createPendingTransaction).toHaveBeenCalledWith(createDto);
		expect(clientProxy.emit).toHaveBeenCalledWith(
			configuration.rabbitmq.queue.transactionsCreated,
			{
				transactionId: transaction.id,
				...createDto,
			},
		);
		expect(result).toEqual({
			transactionId: transaction.id,
			status: transaction.status,
		});
	});

	it("should find all transactions", async () => {
		const transactions = [{ id: "1", amount: 100 }];
		service.findAll.mockResolvedValue(transactions);

		const result = await controller.findAll();

		expect(service.findAll).toHaveBeenCalled();
		expect(result).toEqual(transactions);
	});

	it("should find transactions by account", async () => {
		const accountId = "account-id";
		const transactions = [{ id: "1", amount: 100 }];
		service.findAllByAccount.mockResolvedValue(transactions);

		const result = await controller.findAllByAccount(accountId);

		expect(service.findAllByAccount).toHaveBeenCalledWith(
			accountId,
			undefined,
			undefined,
			undefined,
		);
		expect(result).toEqual(transactions);
	});

	it("should find one transaction", async () => {
		const id = "trans-id";
		const transaction = { id, amount: 100 };
		service.findOne.mockResolvedValue(transaction);

		const result = await controller.findOne(id);

		expect(service.findOne).toHaveBeenCalledWith(id);
		expect(result).toEqual(transaction);
	});

	it("should handle SSE for transaction status", async () => {
		const transactionId = "trans-id";
		const statusDto = { status: "pending" };

		service.transactionStatusUpdateMapper.mockResolvedValue(statusDto);

		const sse$ = await controller.sse(transactionId);

		expect(sse$).toBeDefined();
		expect(typeof sse$.subscribe).toBe("function");
	});
});
