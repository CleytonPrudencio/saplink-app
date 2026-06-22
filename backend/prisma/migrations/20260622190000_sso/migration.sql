-- SSO (OIDC) BYO por consultoria
CREATE TABLE IF NOT EXISTS "SsoConfig" (
  "consultancyId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "clientId" TEXT NOT NULL,
  "clientSecret" TEXT NOT NULL,
  "issuer" TEXT NOT NULL,
  "emailDomain" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SsoConfig_pkey" PRIMARY KEY ("consultancyId")
);
CREATE INDEX IF NOT EXISTS "SsoConfig_emailDomain_idx" ON "SsoConfig"("emailDomain");
