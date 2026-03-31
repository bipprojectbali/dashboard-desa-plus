-- CreateTable
CREATE TABLE "document_stat" (
    "id" TEXT NOT NULL,
    "villageId" TEXT NOT NULL DEFAULT 'desa1',
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_stat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_stat_villageId_label_key" ON "document_stat"("villageId", "label");
