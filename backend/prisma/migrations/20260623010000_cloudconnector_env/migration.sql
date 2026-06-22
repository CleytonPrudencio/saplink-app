-- Conector SAP Cloud por ambiente (DEV/HML/PRD)
ALTER TABLE "CloudConnector" ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
DROP INDEX IF EXISTS "CloudConnector_clientId_product_key";
CREATE UNIQUE INDEX IF NOT EXISTS "CloudConnector_clientId_product_environment_key" ON "CloudConnector"("clientId","product","environment");
