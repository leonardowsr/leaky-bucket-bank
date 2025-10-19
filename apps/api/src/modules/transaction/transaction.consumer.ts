import { configuration } from "@api/config/configuration";
import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { ChannelWrapper } from "amqp-connection-manager";
import { UpdateTransactionDto } from "../transaction/dto/create-transaction.dto";
import { TransactionConsumerService } from "./transaction-consumer.service";

@Controller()
export class TransactionConsumer {
	constructor(
		private readonly transactionConsumerService: TransactionConsumerService,
	) {}

	@EventPattern(configuration.rabbitmq.queue.transactionsCreated)
	async handleTransactionCreated(
		@Payload() data: UpdateTransactionDto,
		@Ctx() context: RmqContext,
	) {
		const channel: ChannelWrapper = context.getChannelRef();
		const originalMsg = context.getMessage();
		// faz uma simulação de tempo para ficar entre 1 e 2 segundos
		await new Promise((res) => setTimeout(res, Math.random() * 1000 + 1000));
		try {
			const result = await this.transactionConsumerService.consumer(data);
			channel.ack(originalMsg);
			return result;
		} catch (error) {
			console.error("Erro ao processar a mensagem:", error);
			channel.nack(originalMsg, false, false); // Rejeita a mensagem sem reencaminhamento
		}
	}
}
