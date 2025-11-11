/*
  Warnings:

  - Added the required column `stockId` to the `StockMutation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "POStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "StockMutation" ADD COLUMN     "stockId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "notes" TEXT;

-- CreateIndex
CREATE INDEX "StockMutation_stockId_idx" ON "StockMutation"("stockId");

-- AddForeignKey
ALTER TABLE "StockMutation" ADD CONSTRAINT "StockMutation_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
