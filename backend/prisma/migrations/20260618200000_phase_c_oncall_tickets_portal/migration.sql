-- Fase C: on-call (NotificationChannel), ticket sync (TicketConfig + Alert), portal (Client)

ALTER TABLE "Consultancy" ADD COLUMN "escalateAfterMin" INTEGER NOT NULL DEFAULT 30;

ALTER TABLE "Client" ADD COLUMN "portalEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Client" ADD COLUMN "portalToken" TEXT;
CREATE UNIQUE INDEX "Client_portalToken_key" ON "Client"("portalToken");

ALTER TABLE "Alert" ADD COLUMN "notifiedAt" TIMESTAMP(3);
ALTER TABLE "Alert" ADD COLUMN "escalationLevel" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Alert" ADD COLUMN "ticketKey" TEXT;
ALTER TABLE "Alert" ADD COLUMN "ticketUrl" TEXT;
ALTER TABLE "Alert" ADD COLUMN "ticketClosedAt" TIMESTAMP(3);

CREATE TABLE "NotificationChannel" (
  "id" TEXT NOT NULL,
  "consultancyId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "minSeverity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "level" INTEGER NOT NULL DEFAULT 1,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationChannel_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "NotificationChannel_consultancyId_idx" ON "NotificationChannel"("consultancyId");
ALTER TABLE "NotificationChannel" ADD CONSTRAINT "NotificationChannel_consultancyId_fkey" FOREIGN KEY ("consultancyId") REFERENCES "Consultancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "TicketConfig" (
  "id" TEXT NOT NULL,
  "consultancyId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "baseUrl" TEXT NOT NULL,
  "authUser" TEXT NOT NULL,
  "authToken" TEXT NOT NULL,
  "projectKey" TEXT,
  "minSeverity" TEXT NOT NULL DEFAULT 'HIGH',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TicketConfig_consultancyId_key" ON "TicketConfig"("consultancyId");
ALTER TABLE "TicketConfig" ADD CONSTRAINT "TicketConfig_consultancyId_fkey" FOREIGN KEY ("consultancyId") REFERENCES "Consultancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
