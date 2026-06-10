-- CreateEnum
CREATE TYPE "DocumentProceedingStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentItemStatus" AS ENUM ('REQUESTED', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentActivityType" AS ENUM ('CREATED', 'UPDATED', 'STATUS_CHANGED', 'DOCUMENT_ADDED', 'VERSION_UPLOADED', 'COMMENT_ADDED');

-- CreateTable
CREATE TABLE "DocumentProceeding" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "DocumentProceedingStatus" NOT NULL DEFAULT 'OPEN',
    "dueAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdByAccountId" INTEGER NOT NULL,
    "businessAccountId" INTEGER NOT NULL,
    "professionalAccountId" INTEGER NOT NULL,

    CONSTRAINT "DocumentProceeding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentItem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "proceedingId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" "DocumentItemStatus" NOT NULL DEFAULT 'REQUESTED',
    "dueAt" TIMESTAMP(3),
    "requestedByAccountId" INTEGER,
    "uploadedByAccountId" INTEGER,

    CONSTRAINT "DocumentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "documentId" INTEGER NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedByAccountId" INTEGER NOT NULL,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentComment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "proceedingId" INTEGER NOT NULL,
    "documentId" INTEGER,
    "authorAccountId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "DocumentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentActivity" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "proceedingId" INTEGER NOT NULL,
    "actorAccountId" INTEGER NOT NULL,
    "type" "DocumentActivityType" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "details" JSONB,

    CONSTRAINT "DocumentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentProceeding_businessAccountId_professionalAccountId_status_idx" ON "DocumentProceeding"("businessAccountId", "professionalAccountId", "status");

-- CreateIndex
CREATE INDEX "DocumentProceeding_createdByAccountId_idx" ON "DocumentProceeding"("createdByAccountId");

-- CreateIndex
CREATE INDEX "DocumentItem_proceedingId_status_idx" ON "DocumentItem"("proceedingId", "status");

-- CreateIndex
CREATE INDEX "DocumentItem_requestedByAccountId_idx" ON "DocumentItem"("requestedByAccountId");

-- CreateIndex
CREATE INDEX "DocumentItem_uploadedByAccountId_idx" ON "DocumentItem"("uploadedByAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_documentId_versionNumber_key" ON "DocumentVersion"("documentId", "versionNumber");

-- CreateIndex
CREATE INDEX "DocumentVersion_uploadedByAccountId_idx" ON "DocumentVersion"("uploadedByAccountId");

-- CreateIndex
CREATE INDEX "DocumentComment_proceedingId_idx" ON "DocumentComment"("proceedingId");

-- CreateIndex
CREATE INDEX "DocumentComment_documentId_idx" ON "DocumentComment"("documentId");

-- CreateIndex
CREATE INDEX "DocumentComment_authorAccountId_idx" ON "DocumentComment"("authorAccountId");

-- CreateIndex
CREATE INDEX "DocumentActivity_proceedingId_type_idx" ON "DocumentActivity"("proceedingId", "type");

-- CreateIndex
CREATE INDEX "DocumentActivity_actorAccountId_idx" ON "DocumentActivity"("actorAccountId");

-- AddForeignKey
ALTER TABLE "DocumentProceeding" ADD CONSTRAINT "DocumentProceeding_createdByAccountId_fkey" FOREIGN KEY ("createdByAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentProceeding" ADD CONSTRAINT "DocumentProceeding_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentProceeding" ADD CONSTRAINT "DocumentProceeding_professionalAccountId_fkey" FOREIGN KEY ("professionalAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentItem" ADD CONSTRAINT "DocumentItem_proceedingId_fkey" FOREIGN KEY ("proceedingId") REFERENCES "DocumentProceeding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentItem" ADD CONSTRAINT "DocumentItem_requestedByAccountId_fkey" FOREIGN KEY ("requestedByAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentItem" ADD CONSTRAINT "DocumentItem_uploadedByAccountId_fkey" FOREIGN KEY ("uploadedByAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "DocumentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_uploadedByAccountId_fkey" FOREIGN KEY ("uploadedByAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_proceedingId_fkey" FOREIGN KEY ("proceedingId") REFERENCES "DocumentProceeding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "DocumentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_authorAccountId_fkey" FOREIGN KEY ("authorAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentActivity" ADD CONSTRAINT "DocumentActivity_proceedingId_fkey" FOREIGN KEY ("proceedingId") REFERENCES "DocumentProceeding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentActivity" ADD CONSTRAINT "DocumentActivity_actorAccountId_fkey" FOREIGN KEY ("actorAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
