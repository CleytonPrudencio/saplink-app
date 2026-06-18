-- Conector real do SAP Integration Suite (CPI)
CREATE TABLE "CpiConfig" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "baseUrl" TEXT NOT NULL,
  "tokenUrl" TEXT NOT NULL,
  "oauthClientId" TEXT NOT NULL,
  "oauthSecret" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "lastSyncAt" TIMESTAMP(3),
  "lastResult" TEXT,
  "lastCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CpiConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CpiConfig_clientId_key" ON "CpiConfig"("clientId");
ALTER TABLE "CpiConfig" ADD CONSTRAINT "CpiConfig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
