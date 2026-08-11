-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'PARSED', 'FAILED');

-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "errorMsg" TEXT,
ADD COLUMN     "status" "UploadStatus" NOT NULL DEFAULT 'PENDING';
