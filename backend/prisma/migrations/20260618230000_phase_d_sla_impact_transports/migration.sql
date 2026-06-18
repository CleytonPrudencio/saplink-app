-- Fase D: SLA por cliente, impacto em R$, radar de transports

ALTER TABLE "Client" ADD COLUMN "slaUptimeTarget" DOUBLE PRECISION NOT NULL DEFAULT 99.0;
ALTER TABLE "Client" ADD COLUMN "slaMaxLatencyMs" INTEGER NOT NULL DEFAULT 2000;

ALTER TABLE "Integration" ADD COLUMN "costPerHourCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Integration" ADD COLUMN "businessProcess" TEXT;

CREATE TABLE "Transport" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "integrationId" TEXT,
  "trNumber" TEXT NOT NULL,
  "description" TEXT,
  "owner" TEXT,
  "status" TEXT,
  "target" TEXT,
  "importedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Transport_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Transport_clientId_trNumber_key" ON "Transport"("clientId", "trNumber");
CREATE INDEX "Transport_clientId_idx" ON "Transport"("clientId");
ALTER TABLE "Transport" ADD CONSTRAINT "Transport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
