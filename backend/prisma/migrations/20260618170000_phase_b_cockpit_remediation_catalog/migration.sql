-- Fase B: cockpit (SapItem), remediação (RemediationAction), catálogo (InterfaceCatalogItem)

CREATE TABLE "SapItem" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "integrationId" TEXT,
  "kind" TEXT NOT NULL,
  "direction" TEXT,
  "ref" TEXT NOT NULL,
  "messageType" TEXT,
  "partner" TEXT,
  "statusCode" TEXT,
  "statusText" TEXT,
  "depth" INTEGER NOT NULL DEFAULT 1,
  "remediable" BOOLEAN NOT NULL DEFAULT false,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SapItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SapItem_integrationId_kind_ref_key" ON "SapItem"("integrationId", "kind", "ref");
CREATE INDEX "SapItem_clientId_kind_resolved_idx" ON "SapItem"("clientId", "kind", "resolved");
ALTER TABLE "SapItem" ADD CONSTRAINT "SapItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SapItem" ADD CONSTRAINT "SapItem_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "RemediationAction" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "integrationId" TEXT,
  "sapItemId" TEXT,
  "actionType" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "params" JSONB,
  "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  "requestedById" TEXT,
  "approvedById" TEXT,
  "resultText" TEXT,
  "beforeText" TEXT,
  "afterText" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedAt" TIMESTAMP(3),
  "executedAt" TIMESTAMP(3),
  CONSTRAINT "RemediationAction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "RemediationAction_clientId_status_idx" ON "RemediationAction"("clientId", "status");
CREATE INDEX "RemediationAction_integrationId_status_idx" ON "RemediationAction"("integrationId", "status");
ALTER TABLE "RemediationAction" ADD CONSTRAINT "RemediationAction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RemediationAction" ADD CONSTRAINT "RemediationAction_sapItemId_fkey" FOREIGN KEY ("sapItemId") REFERENCES "SapItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "InterfaceCatalogItem" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "integrationId" TEXT,
  "kind" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "detail" TEXT,
  "attributes" JSONB,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InterfaceCatalogItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InterfaceCatalogItem_integrationId_kind_name_key" ON "InterfaceCatalogItem"("integrationId", "kind", "name");
CREATE INDEX "InterfaceCatalogItem_clientId_kind_idx" ON "InterfaceCatalogItem"("clientId", "kind");
ALTER TABLE "InterfaceCatalogItem" ADD CONSTRAINT "InterfaceCatalogItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
