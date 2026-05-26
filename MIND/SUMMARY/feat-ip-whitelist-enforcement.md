# feat: IP Whitelist Enforcement

**Tanggal:** 2026-05-26
**Branch:** feat/ip-whitelist-enforcement → stg

---

## Latar Belakang

Toggle IP whitelist sudah ada di UI pengaturan keamanan (`keamanan.tsx`) namun bersifat dekoratif — tidak ada enforcement di sisi server. Field `ipWhitelist: Boolean` di model `KeamananPreference` hanya menyimpan preferensi tanpa efek nyata. Tidak ada model untuk menyimpan daftar IP, tidak ada middleware yang memeriksa IP request.

---

## Perubahan

### 1. Prisma Schema (`prisma/schema.prisma`)
- Tambah model `IpWhitelistEntry` dengan field: `id`, `userId`, `ip`, `label?`, `createdAt`
- Constraint `@@unique([userId, ip])` — satu user tidak bisa duplikat IP
- Tambah relasi `ipWhitelistEntries IpWhitelistEntry[]` ke model `User`

### 2. Migration (`prisma/migrations/20260526064127_add_ip_whitelist_entry/`)
- Buat tabel `ip_whitelist_entry` di PostgreSQL

### 3. API CRUD (`src/api/ip-whitelist.ts`) — file baru
- `GET /api/ip-whitelist` — ambil daftar IP whitelist milik user yang login
- `POST /api/ip-whitelist` — tambah IP baru (validasi format IPv4/IPv6, deteksi duplikat → 409)
- `DELETE /api/ip-whitelist/:id` — hapus entry milik user (ownership check)

### 4. Mount API (`src/api/index.tsx`)
- Import dan `.use(ipWhitelist)` di API router

### 5. Middleware Enforcement (`src/middleware/apiMiddleware.tsx`)
- Fungsi `getClientIp()` — baca IP dari `x-forwarded-for` → `x-real-ip` → fallback `"unknown"` (proxy-aware)
- Setelah user teridentifikasi, cek `KeamananPreference.ipWhitelist`
- Jika aktif dan daftar IP tidak kosong, bandingkan `clientIp` dengan `IpWhitelistEntry` user
- IP tidak cocok → **403** `"Akses ditolak: IP tidak diizinkan"` + log warning
- Jika daftar kosong meski toggle aktif, enforcement tidak berjalan (safety: user tidak terkunci)
- `/api/auth/*` otomatis dikecualikan karena dipasang sebelum `apiMiddleware` di `api/index.tsx`

### 6. UI Keamanan (`src/components/pengaturan/keamanan.tsx`)
- Toggle IP whitelist: hilangkan `disabled` dan badge `"Segera Hadir"`
- Saat toggle aktif: panel manajemen IP muncul di bawah toggle
  - Tampilkan daftar IP yang sudah didaftarkan (IP + label opsional + tombol hapus)
  - Form tambah IP: input IP, input label opsional, tombol tambah (Enter juga trigger)
  - Error inline (format invalid, duplikat, network error)
  - Jika daftar kosong, tampilkan pesan informatif

---

## Alur Enforcement

```
Request → apiMiddleware.derive() [identifikasi user]
       → onBeforeHandle()
           ├─ cek auth → 401 jika tidak login
           └─ cek keamananPreference.ipWhitelist
               ├─ false / tidak ada → lanjut normal
               └─ true → ambil IpWhitelistEntry user
                   ├─ daftar kosong → lanjut normal (safety)
                   └─ daftar ada → bandingkan clientIp
                       ├─ cocok → lanjut normal
                       └─ tidak cocok → 403 Forbidden
```

---

## File yang Diubah

| File | Status |
|---|---|
| `prisma/schema.prisma` | Modified |
| `prisma/migrations/20260526064127_add_ip_whitelist_entry/` | New |
| `src/api/ip-whitelist.ts` | New |
| `src/api/index.tsx` | Modified |
| `src/middleware/apiMiddleware.tsx` | Modified |
| `src/components/pengaturan/keamanan.tsx` | Modified |
