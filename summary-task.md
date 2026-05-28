# Summary Task: Global Search + Mobile UI Polish

## Tanggal
2026-05-28

## Branch
`feat/global-search-mobile-ui-polish`

---

## 1. Fitur Baru: Global Search

### Backend (`src/api/search.ts`) — *file baru*
- Endpoint `GET /api/search?q=<query>&modules=complaint,activity,document`
- Full-text search PostgreSQL menggunakan `to_tsvector` + `plainto_tsquery` (simple dictionary)
- Mencari di 3 tabel: `complaint` (judul + deskripsi), `activity` (judul + deskripsi), `document` (judul + kategori)
- Ranking per-baris dengan `ts_rank`, merged dan limited 20 hasil teratas
- Response menyertakan `module`, `id`, `title`, `snippet`, `url` navigasi

### Frontend (`src/components/global-search.tsx`) — *file baru*
- Dialog Command palette (Radix `<Command>` + Shadcn `<Dialog>`)
- Debounce 300ms, fetch ke `/api/search`
- Grouping hasil per modul (Pengaduan / Kegiatan / Dokumen)
- Klik hasil → navigasi ke halaman yang sesuai via TanStack Router
- Keyboard shortcut `Ctrl/Cmd + K` untuk buka
- State di-export via `useGlobalSearch()` hook

### Header (`src/components/header.tsx`)
- Tambah tombol Search (ikon `<Search>`) yang membuka GlobalSearch dialog
- Integrasi `useGlobalSearch()` hook
- Breadcrumbs dan sidebar toggle dirapikan di layout header

### API Registration (`src/api/index.tsx`)
- Register `searchRoutes` sebagai plugin Elysia

### Generated Files
- `generated/api.ts` + `generated/schema.json` diperbarui untuk endpoint search baru

---

## 2. Admin Dashboard: Hapus Mock Data (`src/routes/admin/index.tsx`)

- Hapus hardcoded mock stats (`Total Users: 1,234`, dll.)
- Fetch real data dari:
  - `GET /api/admin/stats` → `AdminStats` (userCount, adminCount, version, appName, environment)
  - `GET /api/system/stats` → `SystemStats` (memPct, cpuPct, diskUsedPct, diskFreePct)
- Loading skeleton saat data belum tersedia
- Error state dengan pesan bahasa Indonesia
- Helper `statusBadgeProps(value, threshold)` → warna badge merah/oranye/hijau berdasarkan threshold

---

## 3. UI Fix: Pengaturan Pages

### Dark Mode Background
Semua card `<Paper>` di halaman pengaturan sekarang mendapat `bg={dark ? "#1E293B" : "white"}` yang konsisten:
- `akses-dan-tim.tsx` (3 card)
- `notifikasi.tsx` (3 card)
- `sinkronisasi.tsx` — via prop `backgroundColor` baru pada `SyncCard`
- `umum.tsx` (2 card)

### Flexbox Overflow Prevention
Item-item dalam `<Group>` di `akses-dan-tim.tsx`, `keamanan.tsx`, `umum.tsx`:
- Kontainer kiri: `style={{ flex: 1, minWidth: 0 }}`
- Icon: `style={{ flexShrink: 0 }}`
- Box teks: `style={{ minWidth: 0 }}`
- Deskripsi: `style={{ wordBreak: "break-word" }}`
- Elemen kanan (button/badge/switch): `style={{ flexShrink: 0 }}`

### Input Size (`keamanan.tsx`)
- Input IP whitelist: `size="xs"` → `size="sm"` + `minHeight: "44px"`
- ActionIcon tambah IP: `size="md"` → `size="lg"` untuk tap target lebih baik

### Select Inputs (`umum.tsx`)
- Select Bahasa, Zona Waktu, Format Tanggal, Interval Refresh: custom background `#213654` (dark) / `#EBF2FD` (light) + `minHeight: "44px"`

---

## 4. Mobile Responsive: Modals Full-Screen

Semua modal penting kini menggunakan `fullScreen={!!isMobile}` (breakpoint `max-width: 48em`):

| Modal | File |
|---|---|
| Kelola Role | `src/components/pengaturan/akses/KelolaRoleModal.tsx` |
| Undangan Anggota | `src/components/pengaturan/akses/UndanganModal.tsx` |
| Sesi Aktif | `src/components/pengaturan/keamanan/SesiAktifModal.tsx` |
| Ubah Password | `src/components/pengaturan/keamanan/UbahPasswordModal.tsx` |
| Innovation Idea | `src/components/layanan/innovation-idea-modal.tsx` |

Input di UndanganModal dan UbahPasswordModal juga mendapat `minHeight: "44px"` untuk tap target yang sesuai WCAG.

---

## 5. Help Page (`src/components/help-page.tsx`)

- Jenna Virtual Assistant section dinonaktifkan sementara (`{false && ...}`) — akan dikerjakan di sprint berikutnya

---

## File Berubah

| File | Status | Deskripsi |
|---|---|---|
| `src/api/search.ts` | **Baru** | Backend global search API |
| `src/components/global-search.tsx` | **Baru** | Frontend global search dialog |
| `generated/api.ts` | Modified | Regenerasi API types |
| `generated/schema.json` | Modified | Regenerasi schema |
| `src/api/index.tsx` | Modified | Register searchRoutes |
| `src/components/header.tsx` | Modified | Integrasi global search + layout |
| `src/components/help-page.tsx` | Modified | Nonaktifkan Jenna section |
| `src/components/layanan/innovation-idea-modal.tsx` | Modified | fullScreen mobile |
| `src/components/pengaturan/akses-dan-tim.tsx` | Modified | Dark mode bg + flexbox fix |
| `src/components/pengaturan/akses/KelolaRoleModal.tsx` | Modified | fullScreen mobile |
| `src/components/pengaturan/akses/UndanganModal.tsx` | Modified | fullScreen + input minHeight |
| `src/components/pengaturan/keamanan.tsx` | Modified | Dark mode + flexbox + input size |
| `src/components/pengaturan/keamanan/SesiAktifModal.tsx` | Modified | fullScreen mobile |
| `src/components/pengaturan/keamanan/UbahPasswordModal.tsx` | Modified | fullScreen + input minHeight |
| `src/components/pengaturan/notifikasi.tsx` | Modified | Dark mode bg |
| `src/components/pengaturan/sinkronisasi.tsx` | Modified | Dark mode bg via prop |
| `src/components/pengaturan/umum.tsx` | Modified | Dark mode bg + flexbox + select style |
| `src/routes/admin/index.tsx` | Modified | Real API data, hapus mock |
