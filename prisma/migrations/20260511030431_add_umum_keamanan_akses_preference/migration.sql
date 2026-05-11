-- CreateTable
CREATE TABLE "umum_preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bahasa" TEXT NOT NULL DEFAULT 'id',
    "zonaWaktu" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "formatTanggal" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "refreshOtomatis" BOOLEAN NOT NULL DEFAULT true,
    "intervalRefresh" TEXT NOT NULL DEFAULT '1',
    "tampilkanGrid" BOOLEAN NOT NULL DEFAULT true,
    "animasiTransisi" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "umum_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keamanan_preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "twoFactorAuth" BOOLEAN NOT NULL DEFAULT false,
    "biometrikLogin" BOOLEAN NOT NULL DEFAULT false,
    "ipWhitelist" BOOLEAN NOT NULL DEFAULT false,
    "logAktivitas" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keamanan_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "akses_preference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "izinExportData" BOOLEAN NOT NULL DEFAULT true,
    "requireApprovalPerubahan" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "akses_preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "umum_preference_userId_key" ON "umum_preference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "keamanan_preference_userId_key" ON "keamanan_preference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "akses_preference_userId_key" ON "akses_preference"("userId");

-- AddForeignKey
ALTER TABLE "umum_preference" ADD CONSTRAINT "umum_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keamanan_preference" ADD CONSTRAINT "keamanan_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "akses_preference" ADD CONSTRAINT "akses_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
