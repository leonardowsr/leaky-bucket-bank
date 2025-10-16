import { PrismaClient } from "@db/generated/client";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor() {
		super({
			adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
		});
	}
	async onModuleInit() {
		await this.$connect();
	}
}
