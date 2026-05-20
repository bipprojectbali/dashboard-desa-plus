# Feat: Google OAuth — Login & Daftar dengan Google

**Tanggal:** 2026-05-20
**Branch:** `feat/google-oauth`
**Merged ke:** `stg`

---

## Ringkasan

Menambahkan opsi login dan registrasi menggunakan akun Google (OAuth 2.0) di samping metode yang sudah ada (email/password dan GitHub). Better Auth v1.4 mendukung Google secara native — tidak ada paket tambahan yang diperlukan.

---

## File yang Diubah

### 1. `src/utils/auth.ts`
- Tambah blok `google` di dalam `socialProviders`, sejajar dengan `github` yang sudah ada
- Membaca `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` dari environment variables
- Set `redirectURI` ke `${baseUrl}/api/auth/callback/google` — Better Auth otomatis mendaftarkan endpoint callback ini

### 2. `src/routes/signin.tsx`
- Import `IconBrandGoogle` dari `@tabler/icons-react`
- Tambah tombol **"Lanjutkan dengan Google"** di bawah tombol GitHub, dengan styling identik
- `callbackURL` menghormati query param `?redirect=` yang sudah ada

### 3. `src/routes/signup.tsx`
- Import `IconBrandGoogle` dari `@tabler/icons-react`
- Tambah tombol **"Daftar dengan Google"** di bawah tombol GitHub, dengan styling identik
- `callbackURL` mengarah ke `/` (root)

### 4. `.env.example`
- Tambah dua variabel baru di bawah GitHub OAuth section:
  ```
  GOOGLE_CLIENT_ID=""
  GOOGLE_CLIENT_SECRET=""
  ```

---

## Cara Kerja

1. User klik tombol Google → `authClient.signIn.social({ provider: "google" })` dipanggil
2. Better Auth melakukan redirect ke halaman consent Google
3. Setelah user menyetujui, Google redirect ke `/api/auth/callback/google`
4. Better Auth memproses callback, membuat/mengupdate user di database
5. `databaseHooks.user.create.before` yang sudah ada tetap berlaku — user baru via Google juga akan mendapat `emailVerified: false` dan membutuhkan verifikasi admin (kecuali email cocok dengan `ADMIN_EMAIL`)

---

## Setup yang Dibutuhkan

Isi environment variables berikut (dari Google Cloud Console → APIs & Services → Credentials):

| Variabel | Keterangan |
|---|---|
| `GOOGLE_CLIENT_ID` | Client ID dari OAuth 2.0 Client |
| `GOOGLE_CLIENT_SECRET` | Client Secret dari OAuth 2.0 Client |

**Authorized redirect URI** yang harus didaftarkan di Google Console:
- Dev: `http://localhost:3000/api/auth/callback/google`
- Staging: `https://dashboard-desa-plus-stg.wibudev.com/api/auth/callback/google`

---

## Dampak

| Area | Sebelum | Sesudah |
|---|---|---|
| Halaman signin | GitHub saja | GitHub + Google |
| Halaman signup | GitHub saja | GitHub + Google |
| Server auth config | `socialProviders: { github }` | `socialProviders: { github, google }` |
| Env vars | `GITHUB_CLIENT_ID/SECRET` | + `GOOGLE_CLIENT_ID/SECRET` |

Tidak ada perubahan pada skema database, logika verifikasi admin, atau endpoint API lainnya.
