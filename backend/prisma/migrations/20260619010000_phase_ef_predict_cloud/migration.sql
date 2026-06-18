-- Fase E/F: amostras de métricas (previsão) + mensagens CPI/AIF

CREATE TABLE "MetricSample" (
  "id" TEXT NOT NULL,
  "integrationId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "latency" INTEGER NOT NULL DEFAULT 0,
  "errorRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "uptime" DOUBLE PRECISION NOT NULL DEFAULT 100,
  "queueDepth" INTEGER NOT NULL DEFAULT 0,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MetricSample_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MetricSample_integrationId_capturedAt_idx" ON "MetricSample"("integrationId", "capturedAt");

CREATE TABLE "CloudItem" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "integrationId" TEXT,
  "source" TEXT NOT NULL,
  "artifact" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "direction" TEXT,
  "status" TEXT,
  "error" TEXT,
  "occurredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "CloudItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CloudItem_integrationId_source_messageId_key" ON "CloudItem"("integrationId", "source", "messageId");
CREATE INDEX "CloudItem_clientId_source_resolved_idx" ON "CloudItem"("clientId", "source", "resolved");
