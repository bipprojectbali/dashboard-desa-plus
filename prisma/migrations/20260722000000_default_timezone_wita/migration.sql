-- Zona waktu aplikasi dijadikan tetap ke lokasi desa (Bali / WITA), bukan
-- preferensi per-user. Ubah default kolom + backfill baris lama yang masih
-- menyimpan zona WIB (Asia/Jakarta) agar konsisten dengan tampilan dashboard.

-- Ubah default kolom ke WITA
ALTER TABLE "umum_preference" ALTER COLUMN "zonaWaktu" SET DEFAULT 'Asia/Makassar';

-- Backfill: pindahkan baris yang masih memakai zona lama ke WITA
UPDATE "umum_preference" SET "zonaWaktu" = 'Asia/Makassar' WHERE "zonaWaktu" = 'Asia/Jakarta';
