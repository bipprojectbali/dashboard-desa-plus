# Plan Perbaikan — 11 Task Valid dari QC (PM Dashboard)

> Lanjutan dari `PM-TASKS-QC-2026-09-24.md`. Task #12 (SDG's image tidak muncul) dikeluarkan dari plan ini — perlu reproduksi manual di Safari dulu sebelum bisa didiagnosis lebih lanjut.

## Prinsip umum

Codebase sudah punya **pola referensi yang benar** untuk 2 dari 3 masalah utama, tinggal direplikasi ke halaman lain:

1. **Data label pada chart** — semua chart di halaman utama (`recharts` mentah via `<BarChart>`/`<LineChart>`/`<PieChart>` dari `recharts`) tidak pakai `<LabelList>`. Solusi: tambahkan `<LabelList dataKey="..." position="..." />` sebagai child `<Bar>`/`<Line>`, konsisten dengan style project.
2. **Label sumbu-Y terpotong** — widget wall (`src/components/wall/horizontal-bar.tsx`) sudah punya pola `Y_AXIS_WIDTH` + `truncateTick` ellipsis. Halaman utama pakai `recharts` mentah (bukan `@mantine/charts`), jadi perlu port pola yang sama ke `YAxis` prop `tick={{ ... }}` + custom tick formatter atau `width` yang lebih besar.
3. **Progress bar tanpa angka** — beberapa sudah ada (Jenna jam sibuk, ProgressChart legend), beberapa belum (ActivityCard, DivisionProgress dashboard). Tambahkan `<Text>` angka di sisi kanan/atas progress bar, pola yang sudah dipakai di `jenna-analytic.tsx:342-349`.

Tidak ada perubahan skema data/API — semua murni presentational (komponen React + props chart), risiko rendah.

---

## Grup A — Data Label pada Chart (Task #3, #5, #6, #7, #9, #10)

### A1. `src/components/demografi-pekerjaan.tsx` (Task #3)
- **Pengelompokan Umur** (BarChart, baris ~583): tambah
  ```tsx
  import { LabelList } from "recharts";
  <Bar dataKey="total" fill="#396aaaff" radius={[8, 8, 0, 0]} maxBarSize={40}>
    <LabelList dataKey="total" position="top" style={{ fill: dark ? "#E2E8F0" : "#374151", fontSize: 11 }} />
  </Bar>
  ```
- **Demografi Pekerjaan** (horizontal BarChart, baris ~665): `<LabelList dataKey="total" position="right" />` di dalam `<Bar>`.
- **Sektor Unggulan** (horizontal BarChart, baris ~1117): sama pola, `<LabelList dataKey="value" position="right" />`.

### A2. `src/components/jenna-analytic.tsx` (Task #5)
- Chart "Interaksi Chatbot" (baris ~267): `<LabelList dataKey="total" position="top" />` di dalam `<Bar>`.

