-- LOTE 5: TenantWallet, WalletTransaction
-- Apply RLS to wallet tables

-- TenantWallet table
ALTER TABLE "tenant_wallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_wallets" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_wallets_tenant_isolation" ON "tenant_wallets"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- WalletTransaction table
ALTER TABLE "wallet_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wallet_transactions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "wallet_transactions_tenant_isolation" ON "wallet_transactions"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);
