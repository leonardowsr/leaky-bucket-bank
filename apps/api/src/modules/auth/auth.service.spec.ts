import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../_prisma/prisma.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
	let service: any;

	beforeEach(async () => {
		const mockPrismaService = {
			user: {
				findUnique: jest.fn(),
				create: jest.fn(),
			},
		};

		const mockJwtService = {
			sign: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
