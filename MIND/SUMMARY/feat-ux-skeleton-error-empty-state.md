# feat: UX — Skeleton, Error+Retry, Empty State (5 Halaman)

## Tanggal
2026-05-25

## Halaman yang Diubah
- `/kinerja-divisi`
- `/pengaduan-layanan-publik`
- `/demografi-pekerjaan`
- `/keuangan-anggaran`
- `/sosial`

---

## Masalah Sebelumnya

| Halaman | Skeleton | Error + Retry | Empty State |
|---|---|---|---|
| `/kinerja-divisi` | Partial (section 1 & 4 saja) | Ada tapi tidak semua seksi | Partial (activities saja) |
| `/pengaduan-layanan-publik` | Partial (hanya nilai angka di stat card, bukan card penuh) | Ada, tapi `setLoading(true)` hilang di retry | Partial (3 dari 4 seksi) |
| `/demografi-pekerjaan` | Bug: `Loader` tidak diimport, kondisi loading di dalam `ResponsiveContainer` | Ada | Tidak sama sekali |
| `/keuangan-anggaran` | Full-page spinner saja, tidak per-seksi | Tidak ada — error hanya di-`console.error` | Partial (dana bantuan saja) |
| `/sosial` | Partial (PosyanduSchedule, Pendidikan, Beasiswa tidak punya skeleton) | Ada | Didelegasi ke children |

---

## Perubahan per File

### `kinerja-divisi.tsx`
- Tambah skeleton `height={400}` untuk 3 kolom Section 2 (DivisionList, DocumentChart, ProgressChart)
- Tambah skeleton `height={200}` untuk Section 3 (DiscussionPanel)

### `pengaduan-layanan-publik.tsx`
- Tambah `setLoading(true)` di awal `fetchData` — sebelumnya retry tidak menampilkan loading state
- Ganti inline skeleton pada nilai stat card menjadi full card skeleton (pola `loading ? <Skeleton> : <Grid>`)

### `demografi-pekerjaan.tsx`
- Hapus penggunaan `Loader` (tidak pernah diimport, menyebabkan `ReferenceError` di runtime)
- Pindahkan semua kondisi `loading` keluar dari `ResponsiveContainer` — recharts tidak dirancang untuk menerima non-chart children
- Tambah empty state untuk semua 6 seksi chart: kelompok umur, pekerjaan, dinamika penduduk, distribusi agama, data per banjar, sektor unggulan
- Pola yang digunakan: `loading ? <Skeleton> : data.length === 0 ? <EmptyText> : <ResponsiveContainer>`

### `keuangan-anggaran.tsx`
- Tambah state `error` dan `setError`
- Tambah `setError(null)` di awal `fetchData`, dan `setError(...)` di `catch`
- Tambah error `Alert` dengan retry button di atas halaman
- Hapus early return `if (loading) return <Loader>` — ganti dengan per-seksi skeleton
- Tambah skeleton untuk: KPI cards (4 skeleton), line chart, bar chart alokasi, laporan APBDes, dana bantuan
- Tambah empty state untuk: KPI cards, line chart (cek apakah semua nilai 0), bar chart, laporan APBDes

### `sosial-page.tsx`
- Tambah skeleton wrapper `loading ? <Skeleton height={200}> : <Component>` untuk:
  - `PosyanduSchedule`
  - `Pendidikan`
  - `Beasiswa`

---

## Keputusan Teknis

**Mengapa skeleton di luar `ResponsiveContainer`?**
`ResponsiveContainer` dari recharts mengharapkan satu child berupa komponen chart. Memasukkan elemen non-chart (Group, Loader) di dalamnya menyebabkan perilaku tidak terdefinisi. Solusinya: evaluasi kondisi loading/empty sebelum merender `ResponsiveContainer`.

**Mengapa full card skeleton, bukan inline skeleton pada nilai?**
Konsistensi dengan pola di `kinerja-divisi`. Inline skeleton merender struktur card tapi dengan nilai kosong — ini terasa "setengah jadi" dan berpotensi layout shift saat data masuk.

**Mengapa `setLoading(true)` penting untuk retry?**
Tanpa `setLoading(true)` di awal `fetchData`, tombol "Coba lagi" memanggil fetch tanpa menampilkan loading state. User tidak tahu apakah permintaan sedang berjalan.
