import { Module } from "@nestjs/common";
import { PrismaModule } from "../_prisma/prisma.module";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";

@Module({
	controllers: [AccountController],
	providers: [AccountService],
	imports: [PrismaModule],

	exports: [AccountService],
})
export class AccountModule {}
