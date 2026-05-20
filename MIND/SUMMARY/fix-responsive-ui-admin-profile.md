# Fix: Responsive UI — Admin Pages & Profile

**Tanggal:** 2026-05-20
**Branch:** `fix/responsive-ui-admin-profile`
**Merged ke:** `stg`

---

## Ringkasan

Perbaikan responsivitas UI pada halaman-halaman admin (API Keys, Users) dan halaman Profile agar tampil optimal di mobile maupun desktop. Seluruh perubahan bersifat visual/layout tanpa mengubah logika bisnis atau API.

---

## File yang Diubah

### 1. `src/components/header.tsx`
- Ganti `w="100%"` → `style={{ flex: 1, minWidth: 0 }}` pada Group utama agar flex layout tidak overflow
- Tambah `visibleFrom="sm"` pada komponen `Breadcrumbs` sehingga tersembunyi di layar kecil (mobile)

### 2. `src/components/layout/main-layout.tsx`
- Tambah `wrap="nowrap"` pada Group di `AppShell.Header` agar item header tidak pindah ke baris baru di layar sempit

### 3. `src/routes/admin/apikey.tsx`
- **Mobile** (`hiddenFrom="sm"`): tampilkan setiap API Key sebagai kartu `Paper` dengan nama, key (truncated), toggle status, expiry, created, dan tombol delete
- **Desktop** (`visibleFrom="sm"`): pertahankan tampilan tabel yang sudah ada, dibungkus `Box`
- Header kartu responsif: stack vertikal di mobile, row di desktop
- Padding Card responsif: `base: "md"`, `sm: "xl"`
- Hapus warna background hardcoded (`rgba(251, 240, 223, ...)`) → gunakan token Mantine standar

### 4. `src/routes/admin/route.tsx`
- NavLink **"Pusat Bantuan"**: tambah `onClick` untuk menutup sidebar mobile (`toggleMobile()`) sebelum navigasi
- NavLink **"Keluar"**: tutup sidebar mobile sebelum memanggil `handleLogout()`

### 5. `src/routes/admin/users.tsx`
- **Mobile** (`hiddenFrom="sm"`): setiap user ditampilkan sebagai kartu `Paper` — nama + email (truncate), badge role, badge verifikasi, tanggal bergabung, dan tombol aksi (icon-only, ukuran `md`)
- **Desktop** (`visibleFrom="sm"`): tabel lama dipertahankan dalam `Box`
- Ukuran ikon aksi diperkecil dari 16px → 14px di kartu mobile

### 6. `src/routes/profile/index.tsx`
- **Mobile** (`hiddenFrom="sm"`): tombol header (Admin Panel, Edit Profil, Keluar) menggunakan `ActionIcon` (icon only)
- **Desktop** (`visibleFrom="sm"`): tetap tampil sebagai tombol teks lengkap
- Padding halaman responsif: `px={{ base: "xs", sm: "lg" }}`
- Avatar size: `120` → `100`, tambah `flexShrink: 0`
- Grid info identitas: `span={6}` → `span={{ base: 12, xs: 6 }}` (full width di mobile)
- Fix navigasi logout: tambah `search: { redirect: undefined }` untuk menghindari loop redirect

### 7. `src/routes/profile/route.tsx`
- **Mobile**: tambah `ActionIcon` (chevron kiri) sebagai alternatif tombol "Kembali ke Dashboard"
- **Desktop**: tombol teks tetap tampil via `visibleFrom="sm"`
- Judul "PENGATURAN AKUN": font size responsif `fz={{ base: "sm", sm: "lg" }}`
- Spacer kanan: dari `Box w={150}` → `Box style={{ flex: 1 }}` agar simetris
- Hapus import `Box` yang duplikat di bawah file

---

## Dampak

| Area | Sebelum | Sesudah |
|---|---|---|
| Header mobile | Breadcrumb meluap | Tersembunyi di mobile |
| Admin API Keys mobile | Tabel overflow | Kartu scroll vertikal |
| Admin Users mobile | Tabel overflow | Kartu dengan info lengkap |
| Profile header mobile | Tombol teks berdesakan | Icon-only rapi |
| Sidebar nav mobile | Tidak menutup saat klik menu | Menutup otomatis |

Tidak ada perubahan pada logika server, database schema, atau API endpoint.
