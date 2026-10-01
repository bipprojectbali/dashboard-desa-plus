-- Kuota khusus akun kiosk /wall (keputusan user 2026-10-01). Satu akun dipakai
-- bersama oleh banyak pengunjung di layar kiosk, jadi batas per user biasa (50)
-- terlalu kecil; admin memilih akun itu dan kuotanya sendiri (default 100).
-- Migrasi terpisah karena add_ai_assistant sudah diterapkan di DB lokal & test.
-- Kolom NOT NULL punya DEFAULT, jadi aman bila assistant_settings sudah berisi baris.
ALTER TABLE "assistant_settings" ADD COLUMN IF NOT EXISTS "kioskUserId" TEXT;
ALTER TABLE "assistant_settings" ADD COLUMN IF NOT EXISTS "dailyMessageLimitKiosk" INTEGER NOT NULL DEFAULT 100;

-- SET NULL: menghapus akun kiosk tidak boleh menghapus pengaturan asisten;
-- kuota kiosk otomatis tidak berlaku sampai admin memilih akun lain.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assistant_settings_kioskUserId_fkey') THEN
        ALTER TABLE "assistant_settings" ADD CONSTRAINT "assistant_settings_kioskUserId_fkey" FOREIGN KEY ("kioskUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
