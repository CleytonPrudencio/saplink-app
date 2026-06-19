-- Leads (manifestação de interesse na landing)
CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "company" TEXT,
  "role" TEXT,
  "employees" TEXT,
  "message" TEXT,
  "source" TEXT DEFAULT 'landing',
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
