-- Conectores SAP Cloud BYO (Ariba / SuccessFactors)
CREATE TABLE IF NOT EXISTS "CloudConnector" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "product" TEXT NOT NULL,
  "baseUrl" TEXT NOT NULL,
  "apiKey" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "lastSyncAt" TIMESTAMP(3),
  "lastResult" JSONB,
  CONSTRAINT "CloudConnector_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CloudConnector_clientId_product_key" ON "CloudConnector"("clientId","product");
CREATE INDEX IF NOT EXISTS "CloudConnector_clientId_idx" ON "CloudConnector"("clientId");
DO $$ BEGIN
  ALTER TABLE "CloudConnector" ADD CONSTRAINT "CloudConnector_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
