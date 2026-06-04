# Fix: Permissions, P2021 Guards & Sidebar Role-Based Filtering

**Tanggal:** 4 Juni 2026  
**Branch:** `fix/permissions-sidebar-filtering`  
**Versi:** 0.1.37

---

## Ringkasan

Sesi ini menangani tiga area utama:
1. Error produksi P2003 dan P2021 yang menyebabkan 500 di beberapa endpoint
2. Halaman `/admin/roles` 500 + React warning karena race condition Strict Mode
3. Sidebar tidak menyembunyikan menu saat permission dinonaktifkan untuk role tertentu

---

## Perubahan File

### `package.json`
- **`start` script**: Ditambahkan `bun x prisma migrate deploy &&` sebelum menjalankan server
- **Root cause fix**: Migration pending tidak pernah diapply saat container start — menjadi akar dari semua error P2021

---

### `src/utils/permission.ts`
- Mengubah `DEFAULT_PERMISSIONS` dari `const` menjadi `export const` agar bisa dipakai sebagai fallback di `admin.ts` dan `my-permissions.ts`

---

### `src/api/umum-preferences.ts`
- **GET**: Tambah guard `prisma.user.findUnique` sebelum `upsert` — jika userId dari session token tidak ditemukan di tabel `User`, kembalikan nilai default hardcoded daripada P2003
- **PUT**: Tambah guard yang sama, return 400 jika user tidak ditemukan; tambah `400` ke response schema

**Root cause:** User dengan session token valid tapi userId tidak ada di DB (misalnya akun dihapus tapi cookie masih aktif) menyebabkan FK constraint violation.

---

### `src/api/bantuan.ts`
- **GET `/faq`**: Tambah guard `P2021` — jika tabel `public.faq` belum ada, kembalikan `{ data: [] }` daripada 500

---

### `src/api/admin-faq.ts`
- **GET `/`**: Tambah guard `P2021` — sama seperti `bantuan.ts`

---

### `src/api/admin.ts`
- **GET `/roles/permissions`**:
  - Wrap `seedDefaultPermissions()` dalam try-catch P2021
  - Wrap `findMany` dalam try-catch P2021 — jika tabel belum ada, `records` tetap `[]`
  - Build matrix fallback ke `DEFAULT_PERMISSIONS` jika `records.length === 0` (P2021)
- **PUT `/roles/permissions`**:
  - Wrap `$transaction` dalam try-catch P2021 — return 503 + pesan jelas daripada 500

---

### `src/api/my-permissions.ts` *(file baru)*
- Endpoint `GET /api/my-permissions`
- Admin → semua features diizinkan
- Role lain → query `rolePermission` tabel, fallback ke `DEFAULT_PERMISSIONS` jika kosong atau P2021

---

### `src/store/permission.ts` *(file baru)*
- Valtio proxy store `permissionStore` dengan state `allowed: string[] | null`
- `null` = belum di-load (saat loading tampilkan semua menu agar tidak flash kosong)
- Export `setPermissions()` dan `resetPermissions()`

---

### `src/components/layout/main-layout.tsx`
- Tambah `useEffect` yang fetch `/api/my-permissions` saat `user.id` atau `user.role` berubah
- Reset permissions saat user logout (`user === null`)

---

### `src/components/sidebar.tsx`
- Tambah `permission` key ke setiap item di `allMenuItems` (mapping ke feature key)
- Subscribe ke `permissionStore` via `useSnapshot`
- Filter menu: jika `allowed === null` (loading) tampilkan semua; jika sudah load, filter berdasarkan `allowed.includes(item.permission)`

**Mapping permission key:**
| Menu | Permission Key |
|---|---|
| Beranda | `view-dashboard` |
| Kinerja Divisi | `view-kinerja-divisi` |
| Pengaduan & Layanan Publik | `view-pengaduan` |
| Jenna Analytic | `view-jenna-analytic` |
| Demografi & Pekerjaan | `view-demografi` |
| Keuangan & Anggaran | `view-keuangan` |
| BUMDes | `view-bumdes` |
| Sosial | `view-sosial` |
| Keamanan | `view-keamanan` |

---

### `src/routes/admin/roles.tsx`
- **AbortController**: Ganti `isMounted` ref dengan `AbortController` untuk `fetchPermissions` — pattern yang benar untuk React Strict Mode (double-invocation tidak menyebabkan stale setState)
- **mountedRef**: Tambah guard di semua `setState` dalam `handleSave` dan `successTimer` callback
- **Error message**: Parse JSON body dari error response agar pesan dari server (misal P2021 503) tampil ke user
- **sync-noc disabled untuk user**: Row `sync-noc` di kolom PENGGUNA selalu `checked=false`, `disabled=true`, tooltip khusus — tidak bisa dicentang

---

## Alur Error yang Diperbaiki

```
Container start
  → bun start = hanya jalankan src/index.ts
  → prisma migrate deploy TIDAK pernah jalan
  → 5 pending migrations tidak diapply
  → tabel faq, role_permission, dll tidak ada di DB

GET /api/bantuan/faq         → P2021 → 500
GET /api/admin/faq           → P2021 → 500
GET /api/admin/roles/permissions → P2021 → 500 + React warning
PUT /api/admin/roles/permissions → P2021 → 500

FIX: start script = "prisma migrate deploy && bun src/index.ts"
FIX: semua endpoint P2021 punya fallback/guard defensif
```

---

## React Warning Fix

**Masalah:** `isMounted` ref tidak aman di React Strict Mode — cleanup set `false`, mount ulang set `true`, tapi stale fetch dari siklus pertama tetap bisa lolos.

**Solusi:** `AbortController` — abort request spesifik saat cleanup, bukan flag global. Stale request dari siklus pertama di-abort, tidak sampai setState.
