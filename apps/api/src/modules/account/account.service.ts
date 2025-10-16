import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prismaModule/prisma.service";
import { CreateAccountDto, UpdateAccountDto } from "./dto/account.dto";

@Injectable()
export class AccountService {
	constructor(private prisma: PrismaService) {}
	create(createAccountDto: CreateAccountDto) {
		const randomAccountNumber = Math.floor(100000 + Math.random() * 900000);
		createAccountDto.accountNumber = randomAccountNumber.toString();

		return this.prisma.account.create({
			data: {
				accountNumber: createAccountDto.accountNumber,
				userId: createAccountDto.userId,
				balance: createAccountDto.balance,
			},
		});
	}

	findAll() {
		return this.prisma.account.findMany({
			where: {
				deletedAt: null,
			},
		});
	}

	findAllByUser(userId: string) {
		return this.prisma.account.findMany({
			where: { userId, deletedAt: null },
			select: {
				accountNumber: true,
				balance: true,
				id: true,
				userId: true,
			},
		});
	}

	findOne(id: string) {
		this.checkAccountIsActive(id);
		return this.prisma.account.findUnique({
			where: { id },
			select: {
				accountNumber: true,
				balance: true,
				id: true,
				userId: true,
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
}
