-- A2: Digest semanal por IA
ALTER TABLE "Consultancy" ADD COLUMN "weeklyDigest" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Consultancy" ADD COLUMN "lastDigestAt" TIMESTAMP(3);
