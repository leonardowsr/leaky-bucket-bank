import { PrismaModule } from "@api/modules/_prisma/prisma.module";
import { UserModule } from "@api/modules/user/user.module";
import { AuthModule } from "@modules/auth/auth.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AccountModule } from "./modules/account/account.module";
import { TransactionModule } from "./modules/transaction/transaction.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
		}),
		AuthModule,
		UserModule,
		PrismaModule,
		AccountModule,
		TransactionModule,
	],
})
export class AppModule {}
