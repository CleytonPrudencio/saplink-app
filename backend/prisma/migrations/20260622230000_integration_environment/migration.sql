-- Ambiente (DEV/HML/PRD) por integração
ALTER TABLE "Integration" ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
CREATE INDEX IF NOT EXISTS "Integration_clientId_environment_idx" ON "Integration"("clientId","environment");
