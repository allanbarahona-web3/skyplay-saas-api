-- LOTE 6: Service (Legacy)
-- Apply RLS to service table (not currently used but protected for future compatibility)

-- Service table
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "services" FORCE ROW LEVEL SECURITY;
CREATE POLICY "services_tenant_isolation" ON "services"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);
