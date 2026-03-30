/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `activity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `discussion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `division` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "activity" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "villageId" TEXT DEFAULT 'darmasaba';

-- AlterTable
ALTER TABLE "discussion" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "villageId" TEXT DEFAULT 'darmasaba';

-- AlterTable
ALTER TABLE "division" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "villageId" TEXT DEFAULT 'darmasaba';

-- AlterTable
ALTER TABLE "document" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "villageId" TEXT DEFAULT 'darmasaba';

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "villageId" TEXT DEFAULT 'darmasaba';

-- CreateIndex
CREATE UNIQUE INDEX "activity_externalId_key" ON "activity"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "discussion_externalId_key" ON "discussion"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "division_externalId_key" ON "division"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "document_externalId_key" ON "document"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "event_externalId_key" ON "event"("externalId");
