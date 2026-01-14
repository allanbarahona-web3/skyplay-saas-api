-- ========================================
-- ROW LEVEL SECURITY (RLS) - COMPLETE SETUP
-- ========================================
-- Enable Row Level Security on all tenant-scoped tables
-- Run this script to secure the multi-tenant setup

-- ========================================
-- 1. ENABLE RLS ON ALL TENANT-SCOPED TABLES
-- ========================================

ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_outbox ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. TENANT_USERS - Restrict to own tenant
-- ========================================

CREATE POLICY "tenant_users_see_own_tenant"
  ON tenant_users
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_users_create_in_own_tenant"
  ON tenant_users
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_users_update_own_tenant"
  ON tenant_users
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_users_delete_own_tenant"
  ON tenant_users
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 3. CUSTOMERS - Restrict to own tenant
-- ========================================

CREATE POLICY "customers_see_own_tenant"
  ON customers
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "customers_create_in_own_tenant"
  ON customers
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "customers_update_own_tenant"
  ON customers
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "customers_delete_own_tenant"
  ON customers
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 4. PRODUCTS - Restrict to own tenant
-- ========================================

CREATE POLICY "products_see_own_tenant"
  ON products
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "products_create_in_own_tenant"
  ON products
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "products_update_own_tenant"
  ON products
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "products_delete_own_tenant"
  ON products
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 5. CATEGORIES - Restrict to own tenant
-- ========================================

CREATE POLICY "categories_see_own_tenant"
  ON categories
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "categories_create_in_own_tenant"
  ON categories
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "categories_update_own_tenant"
  ON categories
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "categories_delete_own_tenant"
  ON categories
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 6. MEDIA - Restrict to own tenant
-- ========================================

CREATE POLICY "media_see_own_tenant"
  ON media
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "media_create_in_own_tenant"
  ON media
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "media_update_own_tenant"
  ON media
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "media_delete_own_tenant"
  ON media
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 7. ORDERS - Restrict to own tenant
-- ========================================

CREATE POLICY "orders_see_own_tenant"
  ON orders
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "orders_create_in_own_tenant"
  ON orders
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "orders_update_own_tenant"
  ON orders
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "orders_delete_own_tenant"
  ON orders
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 8. ORDER_ITEMS - Restrict to own tenant
-- ========================================

CREATE POLICY "order_items_see_own_tenant"
  ON order_items
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "order_items_create_in_own_tenant"
  ON order_items
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "order_items_update_own_tenant"
  ON order_items
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "order_items_delete_own_tenant"
  ON order_items
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 9. PAYMENTS - Restrict to own tenant
-- ========================================

CREATE POLICY "payments_see_own_tenant"
  ON payments
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "payments_create_in_own_tenant"
  ON payments
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "payments_update_own_tenant"
  ON payments
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "payments_delete_own_tenant"
  ON payments
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 10. TENANT_DOMAINS - Restrict to own tenant
-- ========================================

CREATE POLICY "tenant_domains_see_own_tenant"
  ON tenant_domains
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_domains_create_in_own_tenant"
  ON tenant_domains
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_domains_update_own_tenant"
  ON tenant_domains
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_domains_delete_own_tenant"
  ON tenant_domains
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 11. AUTH_SESSIONS - Restrict to own tenant
-- ========================================

CREATE POLICY "auth_sessions_see_own_tenant"
  ON auth_sessions
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "auth_sessions_create_in_own_tenant"
  ON auth_sessions
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "auth_sessions_update_own_tenant"
  ON auth_sessions
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "auth_sessions_delete_own_tenant"
  ON auth_sessions
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 12. CONVERSATIONS - Restrict to own tenant
-- ========================================

CREATE POLICY "conversations_see_own_tenant"
  ON conversations
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "conversations_create_in_own_tenant"
  ON conversations
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "conversations_update_own_tenant"
  ON conversations
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "conversations_delete_own_tenant"
  ON conversations
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 13. MESSAGES - Restrict to own tenant
-- ========================================

CREATE POLICY "messages_see_own_tenant"
  ON messages
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "messages_create_in_own_tenant"
  ON messages
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "messages_update_own_tenant"
  ON messages
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "messages_delete_own_tenant"
  ON messages
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 14. LEADS - Restrict to own tenant (nullable tenantId allowed)
-- ========================================

