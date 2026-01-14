-- ========================================
-- LOTE 1: RLS CORE COMMERCE TABLES
-- ========================================
-- Enable Row Level Security on core commerce tables: customers, orders, order_items, payments
-- Each table uses tenant_id isolation with app.tenant_id context variable

-- ========================================
-- 1. CUSTOMERS TABLE - RLS SETUP
-- ========================================

ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "customers" FORCE ROW LEVEL SECURITY;

CREATE POLICY "customers_tenant_isolation" ON "customers"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 2. ORDERS TABLE - RLS SETUP
-- ========================================

ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "orders" FORCE ROW LEVEL SECURITY;

CREATE POLICY "orders_tenant_isolation" ON "orders"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 3. ORDER_ITEMS TABLE - RLS SETUP
-- ========================================

ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "order_items" FORCE ROW LEVEL SECURITY;

CREATE POLICY "order_items_tenant_isolation" ON "order_items"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

-- ========================================
-- 4. PAYMENTS TABLE - RLS SETUP
-- ========================================

ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "payments" FORCE ROW LEVEL SECURITY;

CREATE POLICY "payments_tenant_isolation" ON "payments"
  USING ("tenantId" = current_setting('app.tenant_id')::int)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

