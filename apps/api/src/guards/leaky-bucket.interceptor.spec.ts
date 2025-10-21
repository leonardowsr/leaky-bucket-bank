import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { of, throwError } from "rxjs";
import { PrismaService } from "../modules/_prisma/prisma.service";
import { LeakyBucketInterceptor } from "./leaky-bucket.interceptor";

describe("LeakyBucketInterceptor", () => {
	let interceptor: LeakyBucketInterceptor;
	let prisma: any;

	beforeEach(async () => {
		const mockPrismaService = {
			user: {
				findUnique: jest.fn(),
				update: jest.fn(),
			},
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LeakyBucketInterceptor,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		interceptor = module.get<LeakyBucketInterceptor>(LeakyBucketInterceptor);
		prisma = module.get<PrismaService>(PrismaService);
	});

	it("should be defined", () => {
		expect(interceptor).toBeDefined();
	});

	it("should set rate limit headers on successful response", (done) => {
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => ({ user: { sub: "user-id" } }),
				getResponse: () => ({
					setHeader: jest.fn(),
				}),
			}),
		} as any;

		const mockUser = {
			tokenCount: 5,
			usedTokenAt: new Date(),
		};

		prisma.user.findUnique.mockResolvedValue(mockUser);

		const next = {
			handle: () => of("success"),
		};

		interceptor.intercept(mockContext, next).subscribe({
			next: (result) => {
				expect(result).toBe("success");
				done();
			},
		});
	});

	it("should consume token on bad request error", (done) => {
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => ({ user: { sub: "user-id" } }),
				getResponse: () => ({
					setHeader: jest.fn(),
					status: jest.fn().mockReturnThis(),
					json: jest.fn(),
				}),
			}),
		} as any;

		const mockUser = {
			tokenCount: 5,
			usedTokenAt: new Date(),
		};

		const updatedUser = {
			tokenCount: 4,
			usedTokenAt: new Date(),
		};

		prisma.user.findUnique.mockResolvedValue(mockUser);
		prisma.user.update.mockResolvedValue(updatedUser);

		const next = {
			handle: () =>
				throwError(() => ({
					status: HttpStatus.BAD_REQUEST,
					name: "BadRequestException",
				})),
		};

		interceptor.intercept(mockContext, next).subscribe({
			error: (err) => {
				expect(err.status).toBe(HttpStatus.BAD_REQUEST);
				expect(prisma.user.update).toHaveBeenCalledWith({
					where: { id: "user-id" },
					data: {
						tokenCount: { decrement: 1 },
						usedTokenAt: expect.any(Date),
					},
				});
				done();
			},
		});
	});

	it("should set 429 status when token count reaches zero", (done) => {
		const mockResponse = {
			setHeader: jest.fn().mockReturnThis(),
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => ({ user: { sub: "user-id" } }),
				getResponse: () => mockResponse,
			}),
		} as any;

		const mockUser = {
			tokenCount: 1,
			usedTokenAt: new Date(),
		};

		const updatedUser = {
			tokenCount: 0,
			usedTokenAt: new Date(),
		};

		prisma.user.findUnique.mockResolvedValue(mockUser);
		prisma.user.update.mockResolvedValue(updatedUser);

		const next = {
			handle: () =>
				throwError(() => ({
					status: HttpStatus.BAD_REQUEST,
					name: "BadRequestException",
				})),
		};

		interceptor.intercept(mockContext, next).subscribe({
			error: () => {
				expect(mockResponse.status).toHaveBeenCalledWith(
					HttpStatus.TOO_MANY_REQUESTS,
				);
				expect(mockResponse.setHeader).toHaveBeenCalledWith(
					"Retry-After",
					expect.any(Number),
				);
				expect(mockResponse.json).toHaveBeenCalledWith({
					title: "Too Many Requests",
					status: 429,
					message:
						"Limite de requisições excedido. Tente novamente mais tarde.",
				});
				done();
			},
		});
	});

	it("should not consume token on non-client errors", (done) => {
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => ({ user: { sub: "user-id" } }),
				getResponse: () => ({
					setHeader: jest.fn(),
				}),
			}),
		} as any;

		const next = {
			handle: () =>
				throwError(() => ({ status: HttpStatus.INTERNAL_SERVER_ERROR })),
		};

		interceptor.intercept(mockContext, next).subscribe({
			error: (err) => {
				expect(err.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
				expect(prisma.user.update).not.toHaveBeenCalled();
				done();
			},
		});
	});

	it("should skip if no user in request", (done) => {
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => ({ user: null }),
				getResponse: () => ({
					setHeader: jest.fn(),
				}),
			}),
		} as any;

		const next = {
			handle: () => of("success"),
		};

		interceptor.intercept(mockContext, next).subscribe({
			next: (result) => {
				expect(result).toBe("success");
				expect(prisma.user.findUnique).not.toHaveBeenCalled();
				done();
			},
		});
	});
});
