import { SetMetadata } from "@nestjs/common";

export const configuration = {
	port: Number.parseInt(process.env.PORT || "3000", 10),
	databaseUrl:
		process.env.DATABASE_URL ||
		"postgresql://postgres:postgres@localhost:5432/postgres",
	jwtSecret: process.env.JWT_SECRET || "defaultSecret",
	jwt: {
		accessExpire: Number.parseInt(
			process.env.ACCESS_TOKEN_EXPIRE || "3600",
			10,
		),
		refreshExpire: Number.parseInt(
			process.env.REFRESH_TOKEN_EXPIRE || "86400",
			10,
		),
	},
};

export const IS_PUBLIC_KEY = "IS_PUBLIC_KEY";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
