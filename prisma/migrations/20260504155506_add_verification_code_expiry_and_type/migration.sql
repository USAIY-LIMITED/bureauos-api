-- AlterTable
ALTER TABLE "VerificationCode" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "userId" INTEGER,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'OTP';

-- Verification codes are only meaningful within their account/type context.
DROP INDEX "VerificationCode_code_key";

-- CreateIndex
CREATE INDEX "VerificationCode_accountId_type_completed_idx" ON "VerificationCode"("accountId", "type", "completed");

-- CreateIndex
CREATE INDEX "VerificationCode_userId_type_completed_idx" ON "VerificationCode"("userId", "type", "completed");

-- CreateIndex
CREATE INDEX "VerificationCode_code_type_completed_idx" ON "VerificationCode"("code", "type", "completed");
