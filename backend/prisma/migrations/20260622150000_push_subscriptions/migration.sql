-- Web Push (PWA): inscrições de notificação
CREATE TABLE IF NOT EXISTS "PushSubscription" (
  "id" TEXT NOT NULL,
  "consultancyId" TEXT NOT NULL,
  "userId" TEXT,
  "endpoint" TEXT NOT NULL,
  "keys" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE INDEX IF NOT EXISTS "PushSubscription_consultancyId_idx" ON "PushSubscription"("consultancyId");
