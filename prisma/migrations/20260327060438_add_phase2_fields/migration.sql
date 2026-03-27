/*
  Warnings:

  - A unique constraint covering the columns `[transactionNumber]` on the table `BudgetTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount` to the `BudgetTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `BudgetTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `BudgetTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionNumber` to the `BudgetTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `BudgetTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `EmploymentRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `EmploymentRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `EmploymentRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `HealthRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventDate` to the `PopulationDynamic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `residentName` to the `PopulationDynamic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `PopulationDynamic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BudgetTransaction" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "transactionNumber" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EmploymentRecord" ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "position" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "HealthRecord" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PopulationDynamic" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "residentName" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BudgetTransaction_transactionNumber_key" ON "BudgetTransaction"("transactionNumber");
