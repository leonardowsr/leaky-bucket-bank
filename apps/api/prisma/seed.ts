import { Prisma, PrismaClient } from "./generated/client";
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { generateAccoutNumber } from "../src/lib/utils";

const prisma = new PrismaClient();


async function main() {
  for (let i = 0; i < 4; i++) {
    const name = faker.person.fullName();
    // replace primeiro caractere do email por indice para evitar duplicidade
    const email = faker.internet.email().toLowerCase().replace(/^\w/, (c) => i.toString());
    const password = '12345678'
    const hashedPassword = await bcrypt.hash(password, 10);
    const accountNumber = generateAccoutNumber()
    const key = faker.string.uuid();

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        account: {
          create: {
            accountNumber,
            balance: 1000000,
            accountKeys: {
              create: {
                key,
              },
            },
          },
        },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });