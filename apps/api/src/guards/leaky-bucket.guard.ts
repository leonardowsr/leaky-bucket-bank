import { PrismaService } from "@api/modules/_prisma/prisma.service";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class LeakyBucketGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}
	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<Request>();

		const userId = request.user.sub as string;

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});
		if (!user) {
			return false;
		}
		const { tokenCount, usedTokenAt } = user;

		if (!checkIfHasTokens(tokenCount, usedTokenAt)) {
			return false;
		}

		return true;
	}
}

const checkIfHasTokens = (tokenCount: number, usedTokenAt: Date) => {
	const now = new Date();
	const timeDiff = now.getTime() - usedTokenAt.getTime();
	const tokensToAdd = Math.floor(timeDiff / 3600000); // 1 token per hour
	const newTokenCount = Math.min(tokenCount + tokensToAdd, 10); // max 10 tokens

	return newTokenCount > 0;
};
