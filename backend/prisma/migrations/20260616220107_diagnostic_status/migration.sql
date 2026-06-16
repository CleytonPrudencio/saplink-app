-- AlterTable
ALTER TABLE "Diagnostic" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DONE',
ALTER COLUMN "response" SET DEFAULT '';
