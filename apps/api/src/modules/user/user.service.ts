import { PrismaService } from "@api/modules/_prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UserQueryDto } from "./dto/user-query.dto";

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async findAll(query: UserQueryDto) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 10;

		const users = await this.prisma.user.findMany({
			skip: (page - 1) * limit,
			take: limit,
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				email: true,
				name: true,
				account: {
					select: {
						accountNumber: true,
						balance: true,
						accountKeys: {
							where: {
								deletedAt: null,
							},
							select: {
								key: true,
							},
						},
					},
				},
			},
		});
		return users;
	}

	async findOne(id: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				id,
			},
			select: {
				id: true,
				email: true,
				name: true,
			},
		});

		if (!user) {
			throw new NotFoundException("Usuário não encontrado");
		}

		return user;
	}

	async findMe(id: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				id,
			},
			select: {
				id: true,
				tokenCount: true,
				usedTokenAt: true,
				email: true,
				name: true,
			},
		});

		if (!user) {
			throw new NotFoundException("Usuário não encontrado");
		}

		return user;
	}
}
