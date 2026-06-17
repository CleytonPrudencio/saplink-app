-- Agente on-premise (RFC/IDoc): token de ingestão e frescor da última leitura
ALTER TABLE "Integration" ADD COLUMN "agentTokenHash" TEXT;
ALTER TABLE "Integration" ADD COLUMN "agentTokenHint" TEXT;
ALTER TABLE "Integration" ADD COLUMN "lastAgentReportAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "Integration_agentTokenHash_key" ON "Integration"("agentTokenHash");
