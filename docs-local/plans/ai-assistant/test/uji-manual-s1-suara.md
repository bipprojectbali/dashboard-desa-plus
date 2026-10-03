# Uji manual — S1 mode suara di panel Jenna

> Branch `feature/ai-voice-s1` di worktree `~/orca/workspaces/dashboard-desa-plus/dashboard-desa-plus-voice-s0`.
> Bisa diuji **sebelum** merge: hentikan `bun run dev` di checkout utama, lalu jalankan `bun x prisma migrate deploy`
> (migrasi `add_assistant_voice_s1`) dan `bun run dev` di worktree ini (DB & `.env` sama).
> Hanya **Chrome/Edge desktop**. Tiap giliran suara = **1 pesan kuota chat** (Claude) + **menit suara** (biaya OpenAI).
> Rancangan: `06-fitur-3-suara.md` §11.3, keputusan #46–#53. Isi **Hasil** dengan ✅ / ❌.

## 0. Persiapan

| # | Langkah | Hasil |
|---|---|---|
| 0.1 | `/admin/ai-assistant` → slot **Suara**: Base URL `https://api.openai.com/v1`, API key OpenAI diisi **di form ini saja**, slot aktif | |
| 0.2 | Bagian **Pengaturan suara**: model `gpt-live-1`, menit harian user/kiosk 60, maks sesi 10 menit, hening 120 detik → Simpan | |
| 0.3 | `/admin/roles` → izin **use-ai-voice** aktif untuk `admin` & `user` (bawaan) | |

## A. Mulai, persetujuan, status

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| A1 | Buka panel Jenna (FAB) | Tombol **Mulai bicara dengan Jenna** di atas kolom ketik | |
| A2 | Klik tombol pertama kali | Banner persetujuan: mikrofon aktif, suara dikirim ke OpenAI, suara jawaban dibuat AI. **Batal** → banner hilang, suara tidak menyala | |
| A3 | Klik lagi → **Setuju dan mulai** → izinkan mikrofon | Status **Menghubungkan** → **Siap bicara**; ikon mikrofon merah permanen; sisa waktu `Sisa 9:59…` berjalan | |
| A4 | Muat ulang halaman, nyalakan lagi | Banner **tidak** muncul lagi (persetujuan tersimpan) | |
| A5 | Tutup panel (X) saat suara aktif | Suara tetap jalan; buka lagi → status yang sama | |
| A6 | Klik **Off** (tombol merah) | Kembali ke tombol mulai; mikrofon browser mati | |

## B. Tanya-jawab

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| B1 | Ucapkan *"berapa total APBDes tahun ini?"* | Transkrip ucapan tampil miring; status **Mendengarkan** → **Menjawab** | |
| B2 | Dengarkan jawaban | Teks jawaban di panel = Markdown lengkap (angka penuh, mis. Rp 940.248.688); suara menyebut ringkas ("sekitar 940,2 juta rupiah"); 2–4 kalimat | |
| B3 | Lihat riwayat | Pertanyaan & jawaban suara bertanda ikon 🎙 (tooltip "Pesan suara"); ada di percakapan yang sama dengan chat teks | |
| B4 | Buka **Riwayat** → percakapan itu | Ikon 🎙 tetap ada setelah dimuat ulang dari server | |
| B5 | Ucapkan *"tunjukkan grafik penduduk"* | Penunjuk Fitur 2 berjalan (panel boleh tertutup sementara); suara tetap aktif | |
| B6 | Bicara saat Jenna masih menjawab (sela) | Jawaban berhenti; kalimat yang belum terkirim dibatalkan; pertanyaan baru diproses | |
| B7 | **Bisukan jawaban** | Jawaban tetap muncul sebagai teks, tanpa suara; tekan lagi → bersuara | |
| B8 | **Bisukan mikrofon** | Ikon jadi mikrofon dicoret abu-abu; ucapan tidak tertangkap | |

## C. Batas waktu & kuota

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| C1 | Diam 2 menit | Suara mati otomatis + pesan "Mode suara dimatikan karena tidak ada percakapan." | |
| C2 | Biarkan sesi berjalan hampir 10 menit | 1 menit sebelum habis: ajakan **Perpanjang 1 menit** | |
| C3 | Klik **Perpanjang** | Sisa waktu bertambah 1 menit | |
| C4 | Biarkan habis tanpa perpanjang | Sesi berhenti dengan pesan batas sesi | |
| C5 | Admin set menit harian user = 1, pakai > 1 menit | Sesi berhenti dengan pesan kuota; start berikutnya ditolak dengan pesan kuota + kapan pulih | |
| C6 | Kembalikan menit harian ke 60 | | |

## D. Galat & batasan

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| D1 | Tolak izin mikrofon di browser | Pesan "Akses mikrofon ditolak…", tidak crash | |
| D2 | Buka tab kedua, nyalakan suara saat tab pertama aktif | Ditolak: "Mode suara sedang aktif di tab atau perangkat lain…"; tab pertama tetap jalan | |
| D3 | Tutup tab pertama tanpa Off, tunggu ~1 menit, nyalakan di tab lain | Berhasil (sesi basi dilepas) | |
| D4 | Cabut jaringan di tengah sesi | Pesan "Koneksi suara terputus. Silakan mulai lagi."; tombol mulai kembali | |
| D5 | Kosongkan/nonaktifkan slot **Suara**, lalu nyalakan | Pesan "Mode suara belum disiapkan admin." | |
| D6 | Akun role tanpa **use-ai-voice** | Tombol suara tidak tampil; chat teks tetap jalan | |
| D7 | Safari / Firefox | Tombol nonaktif + alasan "hanya Chrome/Edge desktop" | |
| D8 | `/wall` | Tidak ada tombol suara | |
| D9 | Ganti bahasa ke English | Semua teks suara berbahasa Inggris | |

## E. Catatan

- Audio tidak disimpan; isi transkrip tidak dicatat di log server.
- Temuan / bug:
