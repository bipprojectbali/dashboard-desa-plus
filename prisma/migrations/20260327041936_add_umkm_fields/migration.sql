/*
  Warnings:

  - Added the required column `name` to the `Umkm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `Umkm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Umkm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Umkm" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "owner" TEXT NOT NULL,
ADD COLUMN     "productType" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
