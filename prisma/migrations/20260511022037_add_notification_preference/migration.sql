-- CreateTable
CREATE TABLE "notification_preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "laporanHarian" BOOLEAN NOT NULL DEFAULT true,
    "alertSistem" BOOLEAN NOT NULL DEFAULT true,
    "updateKeamanan" BOOLEAN NOT NULL DEFAULT true,
    "newsletterBulan" BOOLEAN NOT NULL DEFAULT true,
    "alertKritis" BOOLEAN NOT NULL DEFAULT true,
    "aktivitasTim" BOOLEAN NOT NULL DEFAULT true,
    "komentarMention" BOOLEAN NOT NULL DEFAULT true,
    "bunyiNotifikasi" BOOLEAN NOT NULL DEFAULT true,
    "tresholdMemori" BOOLEAN NOT NULL DEFAULT true,
    "tresholdCpu" BOOLEAN NOT NULL DEFAULT true,
    "tresholdDisk" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preference_userId_key" ON "notification_preference"("userId");

-- AddForeignKey
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
