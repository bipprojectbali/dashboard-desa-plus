# Summary Perubahan — 3 Juni 2026

## 1. Sidebar Cleanup — Hapus Bantuan & Pengaturan dari Dashboard Utama

**File:** `src/components/sidebar.tsx`

Sebelumnya sidebar menampilkan menu **Bantuan** dan **Pengaturan** (beserta sub-menu) untuk semua role termasuk user biasa. Dashboard utama seharusnya hanya menampilkan data (NOC data only).

**Perubahan:**
- Hapus `bantuan` dari `menuItems`
- Hapus `settingsItems`, `filteredSettings`, `showSettings`, `settingsCollapseOpen`, `isSettingsActive`
- Hapus state `settingsOpen`
- Hapus import tidak terpakai: `Collapse`, `ChevronDown`, `ChevronUp`, `useSnapshot`, `authStore`
- Hapus seluruh blok JSX settings dengan Collapse dan sub-menu

**Hasil:** Sidebar kini bersih dengan 9 item data saja, tanpa perbedaan role.

---

## 2. Keamanan Page — Fix Alignment Icon & Teks

**File:** `src/components/keamanan-page.tsx`

Icon dan teks di KPI cards, daftar CCTV, dan laporan publik tidak rata (offside).

**Perubahan:**
- KPI cards: restruktur layout `Group justify="space-between" wrap="nowrap"`, pisahkan `Skeleton` dari `Text`, tambah `lh={1}` pada nilai, `ThemeIcon size={52}` dengan `flexShrink: 0`
- CCTV list item: `Group justify="space-between" align="center"`, clock group `gap={4} align="center"` dengan icon size 14
- Laporan cards: outer Group `align="center"`, icon+text groups `gap={4}` + `align="center"`, icon size 14

---

## 3. Preferensi Admin Berlaku Global untuk Semua User

**File:** `src/api/umum-preferences.ts`

Sebelumnya setiap user punya preferensi terpisah. Admin tidak bisa mengatur tampilan untuk semua pengguna.

**Perubahan pada GET `/api/umum-preferences`:**
- Non-admin user kini menerima preferensi yang tersimpan milik admin sebagai standar global
- Jika admin belum pernah simpan preferensi, fallback ke nilai hardcoded default
- Admin tetap mendapat/menyimpan preferensinya sendiri (upsert tidak berubah)

**File:** `src/components/layout/main-layout.tsx`

**Perubahan:**
- Tambah `useEffect` yang fetch `/api/umum-preferences` saat mount untuk non-admin user
- Hasil fetch langsung di-apply ke `i18nStore` via `setLang`, `setZonaWaktu`, `setFormatTanggal`, `setDashboardPrefs`
- Effect hanya berjalan untuk role `user`, skip untuk `admin`

---

## 4. Bantuan & Pengaturan Dipindah ke Admin Panel

**File:** `src/routes/admin/route.tsx`

Menu Bantuan dan Pengaturan tidak relevan di dashboard data utama — seharusnya hanya di admin panel.

**Perubahan:**
- Tambah import `IconAdjustments`
- Tambah nav item baru di admin sidebar: **"Preferensi"** → `/admin/preferences` dengan deskripsi "Bahasa, zona waktu & tampilan dashboard"

---

## 5. Halaman Preferensi Khusus Admin Panel (Baru)

**File:** `src/routes/admin/preferences.tsx` *(file baru)*

Sebelumnya nav item "Preferensi" di admin panel mengarah ke `/pengaturan/umum` yang ada di layout dashboard utama — keluar dari admin panel.

**Perubahan:**
- Buat route baru `/admin/preferences` dengan `beforeLoad: protectedRouteMiddleware`
- Halaman khusus admin dengan header `Title c="orange"` sesuai tema admin panel (orange)
- Layout 2 kolom: **Lokalisasi** (Bahasa, Zona Waktu, Format Tanggal) dan **Perilaku Dashboard** (Refresh, Grid, Animasi)
- Alert orange menjelaskan bahwa perubahan berlaku global untuk semua pengguna role `user`
- SwitchRow dengan highlight orange saat aktif (fill icon + background tint)
- Interval refresh hanya muncul jika Refresh Otomatis aktif
- Pratinjau format tanggal/bahasa aktif di bawah card Lokalisasi
- Action bar dengan status "Ada perubahan belum disimpan" / "Semua tersimpan" + tombol gradient orange
- Warna mengikuti tema admin panel (orange), bukan biru

---

## Ringkasan File yang Diubah

| File | Tipe | Keterangan |
|---|---|---|
| `src/components/sidebar.tsx` | Modified | Hapus bantuan & pengaturan |
| `src/components/keamanan-page.tsx` | Modified | Fix alignment icon & teks |
| `src/api/umum-preferences.ts` | Modified | GET return admin prefs untuk non-admin |
| `src/components/layout/main-layout.tsx` | Modified | Apply admin prefs saat mount |
| `src/routes/admin/route.tsx` | Modified | Tambah nav item Preferensi |
| `src/routes/admin/preferences.tsx` | **New** | Halaman preferensi khusus admin |
