# FAQ Management System — Summary

**Tanggal:** 2026-06-02  
**Branch:** feat/faq-management  
**Status:** Selesai

---

## Apa yang Diimplementasikan

### 1. Model Prisma `Faq` + Migration

File: `prisma/schema.prisma`  
Migration: `20260602073135_add_faq_model`

```prisma
model Faq {
  id          String   @id @default(cuid())
  question    String
  answer      String
  category    String   @default("Umum")
  order       Int      @default(0)
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([isPublished, order])
  @@map("faq")
}
```

---

### 2. API Endpoints

#### Public: `GET /api/bantuan/faq` (`src/api/bantuan.ts`)
- Tanpa auth — diakses langsung dari halaman /bantuan
- Returns FAQ dengan `isPublished: true`, sorted by `category ASC, order ASC`
- Response: `{ data: FaqItem[] }`

#### Admin CRUD: `/api/admin/faq/*` (`src/api/admin-faq.ts`)
| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/admin/faq` | List semua FAQ (termasuk draft) |
| POST | `/api/admin/faq` | Buat FAQ baru (order auto dari max+1 per category) |
| PUT | `/api/admin/faq/:id` | Update question, answer, category, isPublished |
| PATCH | `/api/admin/faq/:id/toggle` | Toggle isPublished |
| DELETE | `/api/admin/faq/:id` | Hapus FAQ |
| PUT | `/api/admin/faq/reorder` | Simpan urutan baru (transaction update semua order) |

Semua admin endpoint: guard `user.role !== "admin"` → 401.

---

### 3. Halaman `/bantuan` — FAQ dari API (`src/components/help-page.tsx`)

- Hapus hardcoded `faqItems` (4 item statis dari translation keys)
- Fetch dari `GET /api/bantuan/faq` saat component mount
- Tampilkan loading spinner saat fetch
- Tampilkan empty state jika belum ada FAQ
- **Grouping per category:**
  - 1 kategori → Accordion langsung tanpa header kategori
  - Banyak kategori → label kategori + Accordion per grup

---

### 4. Halaman `/admin/settings` — CRUD FAQ (`src/routes/admin/settings.tsx`)

Komponen `FaqSection` ditambahkan di bawah sistem info cards, berisi:

- **Tabel FAQ** dengan kolom: drag handle, pertanyaan, kategori, status, aksi
- **Drag-and-drop reorder** menggunakan `@dnd-kit/core` + `@dnd-kit/sortable`:
  - `DndContext` + `SortableContext` (verticalListSortingStrategy)
  - `useSortable` pada setiap row
  - `arrayMove` untuk update state, lalu save ke `PUT /api/admin/faq/reorder`
- **Add/Edit Modal** dengan `@mantine/form`:
  - Fields: Kategori, Pertanyaan, Jawaban, toggle Publish
  - Validasi client-side (field wajib diisi)
- **Toggle publish/unpublish** per row (tombol eye icon)
- **Hapus** dengan konfirmasi `confirm()`

---

### 5. Dependencies Baru

- `@dnd-kit/core@6.3.1`
- `@dnd-kit/sortable@10.0.0`
- `@dnd-kit/utilities@3.2.2`

---

## File yang Diubah/Dibuat

| File | Perubahan |
|---|---|
| `prisma/schema.prisma` | Tambah model `Faq` |
| `prisma/migrations/20260602073135_add_faq_model/` | **Baru** — migration SQL |
| `src/api/bantuan.ts` | **Baru** — public FAQ endpoint |
| `src/api/admin-faq.ts` | **Baru** — admin FAQ CRUD |
| `src/api/index.tsx` | Mount `bantuanApi` dan `adminFaqApi` |
| `src/components/help-page.tsx` | Ganti hardcoded FAQ dengan fetch dari API |
| `src/routes/admin/settings.tsx` | Tambah `FaqSection` dengan CRUD + dnd-kit |

---

## Keputusan Desain

- **Order auto-assign** saat create: ambil max(order) per category + 1, agar FAQ baru selalu di akhir kategorinya.
- **Reorder simpan setelah drop**: state di-update optimistically, lalu `PUT /api/admin/faq/reorder` dipanggil. Jika gagal, refetch data untuk rollback.
- **Public endpoint tanpa auth**: `/api/bantuan/faq` tidak pakai `apiMiddleware` karena perlu diakses dari halaman publik.
- **Grouping by category di frontend**: server return flat array, frontend grouping — lebih fleksibel untuk filter/search di masa depan.
