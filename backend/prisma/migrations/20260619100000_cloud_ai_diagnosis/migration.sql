-- CloudItem: diagnóstico de IA por falha (causa raiz + passos de correção)
ALTER TABLE "CloudItem" ADD COLUMN IF NOT EXISTS "aiDiagnosis" TEXT;
ALTER TABLE "CloudItem" ADD COLUMN IF NOT EXISTS "aiDiagnosedAt" TIMESTAMP(3);
