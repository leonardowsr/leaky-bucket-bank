import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../modules/_prisma/prisma.service";
import { LeakyBucketGuard } from "./leaky-bucket.guard";

describe("LeakyBucketGuard", () => {
	let guard: LeakyBucketGuard;
	let prisma: any;

	beforeEach(async () => {
		const mockPrismaService = {
			user: {
				findUnique: jest.fn(),
			},
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LeakyBucketGuard,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		guard = module.get<LeakyBucketGuard>(LeakyBucketGuard);
		prisma = module.get<PrismaService>(PrismaService);
	});

	it("should be defined", () => {
		expect(guard).toBeDefined();
	});

	it("should allow access when user has tokens", async () => {
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => ({ user: { sub: "user-id" } }),
			}),
		} as any;

		const user = {
			id: "user-id",
			tokenCount: 5,
			usedTokenAt: new Date(Date.now() - 3600000), // 1 hour ago
		};

		prisma.user.findUnique.mockResolvedValue(user);

		const result = await guard.canActivate(mockContext);

		expect(result).toBe(true);
		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: "user-id" },
		});
	});

	it("should deny access when user has no tokens", async () => {
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => ({ user: { sub: "user-id" } }),
			}),
		} as any;

		const user = {
			id: "user-id",
			tokenCount: 0,
			usedTokenAt: new Date(),
		};

		prisma.user.findUnique.mockResolvedValue(user);

		await expect(guard.canActivate(mockContext)).rejects.toThrow(
			new HttpException(
				"Limite de requisições excedido. Tente novamente mais tarde.",
				HttpStatus.TOO_MANY_REQUESTS,
			),
		);
	});

	it("should deny access when user not found", async () => {
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => ({ user: { sub: "invalid-user" } }),
			}),
		} as any;

		prisma.user.findUnique.mockResolvedValue(null);

		const result = await guard.canActivate(mockContext);

		expect(result).toBe(false);
	});

	it("should allow access when no user in request", async () => {
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => ({ user: null }),
			}),
		} as any;

		const result = await guard.canActivate(mockContext);

		expect(result).toBe(false);
	});
});
