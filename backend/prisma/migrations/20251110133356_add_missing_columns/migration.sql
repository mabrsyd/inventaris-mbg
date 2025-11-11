/*
  Warnings:

  - The values [PENDING] on the enum `POStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [REJECTED] on the enum `QCStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `email` on the `Beneficiary` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `currentLoad` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `orderDate` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `receivedDate` on the `Stock` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Beneficiary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Recipe` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PURCHASE_ORDER', 'GOODS_RECEIPT', 'DELIVERY_ORDER', 'WORK_ORDER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ItemUnit" ADD VALUE 'GR';
ALTER TYPE "ItemUnit" ADD VALUE 'ML';

-- AlterEnum
ALTER TYPE "LocationType" ADD VALUE 'REGIONAL_WAREHOUSE';

-- AlterEnum
BEGIN;
CREATE TYPE "POStatus_new" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'CONFIRMED', 'SHIPPED', 'RECEIVED', 'CANCELLED');
ALTER TABLE "PurchaseOrder" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PurchaseOrder" ALTER COLUMN "status" TYPE "POStatus_new" USING ("status"::text::"POStatus_new");
ALTER TYPE "POStatus" RENAME TO "POStatus_old";
ALTER TYPE "POStatus_new" RENAME TO "POStatus";
DROP TYPE "POStatus_old";
ALTER TABLE "PurchaseOrder" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "QCStatus_new" AS ENUM ('PENDING', 'PASSED', 'FAILED');
ALTER TABLE "GoodsReceipt" ALTER COLUMN "qcStatus" DROP DEFAULT;
ALTER TABLE "GoodsReceipt" ALTER COLUMN "qcStatus" TYPE "QCStatus_new" USING ("qcStatus"::text::"QCStatus_new");
ALTER TYPE "QCStatus" RENAME TO "QCStatus_old";
ALTER TYPE "QCStatus_new" RENAME TO "QCStatus";
DROP TYPE "QCStatus_old";
ALTER TABLE "GoodsReceipt" ALTER COLUMN "qcStatus" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "StockMutation" DROP CONSTRAINT "StockMutation_stockId_fkey";

-- DropIndex
DROP INDEX "Beneficiary_isActive_idx";

-- DropIndex
DROP INDEX "Beneficiary_type_idx";

-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "DeliveryOrder_beneficiaryId_idx";

-- DropIndex
DROP INDEX "DeliveryOrder_destinationLocationId_idx";

-- DropIndex
DROP INDEX "DeliveryOrder_sourceLocationId_idx";

-- DropIndex
DROP INDEX "DeliveryOrder_workOrderId_idx";

-- DropIndex
DROP INDEX "GoodsReceipt_qcStatus_idx";

-- DropIndex
DROP INDEX "Item_quantity_idx";

-- DropIndex
DROP INDEX "LocationBeneficiary_beneficiaryId_idx";

-- DropIndex
DROP INDEX "LocationBeneficiary_locationId_idx";

-- DropIndex
DROP INDEX "ProductionOutput_batchNumber_idx";

-- DropIndex
DROP INDEX "ProductionOutput_productionDate_idx";

-- DropIndex
DROP INDEX "PurchaseOrder_createdById_idx";

-- DropIndex
DROP INDEX "Recipe_isActive_idx";

-- DropIndex
DROP INDEX "Stock_expiryDate_idx";

-- DropIndex
DROP INDEX "StockMutation_createdAt_idx";

-- DropIndex
DROP INDEX "StockMutation_deliveryOrderId_idx";

-- DropIndex
DROP INDEX "StockMutation_workOrderId_idx";

-- DropIndex
DROP INDEX "Supplier_isActive_idx";

-- DropIndex
DROP INDEX "Supplier_verified_idx";

-- DropIndex
DROP INDEX "User_isApproved_idx";

-- DropIndex
DROP INDEX "WorkOrder_kitchenLocationId_idx";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "actionType" "ActionType";

-- AlterTable
ALTER TABLE "Beneficiary" DROP COLUMN "email",
ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DeliveryOrder" ADD COLUMN     "transportInfo" JSONB;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "quantity",
ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "currentLoad",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "currentLoadKg" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "orderDate",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "documentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "receivedDate",
ADD COLUMN     "reservedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "quantity" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "StockMutation" ALTER COLUMN "stockId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ALTER COLUMN "role" SET DEFAULT 'WAREHOUSE_STAFF';

-- CreateTable
CREATE TABLE "StockLedger" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "locationId" TEXT,
    "batchNumber" TEXT,
    "change" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "mutationType" "MutationType" NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "workOrderId" TEXT,
    "deliveryOrderId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" "ActionType" NOT NULL,
    "comment" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequenceNumber" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "last" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SequenceNumber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockLedger_itemId_idx" ON "StockLedger"("itemId");

-- CreateIndex
CREATE INDEX "StockLedger_locationId_idx" ON "StockLedger"("locationId");

-- CreateIndex
CREATE INDEX "StockLedger_createdAt_idx" ON "StockLedger"("createdAt");

-- CreateIndex
CREATE INDEX "Approval_documentType_idx" ON "Approval"("documentType");

-- CreateIndex
CREATE INDEX "Approval_documentId_idx" ON "Approval"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "SequenceNumber_key_key" ON "SequenceNumber"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_code_key" ON "Beneficiary"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Category_code_key" ON "Category"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Item_code_key" ON "Item"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Location_code_key" ON "Location"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_code_key" ON "Recipe"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

-- AddForeignKey
ALTER TABLE "StockLedger" ADD CONSTRAINT "StockLedger_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLedger" ADD CONSTRAINT "StockLedger_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMutation" ADD CONSTRAINT "StockMutation_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
