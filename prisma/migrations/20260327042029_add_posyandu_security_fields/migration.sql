/*
  Warnings:

  - A unique constraint covering the columns `[reportNumber]` on the table `SecurityReport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `location` to the `Posyandu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Posyandu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedule` to the `Posyandu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Posyandu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Posyandu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `SecurityReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportNumber` to the `SecurityReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportedBy` to the `SecurityReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `SecurityReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SecurityReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Posyandu" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "schedule" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SecurityReport" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "reportNumber" TEXT NOT NULL,
ADD COLUMN     "reportedBy" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'BARU',
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SecurityReport_reportNumber_key" ON "SecurityReport"("reportNumber");
