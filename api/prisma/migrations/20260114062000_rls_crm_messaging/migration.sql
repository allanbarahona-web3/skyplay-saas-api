-- LOTE 3: CrmAutomation, CrmOutbox, Conversation, Message
-- Apply RLS to CRM and messaging tables

-- CrmAutomation table
ALTER TABLE "crm_automations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm_automations" FORCE ROW LEVEL SECURITY;
CREATE POLICY "crm_automations_tenant_isolation" ON "crm_automations"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- CrmOutbox table
ALTER TABLE "crm_outbox" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm_outbox" FORCE ROW LEVEL SECURITY;
CREATE POLICY "crm_outbox_tenant_isolation" ON "crm_outbox"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- Conversation table
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" FORCE ROW LEVEL SECURITY;
CREATE POLICY "conversations_tenant_isolation" ON "conversations"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- Message table
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" FORCE ROW LEVEL SECURITY;
CREATE POLICY "messages_tenant_isolation" ON "messages"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);
