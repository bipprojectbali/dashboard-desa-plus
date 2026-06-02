# Summary Task: Role Permission Matrix
**Tanggal:** 2026-06-02  
**Branch:** feat/role-permission-matrix  
**Status:** Selesai

---

## Deskripsi

Implementasi sistem manajemen hak akses berbasis role (RBAC) untuk Dashboard Desa Plus. Fitur ini memungkinkan admin mengatur permission tiap role melalui antarmuka matrix interaktif.

---

## Yang Diimplementasikan

### 1. Prisma Model — `RolePermission`
- File: `prisma/schema.prisma`
- Migration: `20260602064902_add_role_permission`
- Field: `role`, `feature`, `allowed`, `createdAt`, `updatedAt`
- Unique constraint: `@@unique([role, feature])`

### 2. Utility `checkPermission`
- File: `src/utils/permission.ts`
- Fungsi `checkPermission(role, feature)` — async, query DB, fallback ke default
- Fungsi `seedDefaultPermissions()` — seed awal permission ke DB
- Konstanta `FEATURES` (11 fitur) dan `ROLES` (admin, petugas, viewer)

### 3. API Endpoints
- File: `src/api/admin.ts`
- `GET /api/admin/roles/permissions` — kembalikan matrix lengkap + seed defaults
- `PUT /api/admin/roles/permissions` — batch upsert permissions

### 4. Halaman Frontend `/admin/roles`
- File: `src/routes/admin/roles.tsx`
- Tabel matrix: baris = fitur, kolom = role
- Toggle checkbox per cell
- Admin selalu full access (disabled/locked)
- Auto-save dengan notifikasi
- Dirty state indicator

### 5. Navigasi Admin
- File: `src/routes/admin/route.tsx`
- Nav item "Role & Permission" dengan icon `IconShieldLock`
- Posisi: antara Jenna Analytics dan Pengaturan

---

## Fitur yang Dikonfigurasikan

| Key | Label |
|-----|-------|
| `view-dashboard` | Lihat Dashboard |
| `view-demografi` | Lihat Demografi |
| `crud-division` | CRUD Divisi & Kegiatan |
| `crud-complaint` | CRUD Pengaduan |
| `crud-umkm` | CRUD UMKM |
| `crud-resident` | CRUD Data Penduduk |
| `crud-event` | CRUD Event/Agenda |
| `export-pdf` | Export PDF |
| `sync-noc` | Sinkronisasi NOC |
| `view-keamanan` | Laporan Keamanan |
| `manage-budget` | Kelola Anggaran APBDes |

---

## Default Permissions

| Role | Default Access |
|------|---------------|
| ADMIN | Semua fitur (tidak dapat diubah) |
| PETUGAS | Semua kecuali `sync-noc`, `manage-budget` |
| VIEWER | `view-dashboard`, `view-demografi`, `view-keamanan` |

---

## Catatan Teknis
- `checkPermission` digunakan di endpoint protected, fallback ke default jika belum ada DB record
- Admin role selalu return `true` tanpa query DB
- Seed otomatis dijalankan saat GET endpoint pertama kali dipanggil
