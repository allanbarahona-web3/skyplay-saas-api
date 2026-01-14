-- CreateTable
CREATE TABLE "tenant_wallets" (
    "id" UUID NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "balanceCents" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "amountCents" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'posted',
    "referenceType" TEXT,
    "referenceId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_wallets_tenantId_key" ON "tenant_wallets"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_wallets_tenantId_idx" ON "tenant_wallets"("tenantId");

-- CreateIndex
CREATE INDEX "wallet_transactions_walletId_createdAt_idx" ON "wallet_transactions"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "wallet_transactions_status_createdAt_idx" ON "wallet_transactions"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "tenant_wallets" ADD CONSTRAINT "tenant_wallets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "tenant_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Add CHECK constraints for data integrity
ALTER TABLE "tenant_wallets"
ADD CONSTRAINT "tenant_wallets_balance_check"
CHECK ("balanceCents" >= 0);

ALTER TABLE "wallet_transactions"
ADD CONSTRAINT "wallet_transactions_type_check"
CHECK ("type" IN ('topup', 'purchase', 'refund', 'adjustment'));

ALTER TABLE "wallet_transactions"
ADD CONSTRAINT "wallet_transactions_status_check"
CHECK ("status" IN ('pending', 'posted', 'void'));