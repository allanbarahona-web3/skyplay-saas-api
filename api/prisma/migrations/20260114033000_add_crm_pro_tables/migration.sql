-- CreateTable CrmAutomation
CREATE TABLE "crm_automations" (
    "id" UUID NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "offsetMinutes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable CrmOutbox
CREATE TABLE "crm_outbox" (
    "id" UUID NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "customerId" TEXT,
    "deliveryId" UUID,
    "channel" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "sendAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "crm_automations_tenantId_isActive_idx" ON "crm_automations"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "crm_outbox_status_sendAt_idx" ON "crm_outbox"("status", "sendAt");

-- CreateIndex
CREATE INDEX "crm_outbox_tenantId_createdAt_idx" ON "crm_outbox"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "crm_automations" ADD CONSTRAINT "crm_automations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_outbox" ADD CONSTRAINT "crm_outbox_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_outbox" ADD CONSTRAINT "crm_outbox_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_outbox" ADD CONSTRAINT "crm_outbox_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "digital_deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add CHECK constraints for CrmAutomation
ALTER TABLE "crm_automations"
ADD CONSTRAINT "crm_automations_channel_check"
CHECK ("channel" IN ('email', 'sms', 'whatsapp'));

ALTER TABLE "crm_automations"
ADD CONSTRAINT "crm_automations_trigger_check"
CHECK ("trigger" IN ('before_expiration', 'after_purchase', 'manual_campaign'));

-- Add CHECK constraints for CrmOutbox
ALTER TABLE "crm_outbox"
ADD CONSTRAINT "crm_outbox_channel_check"
CHECK ("channel" IN ('email', 'sms', 'whatsapp'));

ALTER TABLE "crm_outbox"
ADD CONSTRAINT "crm_outbox_status_check"
CHECK ("status" IN ('queued', 'sent', 'failed', 'canceled'));
