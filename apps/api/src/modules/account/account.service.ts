import { generateAccoutNumber } from "@api/lib/utils";
import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../_prisma/prisma.service";
import { CreateAccountDto, UpdateAccountDto } from "./dto/account.dto";

@Injectable()
export class AccountService {
	constructor(private prisma: PrismaService) {}
	async create(createAccountDto: CreateAccountDto, userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});
		if (!user) {
			throw new NotFoundException("User não encontrado");
		}

		const existingAccount = await this.prisma.account.findUnique({
			where: { userId },
		});

		if (existingAccount) {
			throw new ConflictException(
				"Usuário já possui uma conta. Cada usuário pode ter apenas uma conta.",
			);
		}

		const randomAccountNumber = generateAccoutNumber();

		return this.prisma.account.create({
			data: {
				accountNumber: randomAccountNumber,
				userId: userId,
				balance: createAccountDto.balance,
			},
		});
	}

	findAll() {
		return this.prisma.account.findMany({
			where: {
				deletedAt: null,
			},
			include: {
				accountKeys: {
					where: {
						deletedAt: null,
					},
				},
			},
		});
	}

	async findMe(userId: string) {
		const account = await this.prisma.account.findUnique({
			where: { userId },
			select: {
				accountNumber: true,
				balance: true,
				id: true,
				userId: true,
				accountKeys: {
					where: {
						deletedAt: null,
					},
					select: {
						id: true,
						key: true,
						createdAt: true,
					},
				},
			},
		});

		if (!account) {
			throw new NotFoundException("Conta não encontrada para este usuário");
		}

		return account;
	}

	async findOne(id: string) {
		await this.checkAccountIsActive(id);
		return this.prisma.account.findUnique({
			where: { id },
			select: {
				accountNumber: true,
				balance: true,
				id: true,
				userId: true,
				accountKeys: {
					where: {
						deletedAt: null,
					},
					select: {
						id: true,
						key: true,
						createdAt: true,
					},
				},
			},
		});
	}

	async update(id: string, updateAccountDto: UpdateAccountDto) {
		this.checkAccountIsActive(id);

		return this.prisma.account.update({
			where: { id },
			data: updateAccountDto,
		});
	}

	remove(id: string) {
		return this.prisma.account.update({
			where: { id },
			data: {
				deletedAt: new Date(),
			},
		});
	}

	private async checkAccountIsActive(accountId: string) {
		const account = await this.prisma.account.findUnique({
			where: { id: accountId },
			select: { deletedAt: true },
		});
		if (!account || account.deletedAt) {
			throw new NotFoundException("Account não encontrada ou inativa");
		}
	}

	async loanRequest(accountId: string) {
		const account = await this.prisma.account.findUnique({
			where: { id: accountId, deletedAt: null },
		});
		if (!account) {
			throw new NotFoundException("Account não encontrada ou inativa");
		}

		await this.prisma.account.update({
			where: { id: accountId },
			data: {
				balance: {
					increment: 1000000, // Exemplo: adicionar R$1.000,00 ao saldo
				},
			},
		});

		return { message: "Empréstimo aprovado e saldo atualizado com sucesso." };
	}
}
