# Plan: Fungsionalkan Halaman Pengaturan Akses & Tim

## Analisa Kondisi Saat Ini

### Yang Sudah Berfungsi ✅
- UI semua section tampil dengan baik
- `GET /api/akses-preferences` — load 2 prefs dari DB per user
- `PUT /api/akses-preferences` — simpan 2 prefs ke DB
- Schema Prisma `AksesPreference` dengan 2 field: `izinExportData`, `requireApprovalPerubahan`
- Skeleton loading, toast sukses/error, tombol Batal bekerja
- `RingProgress` chart role distribution tampil (tapi dengan data mock)

### Yang TIDAK Berfungsi ❌

| Fitur | Tipe | Status | Masalah |
|---|---|---|---|
| `totalAnggota` | Data | Hardcoded `12` | Tidak ada fetch ke DB. Data nyata ada di `GET /api/admin/stats` (tapi admin-only). Untuk non-admin, tidak ada endpoint yang return jumlah user |
| `roleData` (Admin/Editor/Viewer) | Data | Hardcoded `2/5/5` | Role distribution di-mock. Tidak ada fetch. Di DB, role hanya ada field `role: String` dengan nilai `"user"` atau `"admin"` — tidak ada `"editor"` atau `"viewer"`. Seluruh konsep 3-tier role tidak exist di schema |
| Tombol "Buka" — Undangan Anggota | Action | onClick kosong | Tidak ada modal/form kirim undangan. Tidak ada email service. Tidak ada `Invitation` model di DB |
| Tombol "Buka" — Kelola Role | Action | onClick kosong | Tidak ada modal kelola role. Role management sebenarnya ada di `/admin/users` tapi halaman itu admin-only dan tidak tertaut dari sini |
| `izinExportData` | Toggle | Disimpan, tidak dipakai | Setting disimpan ke DB tapi tidak ada kode yang mengecek nilai ini sebelum mengizinkan export. Tidak ada `aksesStore` Valtio. Export button di halaman lain tidak mengecek pref ini |
| `requireApprovalPerubahan` | Toggle | Disimpan, tidak dipakai | Setting disimpan ke DB tapi tidak ada approval workflow sama sekali. Tidak ada model `ChangeRequest` atau `PendingChange` di schema |
| Halaman akses ke `/pengaturan/akses-dan-tim` | Auth | Semua user bisa akses | Route tidak di-guard admin-only. Semua user yang login bisa membuka halaman ini, padahal ini adalah pengaturan yang seharusnya hanya bisa diubah oleh admin |

---

## Analisa Sistem Role Saat Ini

```
DB User.role = "user" | "admin"   (hanya 2 role)
```

Halaman ini menampilkan 3 tier: **Administrator / Editor / Viewer** — tapi sistem auth hanya punya 2: `user` dan `admin`. Tidak ada role `editor` atau `viewer` di DB. Jika fitur "Kelola Role" diimplementasikan, perlu keputusan:
- Opsi A: Tetap 2 role (admin/user), ubah UI menjadi Admin/User
- Opsi B: Tambah role `editor` dan `viewer` ke schema, ubah enum/validasi

Opsi A lebih cepat dan tidak perlu migrasi besar. Opsi B sesuai UI yang sudah ada tapi butuh refactor auth middleware.

---

## Scope Implementasi (Realistis)

### Priority 1 — Guard halaman admin-only
Halaman `/pengaturan/akses-dan-tim` harus hanya bisa diakses admin. Tambahkan route guard di `authMiddleware.tsx` untuk path `/pengaturan/akses-dan-tim`.

### Priority 2 — Ganti data mock dengan data real
- Fetch jumlah user per role dari endpoint baru `GET /api/admin/user-stats` (atau extend admin stats yang ada)
- Tampilkan distribusi role nyata (admin vs user count)
- Update `totalAnggota` dan `roleData` dari DB

### Priority 3 — Kelola Role (Modal)
Buat `KelolaRoleModal.tsx` — list semua user, tombol ganti role. Pakai endpoint `/api/admin/users` yang sudah ada + `/api/admin/users/update-role`. Hanya admin yang bisa akses (sudah di-guard di endpoint).

