# Summary — Grup "Beranda" di Picker Widget Wall (7 Widget LIVE)

> Tanggal: 21 Jul 2026 · Branch: `feature/wall-noc-shortcut`

---

## Konteks

Halaman Wall NOC (`/wall`) sudah punya sistem widget dinamis — operator bisa tambah/atur widget via modal "Tambah Widget". Tapi selama ini tidak ada widget yang menampilkan data dari halaman **Beranda** (halaman utama dashboard). Permintaan: tambah grup "Beranda" berisi 7 widget live di picker Wall agar operator NOC bisa merakit ulang tampilan Beranda di video wall.

---

## Apa yang Berubah

### Grup Beranda — 7 Widget Baru

| Widget ID | Menampilkan | Sumber Data |
|---|---|---|
| `beranda-kpi` | 4 tile statistik harian (surat, pengaduan, layanan, penduduk) | Prisma DB |
| `beranda-surat-trend` | Grafik batang tren surat 7 bulan | Prisma `service_letter` |
| `beranda-kepuasan` | Donut tingkat kepuasan warga | NOC API responden (live) |
| `beranda-divisi` | Daftar divisi teraktif + bar kegiatan | NOC API `active-divisions` |
| `beranda-kalender` | Daftar kegiatan mendatang | NOC API `upcoming-events` |
| `beranda-apbdes` | Realisasi APBDes per kategori | Desa API |
| `beranda-sdgs` | Skor SDGs | Desa API |

Widget lama (`keuangan-*`, `pengaduan-*`, dll.) **tidak diubah** — grup Beranda adalah lapisan baru terpisah.

### Perbaikan Sekaligus (Fix Laten)

- **Cache conflict kepuasan**: `dashboard.ts` dan `external-satisfaction.ts` sebelumnya menulis format berbeda ke cache key yang sama (`dashboard:satisfaction:responden`). Diperbaiki dengan memisahkan key wall menjadi `wall:satisfaction:responden`.
- **`buildSatisfaction()` di-wire**: Fungsi ini sebelumnya sudah ada tapi tidak pernah dipanggil (dead code). Sekarang dipakai oleh `build-beranda.ts`.

---

## File yang Dibuat / Diubah

| File | Aksi | Keterangan |
|---|---|---|
| `src/api/transforms/noc-divisions.ts` | BARU | Transform murni: `DIVISION_COLOR_MAP` + `mapActiveDivisions()` |
| `src/api/transforms/noc-events.ts` | BARU | Transform murni: `mapUpcomingEvents()` |
| `src/api/wall-snapshot/build-beranda.ts` | BARU | Builder 7 slice paralel — gagal satu tidak merusak yang lain |
| `src/components/wall/widgets/beranda.tsx` | BARU | 7 komponen tampilan (KPI tile, BarChart, Donut, StatRow, event list) |
| `src/types/wall.ts` | EDIT | Tambah `WallBeranda`, `WallBerandaKpiTile`; update `WallSnapshot` + komentar PII |
| `src/api/wall-snapshot/external-satisfaction.ts` | EDIT | Ganti cache key ke `wall:satisfaction:responden`; hapus TODO dead code |
| `src/api/wall-snapshot/index.ts` | EDIT | Wire `buildBeranda` ke `Promise.all` + return snapshot |
| `src/api/noc.ts` | EDIT | Import `mapActiveDivisions` + `mapUpcomingEvents` dari transforms; hapus inline duplikat |
| `src/components/wall/wall-layout-utils.ts` | EDIT | Tambah 7 ID, `DEFAULT_WIDGET_SIZE`, kategori `"beranda"` |
| `src/components/wall/widget-registry.tsx` | EDIT | Daftarkan 7 definisi widget Beranda |
| `src/components/wall/widget-gallery.tsx` | EDIT | Tambah label `"Beranda"` di picker modal |
| `__tests__/api/wall-snapshot.test.ts` | EDIT | Tambah `beranda` ke `ALLOWED_KEYS` + test nested PII guard divisi/kalender |

---

## Keputusan Penting

- **Cakupan penuh**: Semua 7 widget diimplementasi sekaligus (bukan bertahap).
- **Sumber data LIVE**: Tidak ada mock — data sama persis dengan yang tampil di Beranda dashboard.
- **Isolasi kegagalan**: Setiap fetch dibungkus `settle()` — jika NOC API mati, hanya widget terkait yang kosong, sisanya tetap render.
- **Teks operasional publik diizinkan di Wall**: `divisi[].name`, `kalender[].title`, `kalender[].location` disertakan karena setara data yang sudah tampil di website desa — bukan PII-orang. Dicatat eksplisit di komentar `types/wall.ts` dan dijaga oleh test nested PII.
- **DEFAULT_LAYOUT tidak disentuh**: 7 widget baru hanya muncul di picker (opt-in), tidak otomatis muncul di layout default Wall.
- **`BerandaSdgsBody` reuse `KeuanganSdgsBody`**: Shape data identik (`{title, score, image}[]`) sehingga tidak perlu tulis ulang komponen.

---

## Perencanaan Task

Task-task hari ini dicatat di `MIND/PLAN/21-Jul/task-hari-ini.csv` (16 task total, termasuk Wall NOC shortcut, SDG card responsive, dan semua task grup Beranda). Deskripsi ditulis dalam bahasa sederhana agar bisa dibaca oleh anggota tim non-teknis.

---

## Hasil Test

- 14 test `wall-registry` + `wall-snapshot` ✅ lulus semua
- 140 unit test keseluruhan ✅ lulus (9 error Playwright e2e pre-existing, bukan dari perubahan ini)
- 0 TypeScript error pada file yang diubah
