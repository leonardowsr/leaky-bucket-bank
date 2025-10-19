/*
  Warnings:

  - The values [recused] on the enum `transactionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "transactionStatus_new" AS ENUM ('approved', 'rejected', 'pending');
ALTER TABLE "public"."Transaction" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "status" TYPE "transactionStatus_new" USING ("status"::text::"transactionStatus_new");
ALTER TYPE "transactionStatus" RENAME TO "transactionStatus_old";
ALTER TYPE "transactionStatus_new" RENAME TO "transactionStatus";
DROP TYPE "public"."transactionStatus_old";
ALTER TABLE "Transaction" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "balance" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "processedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "accountKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "accountKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accountKey_key_key" ON "accountKey"("key");

-- AddForeignKey
ALTER TABLE "accountKey" ADD CONSTRAINT "accountKey_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
