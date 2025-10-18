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

	// Habilitar CORS
	app.enableCors(configuration.cors);

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			queue: configuration.rabbitmq.queue.transactions,
			urls: [configuration.rabbitmq.url],
			queueOptions: {
				durable: true,
			},
			prefetchCount: 1,
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
		.setTitle("Bank API")
		.setVersion("1.0.0")
		.setDescription(
			"API RESTful completa para gerenciamento bancário com suporte a autenticação JWT, operações de contas, transações e gerenciamento de usuários.",
		)
		.setContact("API Support", "https://github.com", "support@bank-api.com")
		.setLicense("MIT", "https://opensource.org/licenses/MIT")
		.setExternalDoc(
			"Postman Collection",
			"https://www.postman.com/collections/your-collection",
		)
		.addTag("auth", "Autenticação e autorização de usuários")
		.addTag("users", "Gerenciamento de usuários")
		.addTag("account", "Gerenciamento de contas bancárias")
		.addTag("Transaction", "Gerenciamento de transações bancárias")
		.addServer("http://localhost:3000", "Desenvolvimento Local")
		.addServer("https://api.bank-project.com", "Produção")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
			"JWT-auth",
		)
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
	console.info("🛠️  RabbitMQ Management: http://localhost:15672/");
}
bootstrap();
