-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_consultancyId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "consultancyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_consultancyId_fkey" FOREIGN KEY ("consultancyId") REFERENCES "Consultancy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
