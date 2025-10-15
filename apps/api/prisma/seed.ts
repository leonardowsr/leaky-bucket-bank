import { Prisma, PrismaClient } from "./generated/client";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [];
