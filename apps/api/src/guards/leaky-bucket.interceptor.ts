import { PrismaService } from "@api/modules/_prisma/prisma.service";
import {
	CallHandler,
	ExecutionContext,
	HttpStatus,
	Injectable,
	NestInterceptor,
} from "@nestjs/common";
import { Request, Response } from "express";
import { from, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";

@Injectable()
export class LeakyBucketInterceptor implements NestInterceptor {
	constructor(private readonly prisma: PrismaService) {}

	intercept(context: ExecutionContext, next: CallHandler) {
		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();
		const userId = request?.user?.sub;

		if (!userId) return next.handle();

		return next.handle().pipe(
			switchMap(async (data) => {
				const user = await this.prisma.user.findUnique({
					where: { id: userId },
				});
				if (user) {
					this.setRateLimitHeaders(response, user.tokenCount, user.usedTokenAt);
				}
				return data;
			}),

			catchError((err) => {
				// apenas decrementa o token se for erro conhecido do cliente
				const shouldConsumeToken =
					[HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST].includes(err.status) ||
					err.name === "NotFoundException" ||
					err.name === "BadRequestException";

				if (!shouldConsumeToken) {
					return throwError(() => err);
				}

				return from(
					this.prisma.user.update({
						where: { id: userId },
						data: {
							tokenCount: { decrement: 1 },
							usedTokenAt: new Date(),
						},
					}),
				).pipe(
					// mesmo se der erro no update, o erro original deve subir
					catchError(() => throwError(() => err)),
					switchMap(async (user) => {
						this.setRateLimitHeaders(
							response,
							user.tokenCount,
							user.usedTokenAt,
						);

						if (user.tokenCount <= 0) {
							const retryAfter = this.calcNextTokenSeconds(user.usedTokenAt);

							response
								.status(HttpStatus.TOO_MANY_REQUESTS)
								.setHeader("Retry-After", retryAfter)
								.json({
									type: "https://bacen.gov.br/errors/rate-limit",
									title: "Too Many Requests",
									status: 429,
									detail:
										"Limite de requisições excedido. Tente novamente mais tarde.",
								});
						}

						throw err;
					}),
				);
			}),
		);
	}

	private setRateLimitHeaders(
		res: Response,
		tokenCount: number,
		usedTokenAt: Date,
	) {
		const remaining = Math.max(tokenCount, 0);
		const resetSeconds = this.calcNextTokenSeconds(usedTokenAt);
		res.setHeader("X-RateLimit-Limit", 10);
		res.setHeader("X-RateLimit-Remaining", remaining);
		res.setHeader("X-RateLimit-Reset", resetSeconds);
	}

	private calcNextTokenSeconds(usedTokenAt: Date): number {
		const nextTokenTime = new Date(usedTokenAt.getTime() + 3600000); // 1h
		const diff = Math.ceil((nextTokenTime.getTime() - Date.now()) / 1000);
		return Math.max(diff, 0);
	}
}