### Priority 4 — Undangan Anggota (Invite flow)
Karena tidak ada email service, implement sebagai **link undangan** (generate token, user daftar via link). Tambah model `Invitation` ke Prisma dengan field: `token`, `email`, `role`, `invitedBy`, `expiresAt`, `usedAt`. Endpoint `POST /api/invitation` (generate), `GET /api/invitation/:token` (validate), `POST /api/invitation/:token/accept` (register via invite link).

### Priority 5 — Sync `izinExportData` ke store + enforce di UI
Buat `aksesStore` Valtio. Setelah load/save prefs, sync ke store. Buat hook `useAksesPrefs()` yang bisa dipakai komponen lain untuk mengecek `izinExportData` sebelum menampilkan tombol export.

### Priority 6 — `requireApprovalPerubahan` (Partial enforcement)
Full approval workflow terlalu besar untuk MVP. Implementasi minimal: ketika setting aktif, tampilkan konfirmasi dialog "Perubahan ini memerlukan persetujuan administrator. Lanjutkan?" sebelum aksi destructive (hapus data, perubahan besar). Tidak perlu model baru — cukup dialog konfirmasi yang membaca pref dari store.

---

## Arsitektur Implementasi

```
src/
├── middleware/
│   └── authMiddleware.tsx        # Tambah guard: /pengaturan/akses-dan-tim → admin only
├── store/
│   └── akses.ts                  # Valtio store: izinExportData, requireApprovalPerubahan
├── hooks/
│   └── useAksesPrefs.ts          # Hook baca aksesStore, expose izinExportData etc.
├── api/
│   ├── admin.ts                  # Extend: tambah endpoint user-stats with role breakdown
│   └── invitation.ts             # NEW: generate/validate/accept invite link
├── components/pengaturan/
│   ├── akses-dan-tim.tsx         # Modifikasi: fetch data real, hubungkan onClick
│   └── akses/
│       ├── KelolaRoleModal.tsx   # Modal: list user + ganti role (admin only)
│       └── UndanganModal.tsx     # Modal: generate invite link + copy
prisma/
└── schema.prisma                 # Tambah model Invitation
```

---

## Task Breakdown

1. **Guard halaman admin-only** — Tambah `/pengaturan/akses-dan-tim` ke route rules di authMiddleware, redirect non-admin ke `/`
2. **Endpoint + fetch data user real** — Extend `GET /api/admin/stats` atau buat `GET /api/admin/user-stats` yang return count per role. Ganti hardcoded 12/2/5/5 dengan data dari DB
3. **Modal Kelola Role** — `KelolaRoleModal.tsx`: list semua user, dropdown ganti role, konfirmasi
4. **Buat `aksesStore` + sync prefs** — Valtio store, sync saat load/save, hook `useAksesPrefs`
5. **Modal Undangan (invite link)** — Schema `Invitation`, endpoint generate/validate, modal copy link + QR
6. **Enforce `izinExportData`** — Baca aksesStore di komponen yang punya tombol export, hide/disable jika false

---

## Catatan Penting

### Role "editor" dan "viewer" tidak exist di DB
UI menampilkan 3 tier tapi DB hanya punya `user` dan `admin`. Untuk implementasi Task 2-3:
- Tampilkan **Admin** (role = "admin") dan **Pengguna** (role = "user")
- Ubah warna legend di RingProgress: merah=Admin, biru=User
- Tidak perlu mengubah schema untuk task ini

### Halaman ini seharusnya admin-only
Setting seperti "izinkan export data" dan "require approval" adalah kebijakan organisasi yang hanya admin yang berhak mengubah. Non-admin tidak perlu melihat halaman ini.

### Email invite butuh SMTP
Jika undangan harus dikirim via email, butuh konfigurasi SMTP (same constraint). Sebagai workaround: generate shareable link yang bisa di-copy/share manual. Tidak butuh email service.
