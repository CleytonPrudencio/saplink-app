-- Inovações unicórnio: Rede Federada de Falhas, AMS Autônomo

-- RemediationAction: confiança + auto-execução (AMS autônomo)
ALTER TABLE "RemediationAction" ADD COLUMN IF NOT EXISTS "confidence" INTEGER;
ALTER TABLE "RemediationAction" ADD COLUMN IF NOT EXISTS "autoExecuted" BOOLEAN NOT NULL DEFAULT false;

-- Rede Federada de Falhas
CREATE TABLE IF NOT EXISTS "FailureSignature" (
  "id" TEXT NOT NULL,
  "sigKey" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "errorNorm" TEXT NOT NULL,
  "sampleMessage" TEXT,
  "occurrences" INTEGER NOT NULL DEFAULT 0,
  "clientsCount" INTEGER NOT NULL DEFAULT 0,
  "fixes" JSONB,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FailureSignature_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FailureSignature_sigKey_key" ON "FailureSignature"("sigKey");
CREATE INDEX IF NOT EXISTS "FailureSignature_occurrences_idx" ON "FailureSignature"("occurrences");

CREATE TABLE IF NOT EXISTS "FailureSignatureClient" (
  "sigKey" TEXT NOT NULL,
  "clientHash" TEXT NOT NULL,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FailureSignatureClient_pkey" PRIMARY KEY ("sigKey","clientHash")
);

-- AMS Autônomo
CREATE TABLE IF NOT EXISTS "AutoHealPolicy" (
  "consultancyId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "minConfidence" INTEGER NOT NULL DEFAULT 85,
  "allowedActions" JSONB,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AutoHealPolicy_pkey" PRIMARY KEY ("consultancyId")
);
