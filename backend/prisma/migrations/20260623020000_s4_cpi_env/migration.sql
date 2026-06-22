-- S/4 e CPI por ambiente (1:N) + chaves únicas com environment nos dados agregados

-- S4Connection: clientId @unique → (clientId, environment)
ALTER TABLE "S4Connection" ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
DROP INDEX IF EXISTS "S4Connection_clientId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "S4Connection_clientId_environment_key" ON "S4Connection"("clientId","environment");

-- CpiConfig: clientId @unique → (clientId, environment)
ALTER TABLE "CpiConfig" ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'PRD';
DROP INDEX IF EXISTS "CpiConfig_clientId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "CpiConfig_clientId_environment_key" ON "CpiConfig"("clientId","environment");

-- ApiUsage: (clientId, apiName, version) → + environment
DROP INDEX IF EXISTS "ApiUsage_clientId_apiName_version_key";
CREATE UNIQUE INDEX IF NOT EXISTS "ApiUsage_clientId_apiName_version_environment_key" ON "ApiUsage"("clientId","apiName","version","environment");

-- CommArrangement: (clientId, scenario, name) → + environment
DROP INDEX IF EXISTS "CommArrangement_clientId_scenario_name_key";
CREATE UNIQUE INDEX IF NOT EXISTS "CommArrangement_clientId_scenario_name_environment_key" ON "CommArrangement"("clientId","scenario","name","environment");

-- FiscalDoc: (clientId, docType, number) → + environment
DROP INDEX IF EXISTS "FiscalDoc_clientId_docType_number_key";
CREATE UNIQUE INDEX IF NOT EXISTS "FiscalDoc_clientId_docType_number_environment_key" ON "FiscalDoc"("clientId","docType","number","environment");
