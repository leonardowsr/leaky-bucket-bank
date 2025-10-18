import { configuration } from "@api/config/configuration";
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
	imports: [
		ClientsModule.register([
			{
				name: configuration.rabbitmq.injection_name,
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
	],
	exports: [ClientsModule],
})
export class RabbitmqModule {}
