import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../_prisma/prisma.service";
import {
	CreateAccountKeyDto,
	UpdateAccountKeyDto,
} from "./dto/create-account-key.dto";

@Injectable()
export class AccountKeyService {
	constructor(private readonly prisma: PrismaService) {}
	async create(createAccountKeyDto: CreateAccountKeyDto) {
		const [keyExists, account] = await Promise.all([
			this.prisma.accountKey.findUnique({
				where: { key: createAccountKeyDto.key },
			}),
			this.prisma.account.findUnique({
				where: { id: createAccountKeyDto.accountId },
			}),
		]);

		if (!account) {
			throw new NotFoundException("Conta não encontrada");
		}
		if (keyExists) {
			throw new BadRequestException("Chave pix já cadastrada");
		}

		const accountKey = await this.prisma.accountKey.create({
			data: {
				key: createAccountKeyDto.key,
				accountId: createAccountKeyDto.accountId,
			},
		});

		return accountKey;
	}

	findAll(userId: string) {
		return this.prisma.accountKey.findMany({
			where: {
				account: {
					userId: userId,
					deletedAt: null,
				},
			},
		});
	}

	async findByKey(key: string) {
		const accountKey = await this.prisma.accountKey.findUnique({
			where: { key: key, deletedAt: null },
			include: {
				account: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});

		if (!accountKey) {
			throw new NotFoundException("Destinatário da chave pix não encontrado");
		}

		return {
			id: accountKey.id,
			key: accountKey.key,
			accountId: accountKey.accountId,
			accountNumber: accountKey.account.accountNumber,
			recipientName: accountKey.account.user.name,
			createdAt: accountKey.createdAt,
		};
	}

	async findOne(id: string) {
		await this.checkIfKeyExists(id);
		return this.prisma.accountKey.findUnique({
			where: { id: id, deletedAt: null },
		});
	}

	async update(id: string, updateAccountKeyDto: UpdateAccountKeyDto) {
		await this.checkIfKeyExists(id);
		return this.prisma.accountKey.update({
			where: { id: id, deletedAt: null },
			data: updateAccountKeyDto,
		});
	}

	async remove(id: string) {
		await this.checkIfKeyExists(id);
		return this.prisma.accountKey.delete({
			where: { id: id, deletedAt: null },
		});
	}

	private async checkIfKeyExists(id: string) {
		const accountKey = this.prisma.accountKey.findUnique({
			where: { id: id, deletedAt: null },
		});
		if (!accountKey) {
			throw new NotFoundException("Chave pix não encontrada");
		}
		return accountKey;
	}
}
