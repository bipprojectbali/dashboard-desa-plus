# Summary: Auth Google OAuth — Profile Page & Verification Banner

## Tanggal
2026-05-26

## Branch
`feat/auth-google-profile-verification`

---

## Perubahan Utama

### 1. Alur Google Sign-in Disederhanakan
**File:** `src/routes/signin.tsx`, `src/routes/signup.tsx`

- Google dan GitHub OAuth callback diubah dari `/auth-callback?intent=signin|signup` → `/profile`
- User yang sign-in/sign-up via Google/GitHub langsung landing di halaman profil tanpa perantara route khusus
- Menghapus kompleksitas intent-based callback yang tidak diperlukan

### 2. Banner Verifikasi Admin di Halaman Profil
**File:** `src/routes/profile/index.tsx`

- Tambah `Alert` Mantine (warna orange) di paling atas konten profile
- Banner muncul **hanya** jika `snap.user?.emailVerified === false`
- Teks: *"Akun kamu sedang menunggu verifikasi dari administrator. Setelah diverifikasi, kamu bisa mengakses tampilan dashboard secara penuh."*
- Menggunakan icon `IconClock` dari `@tabler/icons-react`
- User yang belum diverifikasi tetap bisa melihat profil mereka, namun tidak bisa akses route lain

### 3. Auth Middleware Exception untuk /profile
**File:** `src/middleware/authMiddleware.tsx`

- Tambah exception: user dengan `emailVerified === false` **tidak** di-redirect ke `/signin` jika mengakses `/profile` atau sub-route-nya (`/profile/edit`, dll.)
- Semua route lain (dashboard, pengaturan, dsb.) tetap memblokir unverified users
- Perubahan minimal, hanya satu kondisi tambahan di `if` check

### 4. Hapus Route `/auth-callback`
**File:** `src/routes/auth-callback.tsx` (dihapus), `src/routeTree.gen.ts` (dibersihkan)

- Route `/auth-callback` dengan 4 modal (belum terdaftar, menunggu validasi, registrasi berhasil, sudah terdaftar) dihapus
- Logika digantikan dengan alur langsung: semua OAuth landing di `/profile`
- `routeTree.gen.ts` dibersihkan dari entri `AuthCallbackRoute`

---

## Alur Login Baru

```
Klik Google Sign-in (dari /signin atau /signup)
            ↓
      OAuth Google selesai
            ↓
      Redirect ke /profile
            ↓
  ┌─────────────────────────────┐
  │ emailVerified === false?    │ → Ya → Profile + Banner orange "Menunggu Verifikasi Admin"
  └─────────────────────────────┘
            ↓ Tidak
  Profile normal — bisa navigasi ke dashboard
```

---

## File yang Diubah
- `src/routes/signin.tsx` — callbackURL Google & GitHub → `/profile`
- `src/routes/signup.tsx` — callbackURL Google & GitHub → `/profile`
- `src/routes/profile/index.tsx` — tambah Alert banner verifikasi
- `src/middleware/authMiddleware.tsx` — exception `/profile` untuk unverified users

## File yang Dihapus
- `src/routes/auth-callback.tsx`
