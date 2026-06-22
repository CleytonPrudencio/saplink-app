-- BTP Cockpit — inventário de recursos da SAP BTP por cliente
CREATE TABLE IF NOT EXISTS "BtpResource" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "subaccount" TEXT,
  "kind" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OK',
  "detail" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BtpResource_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "BtpResource_clientId_idx" ON "BtpResource"("clientId");
DO $$ BEGIN
  ALTER TABLE "BtpResource" ADD CONSTRAINT "BtpResource_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
