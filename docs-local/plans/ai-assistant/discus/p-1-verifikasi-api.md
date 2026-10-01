# P-1 — API menolak user yang belum terverifikasi

> **Status: DISETUJUI user (2026-10-01)** — semua saran di "Perlu diputuskan" diterima. Belum dikerjakan; menunggu perintah mulai. Branch: `fix/api-require-verified-user` (dari `main`).
> Asal: `temuan.md` temuan 7 (opsi B, dikerjakan sebelum pondasi AI).

## Istilah (dipakai seragam di semua dokumen)

| Istilah | Arti di kode |
|---|---|
| **Terverifikasi** (= "sudah di-acc") | `User.emailVerified === true` — diset admin di `/admin/users` (label "Terverifikasi") |
| **Belum terverifikasi** (= "belum di-acc") | `emailVerified` bernilai `false` **atau `null`** |

Walau nama kolomnya `emailVerified`, di project ini artinya **verifikasi oleh admin**, bukan verifikasi
email (tidak ada email verifikasi yang dikirim — `auth.ts` tidak memakai `requireEmailVerification`).

## Masalah

Frontend sudah menahan user belum terverifikasi (`signin.tsx` langsung logout, `authMiddleware.tsx`
mengarahkan ke `/signin`), tetapi `apiMiddleware.tsx` hanya mengecek ada/tidaknya user. Sesi tetap
dibuat saat login, sehingga user belum terverifikasi bisa memanggil API data secara langsung.

## Perubahan yang diusulkan

1. **`src/middleware/apiMiddleware.tsx`** — setelah cek `!user` (401), tambah cek
   `user.emailVerified !== true` → **403** `{ message: "Akun menunggu verifikasi admin" }`, kecuali path di
   daftar pengecualian. Berlaku untuk login sesi **dan** API key.
2. Logika keputusan diekstrak ke fungsi murni kecil (mis. `isVerified(user)`, `isUnverifiedAllowed(pathname)`)
   agar bisa dites tanpa server/DB.
3. **Frontend diselaraskan untuk nilai `null`**: `authMiddleware.tsx:140` dan `signin.tsx:84` diubah dari
   `=== false` menjadi `!== true`.
4. Script baru **`test:db`** (menjalankan `tests/db/` dengan `DATABASE_URL=$TEST_DATABASE_URL`) yang gagal
   jelas bila `TEST_DATABASE_URL` tidak diset. Dipakai juga oleh pondasi AI.

Tidak berubah: carve-out publik (`/api/noc/wall-snapshot` GET, `/api/wall-layout` GET, `/api/docs`) dan
route yang didaftarkan sebelum `apiMiddleware` di `src/api/index.tsx` (`/api/health`, `/api/version`,
`/api/auth/*`, `/api/session`) — login, logout, dan cek status tetap jalan.

## Pengecualian (user belum terverifikasi tetap boleh)

| Path | Alasan | Keputusan |
|---|---|---|
| `/api/auth/*`, `/api/session` | Login/logout/cek status | Otomatis (di luar middleware) |
| `/api/profile/update` | Halaman `/profile` sengaja terbuka untuk user belum terverifikasi; satu-satunya API yang dipanggilnya | ✅ Boleh |

## Test

| Test | Jenis |
|---|---|
| Fungsi murni: `true` lolos; `false`/`null`/`undefined` ditolak; path pengecualian lolos | Unit, tanpa DB |
| Tanpa sesi → 401 (perilaku lama tetap) | Unit, tanpa DB |
| User belum terverifikasi (sesi nyata) → 403 di `GET /api/keuangan`; lolos di pengecualian | `test:db` (`dashboard_noc_test`) |
| User terverifikasi → tidak berubah | `test:db` |
| API key milik user belum terverifikasi → 403 | `test:db` |

## Pengaman sebelum merge/deploy

1. Query hitung **read-only** di staging & produksi: jumlah user dengan `emailVerified` `false`/`null`.
2. Bila ada user `null` yang seharusnya aktif → admin memverifikasi mereka dulu di `/admin/users`.
3. Rollback: revert satu commit (tidak ada migrasi DB).

## Breaking change

Ya, untuk user belum terverifikasi: panggilan API data yang sebelumnya lolos kini 403. Integrasi yang
memakai API key milik user belum terverifikasi berhenti bekerja — memang itu celah yang ditutup.

## Keputusan (2026-10-01)

Semua dijawab **ya** oleh user:

1. `/api/profile/update` tetap boleh untuk user belum terverifikasi? (Saran: **ya**, sesuai desain `/profile` saat ini.)
2. API key milik user belum terverifikasi ikut ditolak? (Saran: **ya**.)
3. Teks pesan 403 "Akun menunggu verifikasi admin" — setuju?
4. Frontend ikut diselaraskan untuk `null`? (Saran: **ya**, agar UI dan API sama.)
