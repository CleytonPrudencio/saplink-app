-- Marketplace de runbooks
CREATE TABLE IF NOT EXISTS "Runbook" (
  "id" TEXT NOT NULL,
  "authorConsultancyId" TEXT NOT NULL,
  "authorName" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "triggerKeywords" TEXT,
  "steps" JSONB NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "installs" INTEGER NOT NULL DEFAULT 0,
  "ratingSum" INTEGER NOT NULL DEFAULT 0,
  "ratingCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Runbook_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Runbook_published_category_idx" ON "Runbook"("published","category");

CREATE TABLE IF NOT EXISTS "RunbookInstall" (
  "id" TEXT NOT NULL,
  "consultancyId" TEXT NOT NULL,
  "runbookId" TEXT NOT NULL,
  "rating" INTEGER,
  "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RunbookInstall_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "RunbookInstall_consultancyId_runbookId_key" ON "RunbookInstall"("consultancyId","runbookId");
CREATE INDEX IF NOT EXISTS "RunbookInstall_consultancyId_idx" ON "RunbookInstall"("consultancyId");
