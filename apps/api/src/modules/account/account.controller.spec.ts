import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";

describe("AccountController", () => {
	let controller: AccountController;
	let service: AccountService;

	beforeEach(async () => {
		const mockAccountService = {
			findAll: jest.fn().mockResolvedValue([{ id: "1", balance: 1000 }]),
			findMe: jest.fn().mockResolvedValue({ id: "user-1", balance: 500 }),
			create: jest.fn(),
			findOne: jest.fn(),
			update: jest.fn(),
			remove: jest.fn(),
			loanRequest: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AccountController],
			providers: [
				{
					provide: AccountService,
					useValue: mockAccountService,
				},
			],
		}).compile();

		controller = module.get<AccountController>(AccountController);
		service = module.get<AccountService>(AccountService);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	it("should return all accounts", async () => {
		const result = await controller.findAll();
		expect(result).toEqual([{ id: "1", balance: 1000 }]);
		expect(service.findAll).toHaveBeenCalled();
	});

	it("should return the user's account", async () => {
		const mockRequest = { user: { sub: "user-1" } } as any;
		const result = await controller.findMeAccount(mockRequest);
		expect(result).toEqual({ id: "user-1", balance: 500 });
		expect(service.findMe).toHaveBeenCalledWith("user-1");
	});

	it("should throw BadRequestException if user ID missing", () => {
		const mockRequest = { user: null } as any;
		expect(() => controller.findMeAccount(mockRequest)).toThrow(
			BadRequestException,
		);
	});
});
