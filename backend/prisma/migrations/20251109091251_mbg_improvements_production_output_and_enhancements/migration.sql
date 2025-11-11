/*
  Warnings:

  - You are about to drop the column `locationId` on the `Beneficiary` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Beneficiary" DROP CONSTRAINT "Beneficiary_locationId_fkey";

-- DropIndex
DROP INDEX "Beneficiary_locationId_idx";

-- AlterTable
ALTER TABLE "Beneficiary" DROP COLUMN "locationId";

-- AlterTable
ALTER TABLE "DeliveryOrder" ADD COLUMN     "referenceDocument" TEXT,
ADD COLUMN     "workOrderId" TEXT;

-- AlterTable
ALTER TABLE "GoodsReceipt" ADD COLUMN     "referenceDocument" TEXT;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "isConsumable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "currentLoad" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "StockMutation" ADD COLUMN     "wasteQuantity" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "LocationBeneficiary" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationBeneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOutput" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "ItemUnit" NOT NULL,
    "batchNumber" TEXT,
    "productionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "qcPassed" BOOLEAN NOT NULL DEFAULT true,
    "qcNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionOutput_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocationBeneficiary_locationId_idx" ON "LocationBeneficiary"("locationId");

-- CreateIndex
CREATE INDEX "LocationBeneficiary_beneficiaryId_idx" ON "LocationBeneficiary"("beneficiaryId");

-- CreateIndex
CREATE UNIQUE INDEX "LocationBeneficiary_locationId_beneficiaryId_key" ON "LocationBeneficiary"("locationId", "beneficiaryId");

-- CreateIndex
CREATE INDEX "ProductionOutput_workOrderId_idx" ON "ProductionOutput"("workOrderId");

-- CreateIndex
CREATE INDEX "ProductionOutput_itemId_idx" ON "ProductionOutput"("itemId");

-- CreateIndex
CREATE INDEX "ProductionOutput_batchNumber_idx" ON "ProductionOutput"("batchNumber");

-- CreateIndex
CREATE INDEX "ProductionOutput_productionDate_idx" ON "ProductionOutput"("productionDate");

-- CreateIndex
CREATE INDEX "DeliveryOrder_workOrderId_idx" ON "DeliveryOrder"("workOrderId");

-- AddForeignKey
ALTER TABLE "LocationBeneficiary" ADD CONSTRAINT "LocationBeneficiary_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationBeneficiary" ADD CONSTRAINT "LocationBeneficiary_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutput" ADD CONSTRAINT "ProductionOutput_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutput" ADD CONSTRAINT "ProductionOutput_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
