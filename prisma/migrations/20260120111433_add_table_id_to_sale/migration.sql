-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "tableId" INTEGER;

-- CreateIndex
CREATE INDEX "Sale_organizationId_tableId_idx" ON "Sale"("organizationId", "tableId");
