# TASK: Phase 1 - Implementasi Skema Inti & API Endpoints

**ID:** `TASK-DB-001`  
**Konteks:** Database Implementation  
**Status:** ✅ COMPLETED (95% Selesai)  
**Prioritas:** 🔴 KRITIS (Blokade Fitur)  
**Estimasi:** 7 Hari Kerja  

---

## 🎯 OBJEKTIF
Mengganti mock data pada fitur-fitur inti (Kinerja Divisi, Pengaduan, Kependudukan) dengan data riil dari database PostgreSQL melalui Prisma ORM dan menyediakan endpoint API yang type-safe menggunakan ElysiaJS.

---

## 📋 DAFTAR TUGAS (TODO)

### 1. Database Migration (Prisma)
- [x] Implementasikan model `Division`, `Activity`, `Document`, `Discussion`, dan `DivisionMetric` di `schema.prisma`.
- [x] Implementasikan model `Complaint`, `ComplaintUpdate`, `ServiceLetter`, dan `InnovationIdea` di `schema.prisma`.
- [x] Implementasikan model `Resident` dan `Banjar` di `schema.prisma`.
- [x] Implementasikan model `Event` di `schema.prisma`.
- [x] Jalankan `bun x prisma migrate dev --name init_core_features`.
- [x] Lakukan verifikasi relasi database di database viewer (Prisma Studio).

### 2. Seeding Data
- [x] Update `prisma/seed.ts` untuk menyertakan data dummy yang realistis untuk:
  - 6 Banjar (Darmasaba, Manesa, dll)
  - 4 Divisi utama
  - Contoh Pengaduan & Layanan Surat
  - Contoh Event & Aktivitas
- [x] Jalankan `bun run seed` dan pastikan tidak ada error relasi.

### 3. Backend API Development (ElysiaJS)
- [x] Buat route handler di `src/api/` untuk setiap modul:
  - `division.ts`: CRUD Divisi & Aktivitas
  - `complaint.ts`: CRUD Pengaduan & Update Status
  - `resident.ts`: Endpoint untuk statistik demografi & list penduduk per banjar
  - `event.ts`: CRUD Agenda & Kalender
- [x] Integrasikan `apiMiddleware` untuk proteksi rute (Admin/Moderator).
- [x] Pastikan skema input/output didefinisikan menggunakan `t.Object` untuk OpenAPI documentation.

### 4. Contract-First Sync
- [x] Jalankan `bun run gen:api` untuk memperbarui `generated/api.ts`.
- [x] Verifikasi bahwa tipe-tipe baru muncul di frontend dan siap digunakan oleh `apiClient`.

### 5. Frontend Integration (Surgical Update)
- [x] Update `src/hooks/` atau `src/store/` untuk memanggil API riil menggantikan mock data.
- [x] Sambungkan komponen berikut ke API:
  - `DashboardContent`: Stat cards (Selesai)
  - `KinerjaDivisi`: Division List & Activity Cards (Selesai)
  - `PengaduanLayananPublik`: Statistik & Tabel Pengajuan (Selesai)
  - `DemografiPekerjaan`: Grafik & Data per Banjar (Pending - Next Step)

---

## 🛠️ INSTRUKSI TEKNIS

### Penanganan Relasi Prisma
Gunakan transaksi atau `onDelete: Cascade` pada relasi yang bergantung secara total (misal: `Activity` ke `Division`) untuk menjaga integritas data.

### Struktur API Route
Contoh struktur yang diharapkan untuk `src/api/division.ts`:
```typescript
export const divisionRoutes = new Elysia({ prefix: '/division' })
  .get('/', () => db.division.findMany({ include: { activities: true } }))
  .post('/', ({ body }) => db.division.create({ data: body }), {
    body: t.Object({ ... })
  })
```

---

## ✅ DEFINITION OF DONE (DoD)
1. [ ] Skema database berhasil dimigrasi tanpa error.
2. [ ] API Endpoints muncul di `/api/docs` (Swagger).
3. [ ] `bun run test` (API tests) berhasil untuk endpoint baru.
4. [ ] Frontend menampilkan data riil dari database (bukan mock) pada rute yang ditentukan.
5. [ ] Performa query optimal (tidak ada N+1 problem pada relasi Prisma).

---

## 📝 CATATAN
- Fokus pada **READ** operations terlebih dahulu agar dashboard bisa tampil.
- Fitur **WRITE** (Create/Update) bisa diimplementasikan secara bertahap setelah tampilan dashboard stabil.
- Jangan lupa update `GEMINI.md` jika ada perubahan pada alur pengembangan.
