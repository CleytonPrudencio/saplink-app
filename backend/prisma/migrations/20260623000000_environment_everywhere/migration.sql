-- Separação por ambiente: coluna environment (DEV/HML/PRD) em todas as tabelas de dados.
ALTER TABLE "Alert"                ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "SapItem"              ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "CloudItem"            ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "Diagnostic"           ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "DeadCode"             ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "InterfaceCatalogItem" ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "Transport"            ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "OpsSignal"            ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "BtpResource"          ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "UpgradeFinding"       ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "CleanCoreItem"        ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "ApiUsage"             ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "CommArrangement"      ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "FiscalDoc"            ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
ALTER TABLE "CloudEvent"           ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
