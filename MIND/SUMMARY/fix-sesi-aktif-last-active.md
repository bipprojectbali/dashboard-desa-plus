# Fix: SesiAktifModal — Tampilkan Last Active, bukan Login Time

## Perubahan
File: `src/components/pengaturan/keamanan/SesiAktifModal.tsx`

### 1. Tambah `updatedAt` ke interface `Session`
```ts
interface Session {
  // ...
  createdAt: string | Date;
+ updatedAt: string | Date;  // waktu terakhir sesi aktif digunakan
  expiresAt: string | Date;
  // ...
}
```

### 2. Ganti label di `SessionCard`
```tsx
// Sebelum
{session.ipAddress ?? "IP tidak diketahui"} · Login{" "}
{formatDate(session.createdAt)}

// Sesudah
{session.ipAddress ?? "IP tidak diketahui"} · Aktif{" "}
{formatDate(session.updatedAt)}
```

## Konteks
Deskripsi fitur mensyaratkan tampilkan **last-active** per sesi.
Sebelumnya komponen menampilkan `createdAt` (waktu login pertama kali),
padahal Prisma model `Session` sudah punya `updatedAt` yang diperbarui
setiap kali sesi digunakan — itulah yang lebih relevan sebagai "last active".

## File Terdampak
- `src/components/pengaturan/keamanan/SesiAktifModal.tsx`
