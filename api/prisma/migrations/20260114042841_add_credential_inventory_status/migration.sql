-- AlterTable
ALTER TABLE "credentials" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "reservedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'available';

-- CreateIndex
CREATE INDEX "credentials_tenantId_status_idx" ON "credentials"("tenantId", "status");

-- CreateIndex
CREATE INDEX "credentials_tenantId_productId_status_idx" ON "credentials"("tenantId", "productId", "status");

-- Add CHECK constraint for allowed inventory statuses
ALTER TABLE "credentials"
ADD CONSTRAINT "credentials_inventory_status_check"
CHECK ("status" IN ('available','reserved','delivered','revoked','expired'));
