CREATE TABLE "ActivityLog" (
  "id" TEXT NOT NULL,
  "consultancyId" TEXT NOT NULL,
  "userId" TEXT,
  "userEmail" TEXT,
  "action" TEXT NOT NULL,
  "method" TEXT,
  "path" TEXT NOT NULL,
  "detail" TEXT,
  "status" INTEGER,
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ActivityLog_consultancyId_createdAt_idx" ON "ActivityLog"("consultancyId", "createdAt");
