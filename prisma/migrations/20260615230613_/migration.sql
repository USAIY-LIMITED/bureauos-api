/*
  Warnings:

  - You are about to drop the column `firstName` on the `Waitlist` table. All the data in the column will be lost.
  - You are about to drop the column `jurisdiction` on the `Waitlist` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Waitlist` table. All the data in the column will be lost.
  - You are about to drop the column `primaryExpertise` on the `Waitlist` table. All the data in the column will be lost.
  - You are about to drop the column `specializations` on the `Waitlist` table. All the data in the column will be lost.
  - You are about to drop the column `userType` on the `Waitlist` table. All the data in the column will be lost.
  - You are about to drop the column `yearsExperience` on the `Waitlist` table. All the data in the column will be lost.
  - Added the required column `accountType` to the `Waitlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `biggestChallenge` to the `Waitlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `challengeArea` to the `Waitlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Waitlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Waitlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wantsNewsletter` to the `Waitlist` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WaitlistAccountType" AS ENUM ('Founder', 'Professional');

-- DropIndex
DROP INDEX "Waitlist_email_userType_idx";

-- AlterTable
ALTER TABLE "Waitlist" DROP COLUMN "firstName",
DROP COLUMN "jurisdiction",
DROP COLUMN "lastName",
DROP COLUMN "primaryExpertise",
DROP COLUMN "specializations",
DROP COLUMN "userType",
DROP COLUMN "yearsExperience",
ADD COLUMN     "accountType" "WaitlistAccountType" NOT NULL,
ADD COLUMN     "biggestChallenge" TEXT NOT NULL,
ADD COLUMN     "bosHelp" TEXT,
ADD COLUMN     "challengeArea" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "founderStage" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "professionalCategory" TEXT,
ADD COLUMN     "rolePosition" TEXT,
ADD COLUMN     "wantsNewsletter" BOOLEAN NOT NULL;

-- CreateIndex
CREATE INDEX "Waitlist_email_accountType_idx" ON "Waitlist"("email", "accountType");

-- RenameIndex
ALTER INDEX "DocumentProceeding_businessAccountId_professionalAccountId_stat" RENAME TO "DocumentProceeding_businessAccountId_professionalAccountId__idx";
