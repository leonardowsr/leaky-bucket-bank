-- CreateEnum
CREATE TYPE "transactionStatus" AS ENUM ('approved', 'recused', 'pending');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "status" "transactionStatus" NOT NULL DEFAULT 'pending';
