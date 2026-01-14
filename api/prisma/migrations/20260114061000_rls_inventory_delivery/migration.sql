-- LOTE 2: Credential, DigitalDelivery, Media
-- Apply RLS to inventory and delivery tables

-- Credential table
ALTER TABLE "credentials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "credentials" FORCE ROW LEVEL SECURITY;
CREATE POLICY "credentials_tenant_isolation" ON "credentials"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- DigitalDelivery table
ALTER TABLE "digital_deliveries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "digital_deliveries" FORCE ROW LEVEL SECURITY;
CREATE POLICY "digital_deliveries_tenant_isolation" ON "digital_deliveries"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- Media table
ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media" FORCE ROW LEVEL SECURITY;
CREATE POLICY "media_tenant_isolation" ON "media"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);
