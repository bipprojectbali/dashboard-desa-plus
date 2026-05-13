# Summary: Role Guard, Auth Verification & Sidebar Search

## Tanggal
2026-05-13

## Branch
`feat/role-guard-auth-verification`

---

## Perubahan Utama

### 1. Admin-only Guard di Halaman Pengaturan
**File:** `src/components/pengaturan/akses-dan-tim.tsx`, `src/components/pengaturan/keamanan.tsx`, `src/components/pengaturan/sinkronisasi.tsx`

- Tambah `useSnapshot(authStore)` untuk membaca role user
- Jika bukan admin, halaman menampilkan `Alert` orange "Halaman ini hanya dapat diakses oleh administrator" alih-alih konten penuh
- Mencegah akses konten sensitif (manajemen tim, keamanan server, sinkronisasi NOC) oleh pengguna biasa

### 2. Sidebar: Sembunyikan Submenu Admin-only
**File:** `src/components/sidebar.tsx`

- Tambah `useSnapshot(authStore)` + `isAdmin` check
- `settingsKeamanan`, `settingsAksesTim`, `settingsSinkronisasi` hanya muncul di sidebar jika role = `admin`
- Non-admin hanya melihat **Umum** dan **Notifikasi** di submenu pengaturan

### 3. Sidebar: Search Menu Berfungsi
**File:** `src/components/sidebar.tsx`

- Tambah state `query` + controlled `Input`
- Filter `menuItems` dan `settingsItems` secara real-time berdasarkan input (case-insensitive)
- Saat mengetik: settings collapse otomatis terbuka jika ada hasil, header "Pengaturan" disembunyikan
- Saat query dikosongkan: kembali ke tampilan normal

### 4. Sidebar: Logo Ukuran Konsisten
**File:** `src/components/sidebar.tsx`

- Logo dibungkus `Box` dengan `w={215} h={100} fit="contain"` agar ukuran sama di dark/light mode tanpa bergantung dimensi asli PNG

### 5. Verifikasi Admin sebelum Akses (Login Flow)
**File:** `src/routes/signin.tsx`, `src/utils/auth.ts`, `src/middleware/authMiddleware.tsx`

- **`auth.ts`**: User baru signup non-admin otomatis mendapat `emailVerified = false` via `databaseHooks`; admin (`ADMIN_EMAIL`) mendapat `emailVerified = true`
- **`signin.tsx`**: Setelah login sukses, fetch `/api/session` untuk cek `emailVerified`. Jika `false` → `signOut()` otomatis + tampilkan modal "Menunggu Verifikasi Admin" (ikon jam, warna orange)
- **`authMiddleware.tsx`**: Layer server-side guard — jika session aktif tapi `emailVerified === false`, redirect ke `/signin` (tidak bisa bypass via URL langsung)
- Admin verifikasi user via panel `/admin/users` → tombol "Verifikasi" → `POST /api/admin/users/verify` → `emailVerified = true`

### 6. Fix: AudioContext Autoplay Policy
**File:** `src/hooks/useNotification.ts`

- `playSound()` sekarang panggil `ctx.resume()` sebelum memainkan suara, menghindari error "AudioContext was not allowed to start" di Chrome

### 7. Fix: Route `/api/system/stats` 404
**File:** `src/api/system-stats.ts`

- Path diperbaiki dari `/api/system/stats` → `/system/stats` karena parent Elysia sudah punya `prefix: "/api"` (double prefix bug)

---

## File Baru (Untracked)
- `prisma/migrations/20260513064010_add_activity_log/`
- `prisma/migrations/20260513065235_add_invitation/`
- `src/api/activity-log.ts`, `src/api/invitation.ts`, `src/api/system-stats.ts`
- `src/components/pengaturan/akses/`, `src/components/pengaturan/keamanan/`
- `src/hooks/useActivityLogger.ts`, `src/hooks/useAksesPrefs.ts`, `src/hooks/useApprovalGuard.ts`
- `src/hooks/useNotification.ts`, `src/hooks/useSystemMonitor.ts`
- `src/store/akses.ts`, `src/store/notif.ts`
- `MIND/PLAN/fungsionalkan-*.md`
- `MIND/SUMMARY/feat-settings-ui-overhaul-jenna-i18n.md`
