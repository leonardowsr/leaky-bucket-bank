import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../_prisma/prisma.service";
import { UserService } from "./user.service";

describe("UserService", () => {
	let service: any;
	let _prisma: any;

	beforeEach(async () => {
		const mockPrismaService = {
			user: {
				findMany: jest.fn(),
				findUnique: jest.fn(),
			},
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		service = module.get<UserService>(UserService);
		_prisma = module.get<PrismaService>(PrismaService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
