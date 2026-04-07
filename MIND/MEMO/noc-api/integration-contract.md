# Memo: Integrasi & Sinkronisasi NOC API (Network Operation Center)

**Status**: Finalized (Sync Strategy Approved)
**Tanggal**: 30 Maret 2026
**Kategori**: Integrasi API & Database Mirroring
**Topik**: Arsitektur Sinkronisasi Kontrak API NOC (darmasaba.muku.id)

## 1. Ringkasan Strategi

Berdasarkan hasil diskusi, sistem **TIDAK** mengambil data langsung dari API eksternal untuk ditampilkan ke user. Sebagai gantinya, sistem akan menggunakan pola **Data Mirroring (Sync & Store)**:

1.  **Ingest**: Skrip sinkronisasi mengunduh data dari `https://darmasaba.muku.id/api/noc/`.
2.  **Persist**: Data disimpan ke database lokal melalui Prisma ORM.
3.  **Serve**: Frontend menampilkan data dari database lokal melalui API internal (`/api/noc/*`).

**Keuntungan**: Kecepatan akses (performa), data tetap tersedia meski server NOC down, dan kemampuan analisis historis.

## 2. Pemetaan API ke Komponen UI (Kinerja Divisi)

| Endpoint NOC               | Method | Komponen UI       | Lokasi Komponen                                      | Model Prisma           |
| :------------------------- | :----- | :---------------- | :--------------------------------------------------- | :--------------------- |
| `active-divisions`         | `GET`  | `DivisionList`    | `src/components/kinerja-divisi/division-list.tsx`    | `Division`, `Activity` |
| `latest-projects`          | `GET`  | `ActivityCard`    | `src/components/kinerja-divisi/activity-card.tsx`    | `Activity`             |
| `upcoming-events`          | `GET`  | `EventCard`       | `src/components/kinerja-divisi/event-card.tsx`       | `Event`                |
| `diagram-jumlah-document`  | `GET`  | `DocumentChart`   | `src/components/kinerja-divisi/document-chart.tsx`   | `Document`             |
| `diagram-progres-kegiatan` | `GET`  | `ProgressChart`   | `src/components/kinerja-divisi/progress-chart.tsx`   | `Activity`             |
| `latest-discussion`        | `GET`  | `DiscussionPanel` | `src/components/kinerja-divisi/discussion-panel.tsx` | `Discussion`           |

## 3. Alur Data (Data Flow)

```text
[ NOC API ] --(openapi-fetch)--> [ Sync Script ] --(prisma upsert)--> [ Local DB ]
                                                                          |
[ UI Components ] <--(apiClient)-- [ Elysia (src/api/noc.ts) ] <----------/
```

## 4. Rencana Implementasi Sinkronisasi

1.  **Sync Script**: Membuat `scripts/sync-noc.ts` untuk melakukan penarikan data secara berkala.
2.  **Upsert Logic**: Menggunakan `prisma.model.upsert` untuk mencegah duplikasi data (berdasarkan `id` atau field unik lainnya dari sistem NOC).
3.  **Automation**: Integrasi dengan `cron` atau sistem antrian untuk update otomatis setiap 15-30 menit.
4.  **Field Mapping**: Memastikan field dari API eksternal (misal: `idDesa`) dipetakan ke record yang benar di database lokal.

---

_Memo ini diperbarui berdasarkan analisa kecocokan fitur dan keputusan untuk menggunakan strategi sinkronisasi data lokal._
