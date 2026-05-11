# feat/settings-preferences-functional

**Branch:** `feat/settings-preferences-functional`
**Tanggal:** 2026-05-11
**Commit:** `9ac00f3`

---

## Latar Belakang

Halaman Settings (`/pengaturan/*`) memiliki 5 tab, namun hanya tab **Notifikasi** yang benar-benar terhubung ke backend. Tab lainnya menggunakan `defaultChecked` / `defaultValue` statis — tidak ada state management, fetch, atau simpan ke DB.

---

## Perubahan

### 1. Prisma Schema — 3 model baru

**File:** `prisma/schema.prisma`

| Model | Table | Fields |
|-------|-------|--------|
| `UmumPreference` | `umum_preference` | bahasa, zonaWaktu, formatTanggal, refreshOtomatis, intervalRefresh, tampilkanGrid, animasiTransisi |
| `KeamananPreference` | `keamanan_preference` | twoFactorAuth, biometrikLogin, ipWhitelist, logAktivitas |
| `AksesPreference` | `akses_preference` | izinExportData, requireApprovalPerubahan |

Semua model: `userId` unique, FK ke `user` dengan `onDelete: Cascade`.

### 2. Migrations

- `prisma/migrations/20260511022037_add_notification_preference/` — NotificationPreference (dari sesi sebelumnya)
- `prisma/migrations/20260511030431_add_umum_keamanan_akses_preference/` — UmumPreference, KeamananPreference, AksesPreference

### 3. API Handlers — 4 file baru

**Pola:** `GET /` upsert (auto-create default), `PUT /` upsert dengan body. Auth via middleware.

| File | Endpoint |
|------|----------|
| `src/api/notification-preferences.ts` | `/api/notification-preferences` |
| `src/api/umum-preferences.ts` | `/api/umum-preferences` |
| `src/api/keamanan-preferences.ts` | `/api/keamanan-preferences` |
| `src/api/akses-preferences.ts` | `/api/akses-preferences` |

Di-mount di `src/api/index.tsx`.

### 4. Frontend Components — 4 file diupdate

Semua mengikuti pola identik dengan `notifikasi.tsx`:

| Komponen | Perubahan |
|----------|-----------|
| `src/components/pengaturan/notifikasi.tsx` | Fix response schema |
| `src/components/pengaturan/umum.tsx` | Fully functional: fetch, controlled Select+Switch, save, cancel |
| `src/components/pengaturan/keamanan.tsx` | Switch (2FA, Biometrik, IP, Log) persist ke DB |
| `src/components/pengaturan/akses-dan-tim.tsx` | Switch Kolaborasi persist, counts hardcoded (by design) |

---

## Bug yang Ditemukan dan Diperbaiki

### Bug 1: Elysia Response Schema 422
**Cause:** Middleware `onBeforeHandle` return `{ message: "Unauthorized" }` tapi response schema handler mendefinisikan 401 sebagai `{ error: string }` → Elysia strict-validate response → 422 → fetch throw → nothing happen.

**Fix:** Hapus `401` dari response schema semua handler. Middleware sudah handle 401 sebelum handler dipanggil.

### Bug 2: Babel JSX Parse Error
**Cause:** Generic function `<K extends keyof Prefs>` di file `.tsx` diinterpretasikan Babel sebagai JSX tag.

**Fix:** Ganti signature menjadi `(key: keyof Prefs, value: Prefs[keyof Prefs])` — non-generic, behavior identik.

---

## Status Tab Settings

| Tab | Status Sebelum | Status Sesudah |
|-----|----------------|----------------|
| Notifikasi | ✅ Functional (bug 422 fixed) | ✅ Functional |
| Umum | ❌ Dummy | ✅ Functional |
| Keamanan | ❌ Dummy | ✅ Functional |
| Akses & Tim | ❌ Dummy (switch) | ✅ Switch functional |
| Sinkronisasi | — (tidak diubah) | — |

---

## Catatan

- Tab Akses & Tim: counts ("12 Anggota", "2 Admin", dll) sengaja tetap hardcoded — belum ada role system di schema.
- Tombol action di Keamanan (Ubah Password, Riwayat Login, dll) tetap statis — bukan preference, scope terpisah.
- Branch ini **belum di-merge ke `stg`**.
