-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "lastTicketNumber" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "ticketNumber" TEXT,
ADD COLUMN     "ticketSequence" INTEGER;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "productName" TEXT;
