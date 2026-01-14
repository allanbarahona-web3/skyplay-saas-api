-- AlterTable
ALTER TABLE "credentials" ADD COLUMN     "productId" TEXT;

-- CreateIndex
CREATE INDEX "credentials_tenantId_productId_idx" ON "credentials"("tenantId", "productId");

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
