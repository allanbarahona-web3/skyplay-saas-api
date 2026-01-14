-- CreateTable
CREATE TABLE "digital_deliveries" (
    "id" UUID NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "credentialId" TEXT,
    "customerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deliveredAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digital_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "digital_deliveries_tenantId_status_idx" ON "digital_deliveries"("tenantId", "status");

-- CreateIndex
CREATE INDEX "digital_deliveries_tenantId_customerId_idx" ON "digital_deliveries"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "digital_deliveries_tenantId_expiresAt_idx" ON "digital_deliveries"("tenantId", "expiresAt");

-- AddForeignKey
ALTER TABLE "digital_deliveries" ADD CONSTRAINT "digital_deliveries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_deliveries" ADD CONSTRAINT "digital_deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_deliveries" ADD CONSTRAINT "digital_deliveries_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_deliveries" ADD CONSTRAINT "digital_deliveries_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "credentials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_deliveries" ADD CONSTRAINT "digital_deliveries_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add CHECK constraint for status values
ALTER TABLE "digital_deliveries"
ADD CONSTRAINT "digital_deliveries_status_check"
CHECK ("status" IN ('pending', 'delivered', 'expired', 'revoked'));

-- Add UNIQUE index to prevent delivering the same credential twice (PostgreSQL: use index with WHERE clause)
CREATE UNIQUE INDEX "digital_deliveries_credentialId_unique_idx" 
ON "digital_deliveries" ("credentialId") 
WHERE "credentialId" IS NOT NULL;
