-- CreateTable
CREATE TABLE "tenant_pricing_rules" (
    "id" UUID NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "ruleType" TEXT NOT NULL,
    "percentOff" DECIMAL(5,2) NOT NULL,
    "categoryId" TEXT,
    "productId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tenant_pricing_rules_tenantId_isActive_priority_idx" ON "tenant_pricing_rules"("tenantId", "isActive", "priority");

-- CreateIndex
CREATE INDEX "tenant_pricing_rules_tenantId_productId_idx" ON "tenant_pricing_rules"("tenantId", "productId");

-- CreateIndex
CREATE INDEX "tenant_pricing_rules_tenantId_categoryId_idx" ON "tenant_pricing_rules"("tenantId", "categoryId");

-- AddForeignKey
ALTER TABLE "tenant_pricing_rules" ADD CONSTRAINT "tenant_pricing_rules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_pricing_rules" ADD CONSTRAINT "tenant_pricing_rules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_pricing_rules" ADD CONSTRAINT "tenant_pricing_rules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- Add CHECK constraints for data integrity
ALTER TABLE "tenant_pricing_rules"
ADD CONSTRAINT "tenant_pricing_rules_percent_off_check"
CHECK ("percentOff" >= 0 AND "percentOff" <= 100);

ALTER TABLE "tenant_pricing_rules"
ADD CONSTRAINT "tenant_pricing_rules_rule_type_check"
CHECK ("ruleType" IN ('global_percent', 'category_percent', 'product_percent'));

ALTER TABLE "tenant_pricing_rules"
ADD CONSTRAINT "tenant_pricing_rules_dates_check"
CHECK ("startsAt" IS NULL OR "endsAt" IS NULL OR "startsAt" < "endsAt");

-- Consistency checks: rule type and category/product relationship
ALTER TABLE "tenant_pricing_rules"
ADD CONSTRAINT "tenant_pricing_rules_global_consistency"
CHECK (("ruleType" != 'global_percent') OR ("categoryId" IS NULL AND "productId" IS NULL));

ALTER TABLE "tenant_pricing_rules"
ADD CONSTRAINT "tenant_pricing_rules_category_consistency"
CHECK (("ruleType" != 'category_percent') OR ("categoryId" IS NOT NULL AND "productId" IS NULL));

ALTER TABLE "tenant_pricing_rules"
ADD CONSTRAINT "tenant_pricing_rules_product_consistency"
CHECK (("ruleType" != 'product_percent') OR ("productId" IS NOT NULL AND "categoryId" IS NULL));