# Summary — Admin Sinkronisasi UI & SyncLog Fix
**Tanggal:** 3 Juni 2026  
**Branch:** feat/admin-sinkronisasi-ui-synclog  

---

## Perubahan yang Dilakukan

### 1. `src/routes/admin/preferences.tsx` — Tambah AdminSyncSection

**Tujuan:** Mengintegrasikan UI sinkronisasi data ke halaman admin preferences, menggantikan halaman sinkronisasi terpisah (`sinkronisasi.tsx`) dengan tampilan yang konsisten dengan admin panel (tema orange).

**Yang ditambahkan:**

- **Import baru:** `Loader`, `ScrollArea`, `Table` dari Mantine; `IconAlertCircle`, `IconArrowRight`, `IconCircleCheck`, `IconCloudUpload`, `IconDatabase`, `IconHistory` dari Tabler; `dayjs` + plugin `relativeTime` + `utc`; `useCallback`; `apiClient`; `useSnapshot` dari valtio; `i18nStore`
- **Type baru:** `SyncLogEntry` — shape data dari endpoint `/api/admin/sync/logs`
- **Konstanta:** `ZONA_OFFSET` map timezone ke offset menit (`Asia/Jakarta: 420`, `Asia/Makassar: 480`, `Asia/Jayapura: 540`)
- **Komponen baru:** `AdminSyncSection` — disisipkan di antara `SimpleGrid` pengaturan dan Action Bar

**Fitur `AdminSyncSection`:**
- **Kartu NOC Sync** — tombol sinkronisasi manual, status terakhir sync, badge model data (Divisi/Kegiatan/Diskusi), URL sumber
- **Kartu Website Desa Sync** — tombol sinkronisasi manual, status terakhir sync, badge model data (Demografi/APBDes/Sektor), URL sumber
- **Tabel Riwayat Sinkronisasi** — 30 entri terakhir dengan kolom: Tipe, Status, Dipicu (manual/scheduled), Durasi, Records, Waktu Mulai, Error
- **Filter tipe** — dropdown untuk filter tampilan NOC / Demografi / semua
- **Tombol Refresh** manual untuk reload riwayat
- **Auto-refresh riwayat** setelah sync berhasil (memanggil `fetchSyncLogs(logsType)`)

**Fix timezone timestamp:**
- Menggunakan `dayjs.utc(ts).utcOffset(tzOffset).format()` agar timestamp UTC dari server ditampilkan sesuai zona waktu pengguna (WIB/WITA/WIT) yang tersimpan di `i18nStore`
- Sebelumnya: timestamp UTC ditampilkan langsung (jam 02:00 UTC terlihat sebagai 02:00, bukan 09:00 WIB)

---

### 2. `src/api/noc.ts` — Tulis SyncLog saat Manual Sync

**Masalah sebelumnya:** Handler POST `/noc/sync` hanya menulis ke `activityLog`. Tabel Riwayat Sinkronisasi membaca dari `syncLog`, sehingga manual sync tidak pernah muncul di riwayat — hanya sync otomatis dari scheduler yang tercatat.

**Perubahan:**
- Tambah `syncStart = Date.now()` sebelum try block untuk tracking durasi
- **Path success:** `Promise.all` — menulis `activityLog` dan `syncLog` secara paralel  
  (`type: "noc"`, `status: "success"`, `triggeredBy: "manual"`, `durationMs`)
- **Path error:** Tambah `prisma.syncLog.create()` dengan `status: "error"`, `durationMs`, dan `errorMessage` (max 500 karakter)

---

### 3. `src/api/demografi.ts` — Tulis SyncLog saat Manual Sync

**Masalah sebelumnya:** Sama seperti `noc.ts` — handler POST `/demografi/sync` hanya menulis `activityLog`, tidak menulis ke `syncLog`.

**Perubahan:**
- Tambah `syncStart = Date.now()` sebelum try block
- **Path success/partial:**
  - Status `"partial"` jika ada endpoint yang gagal (`errors.length > 0`), `errorMessage: "Gagal: [endpoint list]"`
  - Status `"success"` jika semua 10 endpoint berhasil
  - Jika ada `user.id`: `Promise.all([activityLog.create(), syncLog.create()])`
  - Jika tidak ada user (anon trigger): hanya `syncLog.create()`
- **Path error:** Tambah `prisma.syncLog.create()` dengan `status: "error"` dan pesan error dari exception

---

## Ringkasan Dampak

| File | Jenis Perubahan | Dampak |
|---|---|---|
| `preferences.tsx` | Feature | UI sinkronisasi tampil di halaman admin preferences |
| `preferences.tsx` | Bugfix | Timestamp ditampilkan sesuai timezone pengguna |
| `noc.ts` | Bugfix | Manual sync NOC kini tercatat di riwayat sinkronisasi |
| `demografi.ts` | Bugfix | Manual sync Demografi kini tercatat di riwayat sinkronisasi |

## Catatan Teknis

- Scheduler otomatis di `src/jobs/sync.ts` sudah menulis ke `syncLog` dengan `triggeredBy: "scheduled"` sejak awal — tidak perlu diubah
- NOC auto-sync: setiap hari 02:00 UTC (09:00 WIB)  
- Demografi auto-sync: setiap Minggu 03:00 UTC (10:00 WIB)
- `generated/api.ts` dan `generated/schema.json` diupdate otomatis (tidak diubah manual)
