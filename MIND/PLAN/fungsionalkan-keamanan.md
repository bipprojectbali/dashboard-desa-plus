# Plan: Fungsionalkan Halaman Pengaturan Keamanan

## Analisa Kondisi Saat Ini

### Yang Sudah Berfungsi ✅
- UI semua switch + action button sudah tampil dan bisa di-klik
- `GET /api/keamanan-preferences` — load 4 prefs dari DB per user
- `PUT /api/keamanan-preferences` — simpan 4 prefs ke DB
- Schema Prisma `KeamananPreference` dengan 4 field: `twoFactorAuth`, `biometrikLogin`, `ipWhitelist`, `logAktivitas`
- Skeleton loading, toast sukses/error, tombol Batal sudah bekerja

### Yang TIDAK Berfungsi ❌

| Fitur | Tipe | Status | Masalah |
|---|---|---|---|
| `twoFactorAuth` | Toggle | Disimpan, tidak dipakai | Better-auth punya plugin `twoFactor` tapi **belum diaktifkan** di `auth.ts`. Setting disimpan ke DB tapi login flow tidak menggunakan 2FA sama sekali |
| `biometrikLogin` | Toggle | Disimpan, tidak dipakai | Web Authentication API (WebAuthn/Passkey) belum diimplementasikan. Better-auth tidak punya passkey plugin bawaan. Hanya menyimpan nilai boolean ke DB |
| `ipWhitelist` | Toggle | Disimpan, tidak dipakai | Tidak ada middleware yang membaca setting ini dari DB dan memblokir request dari IP asing |
| `logAktivitas` | Toggle | Disimpan, tidak dipakai | Tidak ada code yang menulis log aktivitas ke DB. Tidak ada model `ActivityLog` di schema |
| `ubahPassword` | Button "Buka" | onClick kosong | Handler belum diimplementasikan. Better-auth sudah punya endpoint `/api/auth/change-password` yang bisa dipakai via `authClient` |
| `riwayatLogin` | Button "Buka" | onClick kosong | Endpoint `listSessions` ada di better-auth (`/api/auth/list-sessions`). Tapi tidak ada modal/page yang menampilkan data |
| `perangkatTerdaftar` | Button "Buka" | onClick kosong | Same — Session model di DB sudah punya `ipAddress` + `userAgent`. Tinggal ditampilkan |
| `downloadLog` | Button "Buka" | onClick kosong | Tidak ada log, tidak ada endpoint export |

---

## Scope Implementasi (Realistis, Tanpa Dependency Eksternal Baru)

### Priority 1 — Ubah Password (Paling penting, sudah ada API-nya)
Better-auth sudah expose `POST /api/auth/change-password` (via `authClient.changePassword()`). Tinggal buat modal form: current password + new password + confirm.

### Priority 2 — Riwayat Login / Sesi Aktif (Data sudah ada di DB)
Better-auth expose `GET /api/auth/list-sessions` (via `authClient.listSessions()`). Session model sudah punya `ipAddress`, `userAgent`, `createdAt`. Tampilkan dalam modal table + tombol revoke per sesi.

### Priority 3 — Log Aktivitas + Download Log
Buat model `ActivityLog` di Prisma. Rekam event penting (login, perubahan password, perubahan settings) via middleware/hook. Endpoint `GET /api/activity-log` + export ke CSV. Hanya rekam jika `logAktivitas = true` untuk user tersebut.

### Priority 4 — IP Whitelist (Basic enforcement)
Buat middleware di `apiMiddleware.tsx` yang membaca `keamananPreference.ipWhitelist` dari DB. Jika aktif, cek IP request terhadap daftar IP yang diizinkan. Perlu model `IpWhitelistEntry` atau field JSON di `KeamananPreference`. Di UI, tambah panel input daftar IP.

### Priority 5 — 2FA (Butuh setup plugin)
Better-auth punya plugin `twoFactor` yang support TOTP (Google Authenticator style). Perlu menambahkan plugin ke `auth.ts`, migrasi schema (tabel `twoFactor`), dan UI setup QR code. Ini lebih kompleks tapi tidak butuh dependency eksternal baru.

### Out of Scope
- `biometrikLogin` — WebAuthn/Passkey membutuhkan library tambahan dan setup yang kompleks (attestation, credential storage, dll). Tandai sebagai "Coming Soon".
- Email notification untuk security events — butuh SMTP (same constraint seperti di notifikasi.tsx).

---

## Arsitektur Implementasi

```
src/
├── components/pengaturan/
│   ├── keamanan.tsx             # Modifikasi: hubungkan onClick semua ActionRow
│   └── keamanan/
│       ├── UbahPasswordModal.tsx  # Modal form ganti password via authClient
│       └── SesiAktifModal.tsx     # Modal list sesi + revoke via authClient
├── api/
│   ├── activity-log.ts          # GET /api/activity-log, GET /api/activity-log/export
│   └── ip-whitelist.ts          # GET/PUT /api/ip-whitelist (daftar IP)
├── hooks/
│   └── useActivityLogger.ts     # Hook: catat event penting ke API
prisma/
└── schema.prisma                # Tambah model ActivityLog + IpWhitelistEntry
```

### Valtio Store Extension
Tambah `keamananStore` agar `logAktivitas` dan `ipWhitelist` bisa dibaca di middleware/hook tanpa fetch ulang per request.

---

## Task Breakdown

1. **Implementasi Ubah Password** — Modal form dengan `authClient.changePassword()` (bisa dilakukan sekarang tanpa DB change)
2. **Implementasi Sesi Aktif** — Modal list session via `authClient.listSessions()` + revoke per sesi + logout semua sesi lain
3. **Schema + API Activity Log** — Tambah model `ActivityLog` ke Prisma, buat endpoint GET + export CSV, catat event login/settings-change
4. **Hubungkan `logAktivitas` ke activity logger** — Baca pref user saat login/write event, skip logging jika disabled
5. **IP Whitelist** — Tambah `IpWhitelistEntry` model, UI input daftar IP, enforcement di apiMiddleware
6. **Ubah Password UI polish** — `biometrikLogin` ditandai "Coming Soon", `twoFactorAuth` ditandai "Coming Soon (setup diperlukan)"
7. **2FA dengan better-auth plugin** — (Opsional, scope lebih besar) Aktifkan `twoFactor` plugin, migrasi schema, UI QR code setup

---

## Catatan Teknis

### `authClient.changePassword()` sudah available
Better-auth client expose method ini langsung. Request ke `POST /api/auth/change-password` dengan body `{ currentPassword, newPassword, revokeOtherSessions }`.

### `authClient.listSessions()` sudah available  
Returns array session dengan `id`, `ipAddress`, `userAgent`, `createdAt`. Revoke via `authClient.revokeSession({ token })`.

### Session model sudah lengkap
```prisma
model Session {
  id        String   @id
  userId    String
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  ...
}
```
Tidak perlu migrasi baru untuk fitur "Sesi Aktif".
