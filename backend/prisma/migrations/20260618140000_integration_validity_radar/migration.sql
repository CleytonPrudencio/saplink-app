-- A4: Radar de validade (certificados TLS + segredos)
ALTER TABLE "Integration" ADD COLUMN "certExpiresAt" TIMESTAMP(3);
ALTER TABLE "Integration" ADD COLUMN "certCheckedAt" TIMESTAMP(3);
ALTER TABLE "Integration" ADD COLUMN "certHost" TEXT;
ALTER TABLE "Integration" ADD COLUMN "secretExpiresAt" TIMESTAMP(3);
ALTER TABLE "Integration" ADD COLUMN "secretLabel" TEXT;
