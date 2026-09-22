-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordSetupExpiresAt" TIMESTAMP(3),
ADD COLUMN     "passwordSetupTokenHash" TEXT;
