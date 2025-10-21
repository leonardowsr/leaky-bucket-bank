import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../_prisma/prisma.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

describe("UserController", () => {
	let controller: UserController;

	beforeEach(async () => {
		const mockPrismaService = {
			user: {
				findMany: jest.fn(),
				findUnique: jest.fn(),
			},
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				UserService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		controller = module.get<UserController>(UserController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