### A3. `src/components/pengaduan-layanan-publik.tsx` (Task #6 + #7 — GABUNG, jangan kerjakan 2x)
- "Tren Pengaduan" (LineChart, baris ~317): tambah `<LabelList dataKey="jumlah" position="top" />` di dalam `<Line>`.
- "Surat Terbanyak" (horizontal BarChart, baris ~397): `<LabelList dataKey="jumlah" position="right" />` di dalam `<Bar>`.
- Setelah dikerjakan, **tutup salah satu task (#6 atau #7) sebagai duplikat** di PM dashboard dengan comment referensi ke task yang tetap dikerjakan.

### A4. `src/components/kinerja-divisi/document-chart.tsx` (bagian dari Task #9)
- Bar chart jumlah dokumen (baris ~91): `<LabelList dataKey="value" position="top" />`.
- Donut `ProgressChart` (`progress-chart.tsx`) — legend sudah punya angka; kalau mau label langsung di slice pie, tambahkan `<Pie label={(entry) => `${entry.value.toFixed(0)}%`} labelLine={false}>` — opsional, less critical karena legend sudah cukup informatif.

### A5. `src/components/dashboard/chart-surat.tsx` & `satisfaction-chart.tsx` (Task #10)
- `ChartSurat` bar (baris ~133): `<LabelList dataKey="value" position="top" />`.
- `SatisfactionChart` donut (baris ~100-118): tambah angka ke **legend** dulu (quick win, ubah baris 139 dari cuma nama jadi `{name} ({value})`), lalu opsional tambahkan `label` prop di `<Pie>` untuk angka langsung di slice.

**Estimasi:** ~1-2 jam total, semua perubahan kecil & terisolasi per file, tidak menyentuh data-fetching.

---

## Grup B — Label Sumbu Terpotong (Task #2, #4)

### B1. `src/components/keuangan/allocation-chart.tsx` (Task #2)
- Saat ini truncate manual di `chartData` (baris 46, potong ke 17 char) + `YAxis width={120}`.
- **Perbaikan:** naikkan `width` ke `140-160` (beri ruang lebih), DAN pastikan truncation tetap konsisten via `tickFormatter` di `YAxis` (bukan modifikasi data mentah) supaya tooltip tetap menampilkan nama lengkap:
  ```tsx
  const chartData = allocation.map((a) => ({ sector: a.sector, amount: a.amount / 1_000_000 }));
  // ...
  <YAxis
    type="category" dataKey="sector" width={140}
    tickFormatter={(v: string) => v.length > 18 ? `${v.slice(0,17)}…` : v}
    tick={{ fill: axisTick, fontSize: 11 }}
  />
  <Tooltip formatter={...} labelFormatter={(label) => allocation.find(a=>a.sector===label)?.sector ?? label} />
  ```
  Ini juga sekaligus menambahkan data label (lihat Grup A) di `<Bar>` yang sama.
- Sambil di sini, tambahkan `<LabelList dataKey="amount" position="right" formatter={(v)=>`Rp ${v}jt`} />` untuk memenuhi permintaan data label yang juga disebut di task ini.

### B2. `src/components/demografi-pekerjaan.tsx` — chart "Demografi Pekerjaan" (Task #4)
- **Root cause dikonfirmasi:** `YAxis dataKey="job" width={90}` tanpa truncate (baris ~682-692), beda dengan `allocation-chart.tsx` yang setidaknya sudah truncate manual.
- **Perbaikan:**
  ```tsx
  <YAxis
    type="category" dataKey="job"
    width={110}
    tickFormatter={(v: string) => v.length > 14 ? `${v.slice(0,13)}…` : v}
    tick={{ fill: dark ? "#E2E8F0" : "#374151", fontSize: 12 }}
  />
  ```
  Naikkan `width` dari 90 → 110, tambah `tickFormatter` truncate. Ini fix untuk SEMUA browser (bukan cuma Safari), karena root cause adalah lebar area label yang terlalu sempit relatif ke panjang teks, bukan browser-specific CSS quirk.
- Terapkan pola sama ke chart **Sektor Unggulan** yang bersebelahan (baris ~1097-1107, `width={120}`) sebagai pencegahan preventif meski belum dilaporkan bug — sudah pakai width lebih besar (120) jadi risiko lebih rendah, tapi tetap tambahkan `tickFormatter` untuk konsistensi.

**Estimasi:** ~30-45 menit.

---

## Grup C — Padding/Whitespace Layout (Task #6-padding, #8)

### C1. `src/components/pengaduan-layanan-publik.tsx` — "Surat Terbanyak" & "Pengajuan Terbaru" (Task #6)
- Card "Surat Terbanyak" & "Pengajuan Terbaru" ada di grid 3-kolom sejajar dengan "Musrenbang" (baris 340-533), masing-masing `h="100%"`.
- **Perbaikan:** samakan strategi tinggi konten — gunakan `Stack justify="center"` atau `mih` (min-height) pada `Stack` isi list supaya representasi visual proporsional saat item < 5, alih-alih dibiarkan nempel atas dengan whitespace di bawah. Contoh untuk "Pengajuan Terbaru" (baris 429):
  ```tsx
  <Stack gap="sm" justify={pengajuanTerbaru.length < 3 ? "center" : "flex-start"} mih={280}>
  ```
- **Perlu screenshot pembanding dulu** (evidence PM dashboard tidak bisa diakses via API token — minta reporter share ulang via chat/attach langsung) untuk memastikan target padding yang tepat, supaya tidak over-engineer.

### C2. `src/components/kinerja-divisi/division-list.tsx` + `document-chart.tsx` (Task #8)
- `DivisionList`: `Stack gap="xs"` isi list max 5 item, `Card h="100%"` disejajarkan dengan `DocumentChart` (chart tinggi fixed 200px) dan `ProgressChart` (200px + legend) dalam grid `span 3/5/4` (`kinerja-divisi.tsx:139-154`).
- **Perbaikan:**
  - `DivisionList`: ubah `Stack` jadi `justify="space-between"` atau tambah `mih` supaya list 5 item mengisi tinggi card secara proporsional, bukan menumpuk di atas.
  - `DocumentChart`: naikkan `ResponsiveContainer height` dari `200` → responsif mengikuti card (misal pakai `height="100%"` pada container `Box` pembungkus dengan `Card` yang punya `mih={320}` eksplisit), supaya chart tidak menyisakan gap tetap di bawahnya saat card lain (List/Progress) lebih tinggi.
  - Alternatif lebih simpel: set `mih` yang SAMA secara eksplisit di ketiga `Card` (List/Document/Progress) — misal `mih={360}` — supaya grid selalu align rapi tanpa bergantung pada auto-height masing-masing.

**Estimasi:** ~1 jam (termasuk uji visual breakpoint tablet/mobile).

---

## Grup D — Progress Bar Tanpa Angka (bagian dari Task #9)

### D1. `src/components/kinerja-divisi/activity-card.tsx`
- `<Progress value={progress} .../>` (baris 68-78) tidak menampilkan angka `progress`% di mana pun pada card.
- **Perbaikan:** tambah `<Text size="xs" c="dimmed">{progress}%</Text>` di atas/samping progress bar, pola sama seperti `jenna-analytic.tsx` jam sibuk:
  ```tsx
  <Group justify="space-between" mb={4}>
    <Text size="xs" c="dimmed">Progress</Text>
    <Text size="xs" fw={600}>{progress}%</Text>
  </Group>
  <Progress value={progress} radius="xl" size="lg" color="orange" .../>
  ```

**Estimasi:** ~15 menit.

---

## Grup E — Bug Warna (Task #11)

### E1. `src/components/dashboard/chart-apbdes.tsx` — `ApbdesSummary`
- **Bug dikonfirmasi:** baris ~157-159, background badge status **hardcode hijau** di dark mode terlepas dari `statusMessage.color`:
  ```tsx
  backgroundColor: dark
    ? "rgba(72, 187, 120, 0.1)"          // ← selalu hijau, salah untuk status merah/kuning
    : `var(--mantine-color-${statusMessage.color}-0)`,
  ```
- **Perbaikan:** map warna dinamis untuk dark mode juga, konsisten dengan `statusMessage.color`:
  ```tsx
  const DARK_BG_MAP: Record<string, string> = {
    teal: "rgba(45, 212, 191, 0.12)",
    blue: "rgba(59, 130, 246, 0.12)",
    yellow: "rgba(234, 179, 8, 0.12)",
    red: "rgba(239, 68, 68, 0.12)",
  };
  // ...
  backgroundColor: dark
    ? (DARK_BG_MAP[statusMessage.color] ?? DARK_BG_MAP.red)
    : `var(--mantine-color-${statusMessage.color}-0)`,
  ```
- **Tambahan sesuai request task:** tambahkan icon alert (`IconAlertTriangle` dari `@tabler/icons-react`, sudah dipakai di file lain project) di depan teks status ketika `statusMessage.color === "red"`:
  ```tsx
  {statusMessage.color === "red" && <IconAlertTriangle size={14} />}
  {statusMessage.text}
  ```
- Sekaligus sederhanakan card wrapper agar tidak pakai warna latar solid mencolok — cukup border-left tipis + icon, sesuai "hindari warna yang kurang sesuai" di deskripsi task.

**Estimasi:** ~30 menit. **Ini task dengan urgensi tertinggi** karena murni bug (bukan enhancement) dan root cause-nya sudah 100% jelas dari kode.

---

## Task #1 — Hapus kolom Aksi/Detail Bumdes (keputusan produk, bukan bug)

- `src/components/umkm/sales-table.tsx`: hapus `<Table.Th>` kolom Aksi (baris 164-168) + `<Table.Td>` tombol Detail (baris 222-232), hapus prop `onDetailClick`.
- `src/components/bumdes-page.tsx`: hapus state `selectedProduct`/`detailModalOpen`, `handleDetailClick`, dan render `<SalesDetailModal>` (baris 130-133, 194-197, 201-205).
- **Rekomendasi sebelum eksekusi:** konfirmasi ke reporter — modal detail (`sales-detail-modal.tsx`) berisi info stok/ring-progress/comparison bar yang cukup berguna; kalau dihapus totalan, pastikan tidak ada kebutuhan drill-down di tempat lain. Kalau reporter tetap ingin dihapus, hapus juga file `sales-detail-modal.tsx` sekalian (dead code) — cek dulu tidak dipakai di tempat lain (`grep -r "SalesDetailModal"` hanya muncul di `bumdes-page.tsx` saat ini).

**Estimasi:** ~15 menit.

---

## Ringkasan Prioritas & Estimasi

| Prioritas | Grup | Task # | Estimasi |
|---|---|---|---|
| 🔴 Tinggi (bug nyata) | E | #11 | 30 min |
| 🔴 Tinggi (bug nyata, semua browser) | B2 | #4 | 20 min |
| 🟡 Sedang | B1 | #2 | 25 min |
| 🟡 Sedang | A (semua) | #3,#5,#6,#7,#9,#10 | ~1.5-2 jam |
| 🟡 Sedang | D | #9 (progress) | 15 min |
| 🟢 Rendah (perlu screenshot dulu) | C | #6,#8 | 1 jam |
| 🟢 Rendah (keputusan produk) | — | #1 | 15 min |
| ❓ Ditunda (butuh repro Safari) | — | #12 | — |

**Total estimasi kerja:** ~4-5 jam untuk 11 task (di luar task #12 yang butuh verifikasi manual).

## Langkah Selanjutnya yang Disarankan
1. Konfirmasi ke reporter (Inno Insani) soal task #1 (hapus modal detail — sayang kalau dibuang) dan duplikasi #6/#7.
2. Kerjakan Grup E (#11) dan B2 (#4) dulu — bug paling konkret, dampak jelas, effort kecil.
3. Kerjakan Grup A & B1 sekaligus (LabelList + YAxis fix sering di file yang sama).
4. Grup C ditunda sampai ada screenshot pembanding via channel lain (evidence image di PM dashboard tidak bisa diakses via API token — beda auth scheme).
5. Task #12 (SDG's image) — buka Safari asli, cek Network tab & console error dulu sebelum coding fix.
