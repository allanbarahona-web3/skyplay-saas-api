-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "source" TEXT;
-- Add CHECK constraint to enforce approval requirements
ALTER TABLE "leads"
ADD CONSTRAINT "lead_approved_requires_tenant_and_time"
CHECK (
  (status != 'approved') OR 
  (status = 'approved' AND "tenantId" IS NOT NULL AND "approvedAt" IS NOT NULL)
);