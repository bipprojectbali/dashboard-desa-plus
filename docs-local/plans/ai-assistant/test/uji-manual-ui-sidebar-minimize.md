# Uji manual — Sidebar diminimize jadi rel ikon

> Branch `fix/sidebar-collapse-rail` (`56f9575`, sesi `ui_tampilan`, worktree `dashboard-desa-plus-ui`). Bisa diuji sebelum merge:
> hentikan `bun run dev` di checkout lain, jalankan `bun run dev` di worktree UI. Isi **Hasil** dengan ✅ / ❌.

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| 1 | Klik tombol minimize/toggle sidebar di header | Sidebar **tidak hilang**, menyempit jadi rel ikon: logo kecil, ikon cari, ikon menu, tombol perlebar | |
| 2 | Arahkan kursor ke ikon menu | Tooltip nama menu | |
| 3 | Menu halaman aktif | Ikon aktif ditandai | |
| 4 | Klik ikon menu | Pindah halaman | |
| 5 | Klik ikon cari | Dialog pencarian global terbuka (sama dengan tombol cari header / Ctrl+K) | |
| 6 | Klik toggle lagi / tombol perlebar | Sidebar kembali lebar | |
| 7 | Klik 3x area utama (gestur fullscreen) | Sidebar hilang penuh; toggle header mengembalikannya | |
| 8 | Layar < 1600px, buka panel asisten | Rel ikon; tombol perlebar tetap bisa melebarkan | |
| 9 | Mode terang & gelap | Rapi di keduanya | |
| 10 | Jendela sempit (mobile/burger) dan `/wall` | Tidak berubah | |
| 11 | Muat ulang halaman saat sidebar rel | Pilihan rel/penuh dipulihkan seperti sebelumnya | |

## Catatan hasil uji

| Tanggal | Penguji | Langkah ❌ | Catatan / screenshot |
|---|---|---|---|
| | | | |
