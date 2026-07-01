-- AlterTable
ALTER TABLE "Waitlist" ADD COLUMN     "expansionTarget" TEXT[] DEFAULT ARRAY[]::TEXT[];
