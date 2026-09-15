/*
  Warnings:

  - You are about to drop the column `wantsNewsletter` on the `Waitlist` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "JurisdictionCode" AS ENUM ('NG', 'UK', 'AE', 'QA', 'US_DE');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'MERGED');

-- CreateEnum
CREATE TYPE "EntityStatusTrack" AS ENUM ('EXISTING_COMPANY', 'DREAM_COMPANY');

-- CreateEnum
CREATE TYPE "IncorporationStatus" AS ENUM ('PRE_INCORPORATION', 'PENDING_SUBMISSION', 'INCORPORATED', 'DISSOLVED');

-- AlterTable
ALTER TABLE "Waitlist" DROP COLUMN "wantsNewsletter";

-- CreateTable
CREATE TABLE "RegulatoryProcess" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "jurisdiction" "JurisdictionCode" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "activeVersionId" INTEGER,

    CONSTRAINT "RegulatoryProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessVersion" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "processId" INTEGER NOT NULL,
    "versionNumber" TEXT NOT NULL,
    "changelog" TEXT NOT NULL,
    "publishedByAccountId" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProcessVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessStep" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "versionId" INTEGER NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedDays" INTEGER NOT NULL,
    "statutoryFeeNaira" DOUBLE PRECISION,
    "statutoryFeeUsd" DOUBLE PRECISION,
    "requiredDocs" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "ProcessStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessProposal" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "processId" INTEGER NOT NULL,
    "proposedByAccountId" INTEGER NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "proposedChanges" JSONB NOT NULL,
    "reasoning" TEXT NOT NULL,
    "reviewedByAccountId" INTEGER,
    "reviewNotes" TEXT,

    CONSTRAINT "ProcessProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessEntity" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "businessAccountId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "statusTrack" "EntityStatusTrack" NOT NULL,
    "incorporationStatus" "IncorporationStatus" NOT NULL DEFAULT 'PRE_INCORPORATION',
    "rcNumber" TEXT,
    "tinNumber" TEXT,
    "incorporationDate" TIMESTAMP(3),
    "complianceScore" INTEGER NOT NULL DEFAULT 100,
    "proposedNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetJurisdictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "shareCapital" DOUBLE PRECISION,
    "industrySector" TEXT,

    CONSTRAINT "BusinessEntity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegulatoryProcess_slug_key" ON "RegulatoryProcess"("slug");

-- CreateIndex
CREATE INDEX "RegulatoryProcess_jurisdiction_idx" ON "RegulatoryProcess"("jurisdiction");

-- CreateIndex
CREATE INDEX "ProcessVersion_processId_idx" ON "ProcessVersion"("processId");

-- CreateIndex
CREATE INDEX "ProcessStep_versionId_idx" ON "ProcessStep"("versionId");

-- CreateIndex
CREATE INDEX "ProcessProposal_processId_idx" ON "ProcessProposal"("processId");

-- CreateIndex
CREATE INDEX "ProcessProposal_status_idx" ON "ProcessProposal"("status");

-- CreateIndex
CREATE INDEX "BusinessEntity_businessAccountId_idx" ON "BusinessEntity"("businessAccountId");

-- AddForeignKey
ALTER TABLE "RegulatoryProcess" ADD CONSTRAINT "RegulatoryProcess_activeVersionId_fkey" FOREIGN KEY ("activeVersionId") REFERENCES "ProcessVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessVersion" ADD CONSTRAINT "ProcessVersion_processId_fkey" FOREIGN KEY ("processId") REFERENCES "RegulatoryProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ProcessVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessProposal" ADD CONSTRAINT "ProcessProposal_processId_fkey" FOREIGN KEY ("processId") REFERENCES "RegulatoryProcess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessEntity" ADD CONSTRAINT "BusinessEntity_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "Business"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;