CREATE POLICY "leads_see_own_tenant"
  ON leads
  FOR SELECT
  USING ("tenantId" IS NULL OR "tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "leads_create_in_own_tenant"
  ON leads
  FOR INSERT
  WITH CHECK ("tenantId" IS NULL OR "tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "leads_update_own_tenant"
  ON leads
  FOR UPDATE
  USING ("tenantId" IS NULL OR "tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "leads_delete_own_tenant"
  ON leads
  FOR DELETE
  USING ("tenantId" IS NULL OR "tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 15. CREDENTIALS - Restrict to own tenant
-- ========================================

CREATE POLICY "credentials_see_own_tenant"
  ON credentials
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "credentials_create_in_own_tenant"
  ON credentials
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "credentials_update_own_tenant"
  ON credentials
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "credentials_delete_own_tenant"
  ON credentials
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 16. SERVICES - Restrict to own tenant
-- ========================================

CREATE POLICY "services_see_own_tenant"
  ON services
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "services_create_in_own_tenant"
  ON services
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "services_update_own_tenant"
  ON services
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "services_delete_own_tenant"
  ON services
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 17. BILLING_EVENTS - Restrict to own tenant
-- ========================================

CREATE POLICY "billing_events_see_own_tenant"
  ON billing_events
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "billing_events_create_in_own_tenant"
  ON billing_events
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "billing_events_update_own_tenant"
  ON billing_events
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "billing_events_delete_own_tenant"
  ON billing_events
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 18. TENANT_ENTITLEMENTS - Restrict to own tenant
-- ========================================

CREATE POLICY "tenant_entitlements_see_own_tenant"
  ON tenant_entitlements
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_entitlements_create_in_own_tenant"
  ON tenant_entitlements
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_entitlements_update_own_tenant"
  ON tenant_entitlements
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_entitlements_delete_own_tenant"
  ON tenant_entitlements
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 19. TENANT_SUBSCRIPTIONS - Restrict to own tenant
-- ========================================

CREATE POLICY "tenant_subscriptions_see_own_tenant"
  ON tenant_subscriptions
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_subscriptions_create_in_own_tenant"
  ON tenant_subscriptions
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_subscriptions_update_own_tenant"
  ON tenant_subscriptions
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_subscriptions_delete_own_tenant"
  ON tenant_subscriptions
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 20. TENANT_PRICING_RULES - Restrict to own tenant
-- ========================================

CREATE POLICY "tenant_pricing_rules_see_own_tenant"
  ON tenant_pricing_rules
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_pricing_rules_create_in_own_tenant"
  ON tenant_pricing_rules
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_pricing_rules_update_own_tenant"
  ON tenant_pricing_rules
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_pricing_rules_delete_own_tenant"
  ON tenant_pricing_rules
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 21. TENANT_WALLETS - Restrict to own tenant
-- ========================================

CREATE POLICY "tenant_wallets_see_own_tenant"
  ON tenant_wallets
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_wallets_create_in_own_tenant"
  ON tenant_wallets
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_wallets_update_own_tenant"
  ON tenant_wallets
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "tenant_wallets_delete_own_tenant"
  ON tenant_wallets
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 22. WALLET_TRANSACTIONS - Restrict to own tenant
-- ========================================

CREATE POLICY "wallet_transactions_see_own_tenant"
  ON wallet_transactions
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "wallet_transactions_create_in_own_tenant"
  ON wallet_transactions
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "wallet_transactions_update_own_tenant"
  ON wallet_transactions
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "wallet_transactions_delete_own_tenant"
  ON wallet_transactions
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 23. DIGITAL_DELIVERIES - Restrict to own tenant
-- ========================================

CREATE POLICY "digital_deliveries_see_own_tenant"
  ON digital_deliveries
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "digital_deliveries_create_in_own_tenant"
  ON digital_deliveries
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "digital_deliveries_update_own_tenant"
  ON digital_deliveries
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "digital_deliveries_delete_own_tenant"
  ON digital_deliveries
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 24. CRM_AUTOMATIONS - Restrict to own tenant
-- ========================================

CREATE POLICY "crm_automations_see_own_tenant"
  ON crm_automations
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "crm_automations_create_in_own_tenant"
  ON crm_automations
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "crm_automations_update_own_tenant"
  ON crm_automations
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "crm_automations_delete_own_tenant"
  ON crm_automations
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 25. CRM_OUTBOX - Restrict to own tenant
-- ========================================

CREATE POLICY "crm_outbox_see_own_tenant"
  ON crm_outbox
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "crm_outbox_create_in_own_tenant"
  ON crm_outbox
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "crm_outbox_update_own_tenant"
  ON crm_outbox
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "crm_outbox_delete_own_tenant"
  ON crm_outbox
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Run these to verify RLS is enabled on all tables:
-- SELECT table_name, rowsecurity FROM information_schema.tables WHERE table_schema='public' AND rowsecurity=true ORDER BY table_name;
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;

