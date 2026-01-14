-- LOTE 4: TenantDomain, TenantUser, TenantEntitlement, TenantPricingRule, TenantSubscription
-- Apply RLS to tenant admin and subscription tables

-- TenantDomain table
ALTER TABLE "tenant_domains" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_domains" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_domains_tenant_isolation" ON "tenant_domains"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- TenantUser table
ALTER TABLE "tenant_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_users" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_users_tenant_isolation" ON "tenant_users"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- TenantEntitlement table
ALTER TABLE "tenant_entitlements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_entitlements" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_entitlements_tenant_isolation" ON "tenant_entitlements"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- TenantPricingRule table
ALTER TABLE "tenant_pricing_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_pricing_rules" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_pricing_rules_tenant_isolation" ON "tenant_pricing_rules"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- TenantSubscription table
ALTER TABLE "tenant_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenant_subscriptions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_subscriptions_tenant_isolation" ON "tenant_subscriptions"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);
