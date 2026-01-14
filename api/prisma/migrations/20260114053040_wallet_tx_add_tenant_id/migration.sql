-- Add tenantId column as nullable first (safe for existing data)
ALTER TABLE "wallet_transactions" ADD COLUMN "tenantId" INTEGER;

-- Backfill tenantId from tenant_wallets using walletId foreign key
UPDATE "wallet_transactions" wt
SET "tenantId" = tw."tenantId"
FROM "tenant_wallets" tw
WHERE wt."walletId" = tw."id"
  AND wt."tenantId" IS NULL;

-- After backfill, make tenantId NOT NULL (since every transaction belongs to a tenant)
ALTER TABLE "wallet_transactions" ALTER COLUMN "tenantId" SET NOT NULL;

-- Add Foreign Key constraint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add composite index for tenant + temporal queries (RLS filtering + reporting)
CREATE INDEX "wallet_transactions_tenantId_createdAt_idx" ON "wallet_transactions"("tenantId", "createdAt");
