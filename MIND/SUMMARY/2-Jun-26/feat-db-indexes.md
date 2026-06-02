# feat: composite index PostgreSQL untuk query terberat

**Branch:** `feat/db-indexes`  
**Tanggal:** 2026-06-02  
**Migration:** `20260602054039_add_composite_indexes`

---

## Ringkasan

Analisis query terberat dengan EXPLAIN ANALYZE, penambahan composite index di Prisma schema, dan verifikasi improvement di PostgreSQL.

---

## Index yang Ditambahkan

| Model | Index | Field |
|---|---|---|
| `Complaint` | `@@index([status, createdAt])` | Composite — filter status + range createdAt |
| `Complaint` | `@@index([assignedTo])` | Single — lookup complaint per assignee |
| `ActivityLog` | `@@index([userId, createdAt])` | Composite — filter userId + range createdAt |
| `Resident` | `@@index([banjarId])` | Sudah ada — tidak perlu ditambah |

---

## Hasil EXPLAIN ANALYZE

### 1. Complaint — filter `status + createdAt`

**Sebelum** (menggunakan `complaint_status_idx` + filter tambahan):
```
Index Scan using complaint_status_idx on complaint
  Index Cond: (status = 'BARU')
  Filter: (createdAt >= now() - '30 days')
  Rows Removed by Filter: 1
Planning Time: 1.745 ms | Execution Time: 0.462 ms
```

**Sesudah** (composite index — kedua kondisi di Index Cond):
```
Index Scan Backward using complaint_status_createdAt_idx on complaint
  Index Cond: ((status = 'BARU') AND (createdAt >= now() - '30 days'))
Planning Time: 1.871 ms | Execution Time: 0.397 ms
```

**Improvement:** Filter terpisah dieliminasi — kedua kondisi masuk `Index Cond`. Di tabel besar, ini menghemat heap fetch untuk setiap baris yang lolos filter `status` tapi gagal `createdAt`.

---

### 2. ActivityLog — filter `userId + createdAt`

**Sebelum** (Bitmap Heap Scan + Filter terpisah):
```
Bitmap Heap Scan on activity_log
  Recheck Cond: (userId = '...')
  Filter: (createdAt >= now() - '30 days')
  Rows Removed by Filter: 7   ← semua baris dengan userId yang benar tapi createdAt di luar range
→ Bitmap Index Scan on activity_log_userId_idx
Planning Time: 1.364 ms | Execution Time: 0.373 ms
```

**Sesudah** (direct Index Scan Backward — tanpa Bitmap dan tanpa filter heap):
```
Index Scan Backward using activity_log_userId_createdAt_idx on activity_log
  Index Cond: ((userId = '...') AND (createdAt >= now() - '30 days'))
Planning Time: 0.698 ms | Execution Time: 0.210 ms
```

**Improvement:** Eliminasi `Bitmap Heap Scan` + `Recheck Cond`. Query planner berubah dari 2-step (bitmap build + heap scan) menjadi 1-step (direct index scan). Planning time turun dari 1.364ms → 0.698ms.

---

### 3. Resident — filter `banjarId`

**Sebelum & Sesudah:** Index `resident_banjarId_idx` sudah ada sejak awal, digunakan di kedua run:
```
Index Scan using resident_banjarId_idx on resident
  Index Cond: (banjarId = $0)
```
Tidak ada perubahan — sudah optimal.

---

## Catatan Teknis

- **Seq Scan pada data kecil:** PostgreSQL planner memilih Seq Scan saat tabel kecil (7–12 row) karena overhead index lebih besar dari manfaatnya. Ini normal dan benar. Composite index akan diaktifkan otomatis saat tabel tumbuh (biasanya ab > 1000 baris dengan selectivity tinggi).
- **Verifikasi paksa:** `SET enable_seqscan = off` digunakan untuk membuktikan index bekerja tanpa perlu tabel besar.
- **`Complaint [assigneeId]` vs `assignedTo`:** Deskripsi task menyebut `assigneeId` tapi field Prisma bernama `assignedTo`. Index dibuat menggunakan nama field yang benar: `@@index([assignedTo])`.
- **Migration juga mengaplikasikan:** `20260526064127_add_ip_whitelist_entry` dan `20260530020613_add_sync_log` yang sebelumnya belum diaplikasikan.

---

## File yang Diubah

| File | Perubahan |
|---|---|
| `prisma/schema.prisma` | Tambah `@@index` untuk Complaint (×2) dan ActivityLog (×1) |
| `prisma/migrations/20260602054039_add_composite_indexes/migration.sql` | DDL: 3 CREATE INDEX baru |
