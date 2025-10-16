import * as fs from "node:fs";
import * as path from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { configuration } from "./config/configuration";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			queue: configuration.rabbitmq.queue.transactions,
			urls: [configuration.rabbitmq.url],
			queueOptions: {
				durable: true,
			},
			noAck: false,
		},
	});

	await app.startAllMicroservices();

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);

	const config = new DocumentBuilder()
		.setTitle("Bank Api")
		.setVersion("1.0")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				description: "Enter your token here",
				in: "header",
			},
			"JWT-auth",
		)
		.setDescription("API para gerenciamento bancário")
		.build();

	const document = SwaggerModule.createDocument(app, config);

	// Gera o arquivo swagger.json
	const outputPath = path.resolve(process.cwd(), "swagger.json");
	fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
	console.info(`📄 Swagger JSON gerado em: ${outputPath}`);

	SwaggerModule.setup("api", app, document, {
		swaggerOptions: {
			persistAuthorization: true,
		},
	});

	await app.listen(configuration.port);
	console.info("🚀 Servidor rodando em: http://localhost:3000");
	console.info("📚 Swagger UI: http://localhost:3000/api");
	console.info("📋 Swagger JSON: http://localhost:3000/swagger/json");
}
bootstrap();
