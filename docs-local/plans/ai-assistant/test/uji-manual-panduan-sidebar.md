# Uji manual — Pembatalan penunjuk, sidebar rel ikon, panduan bertahap

> Rancangan: `discus/fitur-2-panduan-bertahap.md` (#43, #44). Berlaku setelah branch berikut di-merge ke `join`:
> `fix/pointer-cancel` (`7e0d1b6`), `feat/sidebar-rail` (`108cce1`), `feat/assistant-guide` (`0088d5f`…`7af40b8`).
> Ada migration baru (`20261002060000_add_assistant_guide_auto_advance`): jalankan `bun x prisma migrate deploy` (atau `bun start`)
> lalu restart `bun run dev`. Isi **Hasil** dengan ✅ / ❌.

## A. Pembatalan penunjuk

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| A1 | *"tunjukkan laporan APBDes"* lalu **gulir mouse** saat kursor masih meluncur | Kursor & sorotan berhenti; halaman tidak ditarik kembali; tanpa pesan gagal | |
| A2 | Sama, tapi tekan **Esc** | Penunjuk berhenti | |
| A3 | Sama, tapi tekan **PageDown / Spasi / panah** | Penunjuk berhenti | |
| A4 | Dari Beranda minta tunjuk kartu Keuangan, lalu segera klik menu **Sosial** sendiri | Tidak ditarik balik ke Keuangan; tidak ada pesan gagal | |
| A5 | Tutup panel saat kursor meluncur | Penunjuk berhenti | |
| A6 | Biarkan kursor tiba, **baru** gulir | Kursor & sorotan **ikut** bergeser (tidak berhenti) | |
| A7 | Setelah dibatalkan, minta tunjuk lagi | Berjalan normal | |

## B. Sidebar rel ikon (layar < 1600px)

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| B1 | Jendela < 1600px, buka panel (mode normal) | Sidebar menyempit jadi deretan **ikon**; arahkan kursor → tooltip nama menu | |
| B2 | Klik ikon menu | Pindah halaman seperti biasa | |
| B3 | Tutup panel | Sidebar kembali lebar seperti sebelumnya | |
| B4 | Sembunyikan sidebar dulu, buka lalu tutup panel | Sidebar tetap tersembunyi (pilihan Anda dipulihkan) | |
| B5 | Jendela ≥ 1600px | Sidebar tidak berubah saat panel dibuka | |
| B6 | Mode perbesar & `/wall` | Tidak berubah | |

## C. Panduan bertahap

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| C1 | *"pandu saya melihat bagian penting keuangan"* | Kursor ke langkah 1; kartu catatan **"Langkah 1 dari N"** + penjelasan di dekat kartu, tidak menutupi kartu | |
| C2 | Klik **Lanjut** sampai habis | Pindah ke tiap langkah (boleh lintas halaman); langkah terakhir tombol **Selesai** | |
| C3 | Cek tab Network saat klik Lanjut/Stop | **Tidak ada** request baru ke `/api/assistant/*` | |
| C4 | Klik **Stop** di tengah | Panduan berakhir, catatan & sorotan hilang | |
| C5 | Gulir / Esc / pindah halaman sendiri di tengah panduan | Panduan berhenti | |
| C6 | Pertanyaan data biasa (*"berapa realisasi APBDes?"*) | **Tidak** memulai panduan (hanya bila diminta); boleh menawarkan lewat teks | |
| C7 | Penjelasan langkah juga tertulis di jawaban chat | Ya | |
| C8 | User tanpa izin modul minta panduan modul itu | Langkah modul itu ditolak dengan sopan | |
| C9 | Mode **perbesar** lalu minta panduan | Panel ditutup sementara, panduan jalan, "Kembali ke chat" setelah selesai/Stop | |
| C10 | `/wall` akun kiosk: *"pandu saya melihat widget keuangan"* | Hanya widget wall; **lanjut otomatis** tiap 8 detik; tidak pindah halaman | |
| C11 | `/admin/ai-assistant` ubah jeda lanjut otomatis (3–60 detik), simpan, ulangi C10 | Jeda mengikuti setelan | |

## Catatan hasil uji

| Tanggal | Penguji | Langkah ❌ | Catatan / screenshot |
|---|---|---|---|
| | | | |
