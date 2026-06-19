-- Inovações v2: reconciliação ponta-a-ponta, ChatOps, remediação generativa

ALTER TABLE "CloudItem" ADD COLUMN IF NOT EXISTS "aiFix" TEXT;

CREATE TABLE IF NOT EXISTS "ReconProcess" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "stages" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReconProcess_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ReconProcess_clientId_idx" ON "ReconProcess"("clientId");

CREATE TABLE IF NOT EXISTS "ChatOpsConfig" (
  "consultancyId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "channel" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatOpsConfig_pkey" PRIMARY KEY ("consultancyId")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ChatOpsConfig_token_key" ON "ChatOpsConfig"("token");
