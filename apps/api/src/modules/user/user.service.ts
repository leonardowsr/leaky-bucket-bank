import { PrismaService } from "@api/modules/prismaModule/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async findAll(query: { page?: number; limit?: number }) {
		const users = await this.prisma.user.findMany({
			skip: (query.page || 1 - 1) * (query.limit || 10),
			take: query.limit || 10,
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				email: true,
				name: true,
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
