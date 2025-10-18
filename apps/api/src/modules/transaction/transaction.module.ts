import { Module } from "@nestjs/common";
import { RabbitmqModule } from "../_rabbitmq/rabbitmq.module";
import { TransactionConsumer } from "./transaction.consumer";
import { TransactionController } from "./transaction.controller";
import { TransactionService } from "./transaction.service";
import { TransactionConsumerService } from "./transaction-consumer.service";

@Module({
	imports: [RabbitmqModule],
	providers: [TransactionService, TransactionConsumerService],
	exports: [TransactionService],
	controllers: [TransactionController, TransactionConsumer],
})
export class TransactionModule {}
