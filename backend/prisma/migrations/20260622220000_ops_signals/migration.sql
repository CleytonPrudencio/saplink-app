-- Basis & Operações — sinais coletados pelo agente
CREATE TABLE IF NOT EXISTS "OpsSignal" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "integrationId" TEXT,
  "category" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "title" TEXT NOT NULL,
  "object" TEXT,
  "detail" TEXT,
  "ref" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3),
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OpsSignal_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "OpsSignal_clientId_category_ref_key" ON "OpsSignal"("clientId","category","ref");
CREATE INDEX IF NOT EXISTS "OpsSignal_clientId_category_resolved_idx" ON "OpsSignal"("clientId","category","resolved");
DO $$ BEGIN
  ALTER TABLE "OpsSignal" ADD CONSTRAINT "OpsSignal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
