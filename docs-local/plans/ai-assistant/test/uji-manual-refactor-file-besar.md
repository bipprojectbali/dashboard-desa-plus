# Uji manual — Refactor file besar (tampilan harus sama persis)

> Branch `refactor/split-oversized-files` (`2f2979b`, `864c650`, `411cb7d`, `df608da`, `46ffa9c`, sesi `ui_tampilan`).
> Murni refactor: `help-page.tsx` 1013→124, `admin/help.tsx` 659→123, `health-records.tsx` 632→131, `fetch-demografi.ts` 194→87
> (tanpa `any`/`console`). Bandingkan dengan sebelum (mode terang & gelap). Isi **Hasil** dengan ✅ / ❌.

| # | Halaman | Yang dicek | Hasil |
|---|---|---|---|
| 1 | `/bantuan` | Statistik, daftar panduan, video, dokumen, modal detail, FAQ per kategori, form tiket (kirim sukses & gagal), panel asisten tertanam | |
| 2 | `/admin/help` | Statistik, daftar, modal, FAQ, kartu dukungan, panel asisten di kolom kanan | |
| 3 | `/sosial` tab riwayat kesehatan | Tab ibu hamil, balita, penderita; filter banjar (halaman kembali ke 1); paginasi; empty state; dark mode | |
| 4 | `/sosial` + asisten | *"tampilkan riwayat balita"* → tab Balita ditekan (penanda AI tetap utuh) | |
| 5 | `/demografi-pekerjaan` | KPI, umur, pekerjaan, dinamika, agama, banjar, sektor | |
| 6 | `/bantuan` saat API FAQ gagal (matikan jaringan) | Catatan: FAQ tampil **kosong tanpa pesan error** (perilaku lama dipertahankan) | |

## Catatan hasil uji

| Tanggal | Penguji | Langkah ❌ | Catatan / screenshot |
|---|---|---|---|
| | | | |
