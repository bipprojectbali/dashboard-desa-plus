# Feat: Halaman Admin Audit Log (/admin/audit-log)

## Perubahan

### `src/api/admin.ts`
- `GET /admin/activity-logs`: endpoint baru, hanya untuk admin. Mendukung filter `userId`, `action` (comma-separated), `from`, `to` (ISO date string). Paginated 50 per halaman, include relasi `user { name, email }`.
- `GET /admin/activity-logs/export`: endpoint CSV export (max 5000 baris). Header `Content-Disposition: attachment` agar browser langsung download. Filter sama dengan endpoint list. Nama fungsi CSV escaper diganti `csvEscape` (bukan `escape`) untuk menghindari shadow global.

### `src/routes/admin/audit-log.tsx` *(baru)*
- Halaman `/admin/audit-log` dengan filter, tabel, dan export CSV.
- Filter: `Select` user (dropdown dari `/api/admin/users`), `MultiSelect` action (7 opsi hardcoded), `DatePickerInput type="range"` untuk rentang tanggal.
- Kolom tabel: Waktu (locale `id-ID`), User (name + email stacked), Action (`<Code>`), Detail (JSON parsed → `key: value` string), IP Address (`<Code>`).
- Export CSV: `window.location.href` ke endpoint export dengan query params filter aktif.
- Pagination muncul hanya jika `total > 50`.

### `src/routes/admin/route.tsx`
- Import `IconShieldCheck` ditambahkan.
- Entry `{ label: "Audit Log", to: "/admin/audit-log", icon: IconShieldCheck, description: "Riwayat aktivitas semua pengguna" }` ditambahkan ke `navItems` (sebelum "Pengaturan").

## Catatan Implementasi
- Filter state menggunakan local `useState`, konsisten dengan pola admin pages lain (bukan URL search params).
- `formatDetail` meng-handle JSON parse failure gracefully — jika `detail` bukan valid JSON, ditampilkan as-is.
- Tidak ada perubahan skema database — memanfaatkan model `ActivityLog` yang sudah ada.
