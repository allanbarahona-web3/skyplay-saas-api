-- DropIndex
DROP INDEX "billing_events_createdAt_idx";

-- DropIndex
DROP INDEX "billing_events_eventType_idx";

-- DropIndex
DROP INDEX "billing_events_status_idx";

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "billingInterval" TEXT NOT NULL DEFAULT 'month',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_entitlements" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "entitlementCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_entitlements" (
    "id" UUID NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'enabled',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'manual',
    "sourceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_code_key" ON "plans"("code");

-- CreateIndex
CREATE INDEX "plans_code_idx" ON "plans"("code");

-- CreateIndex
CREATE INDEX "plans_isActive_idx" ON "plans"("isActive");

-- CreateIndex
CREATE INDEX "plan_entitlements_planId_idx" ON "plan_entitlements"("planId");

-- CreateIndex
CREATE INDEX "plan_entitlements_entitlementCode_idx" ON "plan_entitlements"("entitlementCode");

-- CreateIndex
CREATE UNIQUE INDEX "plan_entitlements_planId_entitlementCode_key" ON "plan_entitlements"("planId", "entitlementCode");

-- CreateIndex
CREATE INDEX "tenant_entitlements_tenantId_idx" ON "tenant_entitlements"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_entitlements_code_idx" ON "tenant_entitlements"("code");

-- CreateIndex
CREATE INDEX "tenant_entitlements_status_idx" ON "tenant_entitlements"("status");

-- CreateIndex
CREATE INDEX "tenant_entitlements_source_idx" ON "tenant_entitlements"("source");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_entitlements_tenantId_code_key" ON "tenant_entitlements"("tenantId", "code");

-- AddForeignKey
ALTER TABLE "plan_entitlements" ADD CONSTRAINT "plan_entitlements_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_entitlements" ADD CONSTRAINT "tenant_entitlements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Add CHECK constraints for data integrity
ALTER TABLE "plans"
ADD CONSTRAINT "plans_billing_interval_check"
CHECK ("billingInterval" IN ('month', 'year', 'one_time'));

ALTER TABLE "tenant_entitlements"
ADD CONSTRAINT "tenant_entitlements_status_check"
CHECK ("status" IN ('enabled', 'disabled'));

ALTER TABLE "tenant_entitlements"
ADD CONSTRAINT "tenant_entitlements_source_check"
CHECK ("source" IN ('signup', 'subscription', 'addon', 'trial', 'manual'));

ALTER TABLE "tenant_entitlements"
ADD CONSTRAINT "tenant_entitlements_dates_check"
CHECK ("startsAt" IS NULL OR "endsAt" IS NULL OR "startsAt" < "endsAt");