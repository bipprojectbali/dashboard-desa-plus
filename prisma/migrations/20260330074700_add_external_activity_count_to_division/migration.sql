-- AlterTable
ALTER TABLE "activity" ALTER COLUMN "villageId" SET DEFAULT 'desa1';

-- AlterTable
ALTER TABLE "discussion" ALTER COLUMN "villageId" SET DEFAULT 'desa1';

-- AlterTable
ALTER TABLE "division" ADD COLUMN     "externalActivityCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "villageId" SET DEFAULT 'desa1';

-- AlterTable
ALTER TABLE "document" ALTER COLUMN "villageId" SET DEFAULT 'desa1';

-- AlterTable
ALTER TABLE "event" ALTER COLUMN "villageId" SET DEFAULT 'desa1';
