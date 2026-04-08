-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "ActivityLog_ipAddress_idx" ON "ActivityLog"("ipAddress");
