# Uji manual — Perbaikan bug uji F2 (2.1, 4.1), role dari DB, status slot Suara

> Branch dari `ai_pointer`: `fix/pointer-manual-bugs` (`ff61c43`), `fix/role-from-db` (`3c50f05`), `fix/voice-slot-status` (`56070dc`).
> Berlaku setelah di-merge ke `join`. Restart `bun run dev`. Isi **Hasil** dengan ✅ / ❌.

## A. Bug 2.1 & 4.1 (penunjuk)

Akar masalah: setelah pindah halaman, data halaman tujuan dimuat dari awal (belum ter-cache) sehingga dropdown/kartu
muncul lewat batas tunggu 5 detik → penunjuk gagal; pesan gagal tidak terlihat karena panel diperbesar sedang ditutup
sementara (P6). Percobaan kedua berhasil karena data sudah ter-cache. Perbaikan: tunggu sampai 20 detik untuk aksi pertama
setelah pindah halaman, pesan gagal khusus, dan panel dibuka lagi bila gagal.

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| A1 | Muat ulang browser di **Beranda**, lalu *"tampilkan APBDes tahun 2025"* | Pindah ke Keuangan, dropdown tahun **berganti ke 2025**, data 2025 tampil | |
| A2 | Ulangi A1 dengan panel **diperbesar** | Berhasil pada percobaan **pertama**; "Kembali ke chat" muncul | |
| A3 | Mode diperbesar, dari halaman lain *"tunjukkan total APBDes"* | Berhasil pada percobaan pertama | |
| A4 | (Opsional) Putus jaringan lalu minta tunjuk kartu di halaman lain | Pesan gagal yang jelas; panel diperbesar dibuka kembali | |

## B. Role dari database (temuan 8)

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| B1 | Login akun A sebagai **admin**, buka `/admin` | Bisa | |
| B2 | Dari akun admin lain, ubah akun A menjadi `user` (tanpa A logout) | — | |
| B3 | Akun A muat ulang `/admin` / panggil API admin | **Langsung** ditolak (403/tidak bisa), tanpa perlu login ulang | |
| B4 | Kembalikan role A | Akses admin kembali | |

## C. Status slot Suara

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| C1 | Hanya slot **Chat** terisi; buka `/admin/ai-assistant` | Kartu Suara **tidak** tampil "siap"/"memakai Chat" | |
| C2 | `GET /api/assistant/status` | `voice: false` | |
| C3 | Isi slot Suara (setelah API key ada) | Kartu Suara tampil siap; `voice: true` | |

## Catatan hasil uji

| Tanggal | Penguji | Langkah ❌ | Catatan / screenshot |
|---|---|---|---|
| | | | |
