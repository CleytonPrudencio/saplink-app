CREATE TABLE "AiCache" (
  "id" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "response" TEXT NOT NULL,
  "provider" TEXT,
  "hits" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiCache_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AiCache_scope_keyHash_key" ON "AiCache"("scope", "keyHash");
CREATE INDEX "AiCache_createdAt_idx" ON "AiCache"("createdAt");
