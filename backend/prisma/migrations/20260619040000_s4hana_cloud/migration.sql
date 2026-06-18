-- S/4HANA Cloud: conector, upgrade, clean core, APIs, comm arrangements, fiscal, eventos

CREATE TABLE "S4Connection" (
  "id" TEXT NOT NULL, "clientId" TEXT NOT NULL, "baseUrl" TEXT NOT NULL,
  "authType" TEXT NOT NULL DEFAULT 'OAUTH', "commUser" TEXT, "authToken" TEXT,
  "release" TEXT, "status" TEXT NOT NULL DEFAULT 'PENDING', "lastSyncAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "S4Connection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "S4Connection_clientId_key" ON "S4Connection"("clientId");
ALTER TABLE "S4Connection" ADD CONSTRAINT "S4Connection_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "UpgradeFinding" (
  "id" TEXT NOT NULL, "clientId" TEXT NOT NULL, "release" TEXT NOT NULL,
  "area" TEXT NOT NULL, "object" TEXT NOT NULL, "impact" TEXT NOT NULL DEFAULT 'CHANGED',
  "detail" TEXT, "recommendation" TEXT, "resolved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UpgradeFinding_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "UpgradeFinding_clientId_impact_idx" ON "UpgradeFinding"("clientId", "impact");
ALTER TABLE "UpgradeFinding" ADD CONSTRAINT "UpgradeFinding_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CleanCoreItem" (
  "id" TEXT NOT NULL, "clientId" TEXT NOT NULL, "category" TEXT NOT NULL, "object" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM', "points" INTEGER NOT NULL DEFAULT 5,
  "recommendation" TEXT, "resolved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CleanCoreItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CleanCoreItem_clientId_resolved_idx" ON "CleanCoreItem"("clientId", "resolved");
ALTER TABLE "CleanCoreItem" ADD CONSTRAINT "CleanCoreItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ApiUsage" (
  "id" TEXT NOT NULL, "clientId" TEXT NOT NULL, "apiName" TEXT NOT NULL, "version" TEXT,
  "scenario" TEXT, "calls30d" INTEGER NOT NULL DEFAULT 0, "deprecated" BOOLEAN NOT NULL DEFAULT false,
  "deprecationRelease" TEXT, "replacement" TEXT, "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ApiUsage_clientId_apiName_version_key" ON "ApiUsage"("clientId", "apiName", "version");
ALTER TABLE "ApiUsage" ADD CONSTRAINT "ApiUsage_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CommArrangement" (
  "id" TEXT NOT NULL, "clientId" TEXT NOT NULL, "scenario" TEXT NOT NULL, "name" TEXT NOT NULL,
  "direction" TEXT, "commUser" TEXT, "status" TEXT NOT NULL DEFAULT 'ACTIVE', "certExpiresAt" TIMESTAMP(3),
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommArrangement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CommArrangement_clientId_scenario_name_key" ON "CommArrangement"("clientId", "scenario", "name");
ALTER TABLE "CommArrangement" ADD CONSTRAINT "CommArrangement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "FiscalDoc" (
  "id" TEXT NOT NULL, "clientId" TEXT NOT NULL, "docType" TEXT NOT NULL, "number" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING', "sefazCode" TEXT, "message" TEXT,
  "amountCents" INTEGER NOT NULL DEFAULT 0, "remediable" BOOLEAN NOT NULL DEFAULT false,
  "resolved" BOOLEAN NOT NULL DEFAULT false, "issuedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FiscalDoc_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FiscalDoc_clientId_docType_number_key" ON "FiscalDoc"("clientId", "docType", "number");
CREATE INDEX "FiscalDoc_clientId_status_idx" ON "FiscalDoc"("clientId", "status");
ALTER TABLE "FiscalDoc" ADD CONSTRAINT "FiscalDoc_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CloudEvent" (
  "id" TEXT NOT NULL, "clientId" TEXT NOT NULL, "topic" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DELIVERED', "subscriber" TEXT, "lagMs" INTEGER NOT NULL DEFAULT 0,
  "occurredAt" TIMESTAMP(3), "resolved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CloudEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CloudEvent_clientId_status_idx" ON "CloudEvent"("clientId", "status");
ALTER TABLE "CloudEvent" ADD CONSTRAINT "CloudEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
