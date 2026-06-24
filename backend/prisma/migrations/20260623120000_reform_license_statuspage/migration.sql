-- Client: status page white-label
ALTER TABLE "Client" ADD COLUMN "statusEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Client" ADD COLUMN "statusToken" TEXT;
CREATE UNIQUE INDEX "Client_statusToken_key" ON "Client"("statusToken");

-- ReformReadiness — prontidão CBS/IBS
CREATE TABLE "ReformReadiness" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "environment" TEXT NOT NULL DEFAULT 'PRD',
  "area" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "phase" TEXT,
  "detail" TEXT,
  "lastCheckedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReformReadiness_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReformReadiness_clientId_area_key" ON "ReformReadiness"("clientId", "area");
CREATE INDEX "ReformReadiness_clientId_idx" ON "ReformReadiness"("clientId");
ALTER TABLE "ReformReadiness" ADD CONSTRAINT "ReformReadiness_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- LicenseItem — uso indireto / licenciamento
CREATE TABLE "LicenseItem" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "environment" TEXT NOT NULL DEFAULT 'PRD',
  "metric" TEXT NOT NULL,
  "used" INTEGER NOT NULL DEFAULT 0,
  "entitled" INTEGER NOT NULL DEFAULT 0,
  "unit" TEXT,
  "riskLevel" TEXT NOT NULL DEFAULT 'OK',
  "estCostBrl" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "detail" TEXT,
  "lastCheckedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LicenseItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LicenseItem_clientId_metric_key" ON "LicenseItem"("clientId", "metric");
CREATE INDEX "LicenseItem_clientId_idx" ON "LicenseItem"("clientId");
ALTER TABLE "LicenseItem" ADD CONSTRAINT "LicenseItem_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
