-- Enable Row Level Security (RLS) on all tables
-- Run this script after prisma db push to secure the multi-tenant setup

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for tenants table
-- Tenants can only see their own record
CREATE POLICY "Tenants see own tenant" ON tenants
  FOR SELECT
  USING (id = current_setting('app.tenant_id')::int);

-- 3. Create policies for tenant_users table
-- Users can only see users from their tenant
CREATE POLICY "Users see own tenant users" ON tenant_users
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Users can update own tenant users" ON tenant_users
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- 4. Create policies for customers table
-- Can only see customers from their tenant
CREATE POLICY "Customers see own tenant customers" ON customers
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Customers can create in own tenant" ON customers
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Customers can update in own tenant" ON customers
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Customers can delete in own tenant" ON customers
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- 5. Create policies for products table
CREATE POLICY "Products see own tenant products" ON products
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Products can create in own tenant" ON products
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Products can update in own tenant" ON products
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Products can delete in own tenant" ON products
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- 6. Create policies for orders table
CREATE POLICY "Orders see own tenant orders" ON orders
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Orders can create in own tenant" ON orders
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Orders can update in own tenant" ON orders
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Orders can delete in own tenant" ON orders
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- 7. Create policies for order_items table
CREATE POLICY "OrderItems see own tenant order items" ON order_items
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "OrderItems can create in own tenant" ON order_items
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "OrderItems can update in own tenant" ON order_items
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "OrderItems can delete in own tenant" ON order_items
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- 8. Create policies for payments table
CREATE POLICY "Payments see own tenant payments" ON payments
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Payments can create in own tenant" ON payments
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Payments can update in own tenant" ON payments
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Payments can delete in own tenant" ON payments
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- 9. Create policies for auth_sessions table
CREATE POLICY "Sessions see own tenant sessions" ON auth_sessions
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Sessions can create in own tenant" ON auth_sessions
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Sessions can update in own tenant" ON auth_sessions
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Sessions can delete in own tenant" ON auth_sessions
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- 9. Create policies for tenant_domains table
-- Users can only see domains from their tenant
CREATE POLICY "Domains see own tenant domains" ON tenant_domains
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Domains can create in own tenant" ON tenant_domains
  FOR INSERT
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Domains can update in own tenant" ON tenant_domains
  FOR UPDATE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

CREATE POLICY "Domains can delete in own tenant" ON tenant_domains
  FOR DELETE
  USING ("tenantId" = current_setting('app.tenant_id')::int);

-- 10. Verify RLS is enabled
SELECT tablename, 
       (SELECT Count(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policies,
       CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables 
JOIN pg_class ON pg_tables.tablename = pg_class.relname
WHERE schemaname = 'public'
ORDER BY tablename;
