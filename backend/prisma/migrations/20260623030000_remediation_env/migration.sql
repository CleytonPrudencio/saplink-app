-- Trava de produção: ambiente na ação de remediação
ALTER TABLE "RemediationAction" ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
