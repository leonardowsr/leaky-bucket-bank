import { PrismaModule } from "@api/modules/prismaModule/prisma.module";
import { UserModule } from "@api/modules/user/user.module";
import { AuthModule } from "@modules/auth/auth.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { configuration } from "./config/configuration";
import { AccountModule } from "./modules/account/account.module";
import { TransactionController } from "./modules/transaction/transaction.controller";
import { TransactionModule } from "./modules/transaction/transaction.module";

@Module({
	imports: [
		ClientsModule.register([
			{
				name: "RABBITMQ_SERVICE",
				transport: Transport.RMQ,
				options: {
					urls: [configuration.rabbitmq.url],
					queue: configuration.rabbitmq.queue.transactions,
					queueOptions: {
						durable: true,
					},
				},
			},
		]),
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
	controllers: [TransactionController],
})
export class AppModule {}
