import { SetMetadata } from "@nestjs/common";

export const configuration = {
	port: Number.parseInt(process.env.PORT || "3000", 10),
	databaseUrl:
		process.env.DATABASE_URL ||
		"postgresql://postgres:postgres@localhost:5432/postgres",
	jwtSecret: process.env.JWT_SECRET || "defaultSecret",
	jwt: {
		accessExpire: Number.parseInt(
			process.env.ACCESS_TOKEN_EXPIRE || "36000", // 10 hours
			10,
		),
		refreshExpire: Number.parseInt(
			process.env.REFRESH_TOKEN_EXPIRE || "172800", // 2 days
			10,
		),
	},
	rabbitmq: {
		url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
		queue: {
			transactionsCreated: "transactions_created_queue",
			transactions:
				process.env.RABBITMQ_QUEUE_TRANSACTIONS ||
				("transactions_queue" as const),
		},
		injection_name: "RABBITMQ_SERVICE" as const,
	},
	cors: {
		origin:
			process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== "*"
				? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
				: ["http://localhost:3001", "http://localhost:3000"],
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization"],
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
	},
};

export const IS_PUBLIC_KEY = "IS_PUBLIC_KEY";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
