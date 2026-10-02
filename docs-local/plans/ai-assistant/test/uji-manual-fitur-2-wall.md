# Uji manual — Fitur 2 (penunjuk) di `/wall` (F2-w)

> Aturan (keputusan #40): di `/wall`, AI **menjawab** dan **hanya menunjuk widget yang tampil di wall** — tidak pindah halaman,
> tidak mengklik/memilih. Berlaku setelah F2-w (commit `7f92c19`, `f97139c`, `44fec3f`) di-merge ke `join`. Restart `bun run dev`.
> Persiapan: login **akun kiosk** yang terverifikasi, dipilih sebagai akun kiosk di `/admin/ai-assistant`, dan punya izin modul
> yang widget-nya tampil. Isi **Hasil** dengan ✅ / ❌.

Target: `wall.<id-widget>` diturunkan otomatis dari katalog widget wall (48 widget). Izin mengikuti kategori widget;
widget **Status Sistem** (ops) memakai izin `view-dashboard`, jadi akun kiosk bisa ditunjukkan (keputusan #42).

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| 1 | Buka `/wall`, buka panel asisten, tanya *"Di mana KPI keuangan?"* | Kursor meluncur ke widget keuangan, ring menyala, halaman **tidak** pindah | |
| 2 | *"Buka halaman Keuangan"* / *"klik tombol …"* | AI menolak ramah ("di layar NOC saya hanya bisa menunjuk widget yang tampil"); tidak ada navigasi/klik | |
| 3 | Minta menunjuk widget yang **tidak ada** di layout wall saat ini | Pesan "Maaf, saya belum bisa menunjukkan bagian itu di layar." — tanpa error | |
| 4 | Akun tanpa izin modul (mis. tanpa `view-keuangan`) minta tunjuk widget keuangan | Ditolak "tidak punya akses" | |
| 5 | Dengan akun **kiosk** (punya `view-dashboard`, tanpa `sync-noc`) minta *"tunjukkan status sistem"*; lalu akun **tanpa** `view-dashboard` | Akun kiosk: widget Status Sistem ditunjuk. Akun tanpa `view-dashboard`: ditolak | |
| 6 | Panel **diperbesar**, lalu minta menunjuk widget | Panel menutup sementara, kursor menunjuk, tombol **"Kembali ke chat"** muncul | |
| 7 | Panel mode normal (440px) | Widget target tidak tertutup panel (wall bergeser memberi ruang) | |
| 8 | Regresi: di halaman biasa (`/`, `/keuangan-anggaran`) minta pindah halaman + tunjuk | Tetap berjalan seperti sebelumnya; target `wall.*` tidak ditawarkan di sana | |

## Catatan hasil uji

| Tanggal | Penguji | Langkah ❌ | Catatan / screenshot |
|---|---|---|---|
| | | | |
