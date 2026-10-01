-- P-1 pre-check (READ-ONLY) — jalankan di staging & produksi SEBELUM P-1 di-deploy.
-- Tujuan: tahu siapa yang akan kehilangan akses API setelah P-1 (user emailVerified false/null
-- dan API key aktif milik mereka), supaya admin bisa memverifikasi yang memang aktif lebih dulu.
--
-- Cara pakai:  psql "<DATABASE_URL target>" -f p-1-precheck.sql
-- Semua query berada dalam transaksi READ ONLY dan diakhiri ROLLBACK — tidak ada data yang diubah.
-- Kolom rahasia (api_key.key, session.token) sengaja TIDAK diambil.
-- Hasil berisi email user: jangan disalin ke chat/tiket publik.

BEGIN TRANSACTION READ ONLY;

-- 1) Ringkasan status verifikasi per role
SELECT
  CASE
    WHEN u."emailVerified" IS TRUE  THEN 'terverifikasi'
    WHEN u."emailVerified" IS FALSE THEN 'belum (false)'
    ELSE                                 'belum (null)'
  END              AS status,
  COALESCE(u.role, '(null)') AS role,
  COUNT(*)         AS jumlah
FROM "user" u
GROUP BY 1, 2
ORDER BY 1, 2;

-- 2) User belum terverifikasi yang masih aktif (punya sesi yang belum kedaluwarsa,
--    atau login dalam 30 hari terakhir) — kandidat diverifikasi admin sebelum deploy
SELECT
  u.id,
  u.name,
  u.email,
  u.role,
  u."emailVerified",
  u."createdAt",
  MAX(s."updatedAt")                                    AS aktivitas_sesi_terakhir,
  COUNT(s.id) FILTER (WHERE s."expiresAt" > now())      AS sesi_aktif
FROM "user" u
JOIN "session" s ON s."userId" = u.id
WHERE u."emailVerified" IS NOT TRUE
GROUP BY u.id, u.name, u.email, u.role, u."emailVerified", u."createdAt"
HAVING COUNT(s.id) FILTER (WHERE s."expiresAt" > now()) > 0
    OR MAX(s."updatedAt") > now() - INTERVAL '30 days'
ORDER BY aktivitas_sesi_terakhir DESC;

-- 3) API key aktif milik user belum terverifikasi — integrasi ini akan menerima 403 setelah P-1
SELECT
  k.id          AS api_key_id,
  k.name        AS nama_key,
  k."createdAt" AS key_dibuat,
  k."expiresAt" AS key_kedaluwarsa,
  u.id          AS user_id,
  u.email       AS pemilik,
  u."emailVerified"
FROM api_key k
JOIN "user" u ON u.id = k."userId"
WHERE k."isActive" IS TRUE
  AND (k."expiresAt" IS NULL OR k."expiresAt" > now())
  AND u."emailVerified" IS NOT TRUE
ORDER BY k."createdAt" DESC;

-- 4) Angka ringkas untuk laporan
SELECT
  (SELECT COUNT(*) FROM "user" WHERE "emailVerified" IS NOT TRUE)             AS user_belum_terverifikasi,
  (SELECT COUNT(*) FROM "user" WHERE "emailVerified" IS NULL)                 AS user_null,
  (SELECT COUNT(*) FROM api_key k JOIN "user" u ON u.id = k."userId"
     WHERE k."isActive" IS TRUE
       AND (k."expiresAt" IS NULL OR k."expiresAt" > now())
       AND u."emailVerified" IS NOT TRUE)                                     AS api_key_aktif_terdampak;

ROLLBACK;
