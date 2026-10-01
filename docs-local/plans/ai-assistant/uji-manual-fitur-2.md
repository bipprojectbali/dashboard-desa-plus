# Uji manual — Fitur 2 (penunjuk AI)

> Untuk menguji hasil F2-a + F2-b di branch `join` (merge `6c86a9b`, 2026-10-02).
> Isi kolom **Hasil** dengan ✅ / ❌ dan tulis catatan bila ❌ (lampirkan screenshot + langkah).
> Rujukan keputusan: `05-fitur-2-pointer.md` (disetujui), README #28–#37, #39.

## 0. Persiapan

| # | Langkah | Hasil |
|---|---|---|
| 0.1 | Checkout utama di branch `join`, jalankan `bun run dev` (restart bila sudah jalan) | |
| 0.2 | Login sebagai **admin** (terverifikasi). Asisten **aktif** dan slot **Chat** terisi di `/admin/ai-assistant` | |
| 0.3 | Mode panel **normal** (440px) — bukan perbesar — kecuali langkah meminta lain | |
| 0.4 | Siapkan juga satu akun **user** biasa yang terverifikasi (untuk uji izin di §6) | |

## 1. Menunjuk kartu (pindah halaman + kursor)

Target yang terdaftar di halaman **Keuangan** (`/keuangan-anggaran`): Total APBDes, Realisasi, Pemasukan,
Pengeluaran, Grafik pendapatan & belanja bulanan, Grafik alokasi anggaran, Laporan APBDes, Dana bantuan,
Pemilih tahun, Tombol "Coba lagi".

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| 1.1 | Dari **Beranda**, tanya: *"tunjukkan total APBDes"* | Jawaban selesai → dashboard pindah ke `/keuangan-anggaran` → halaman bergulir → kursor bergerak ke kartu **Total APBDes** → kartu disorot beberapa detik. Panel tetap terbuka | |
| 1.2 | Di Keuangan, tanya: *"di mana grafik alokasi anggaran?"* | Tanpa pindah halaman; kursor & sorotan ke **Grafik alokasi anggaran** | |
| 1.3 | Tanya: *"tunjukkan laporan APBDes"* | Gulir ke bawah sampai kartu **Laporan APBDes**, lalu disorot | |
| 1.4 | Tanya: *"tunjukkan dana bantuan"* | Kartu **Dana bantuan** ditunjuk | |
| 1.5 | Tanya pertanyaan data biasa: *"berapa realisasi APBDes?"* | **Hanya menjawab** — kursor TIDAK bergerak (AI menunjuk hanya bila diminta) | |
| 1.6 | Tanya: *"tunjukkan grafik penduduk per banjar"* (halaman yang belum punya target) | AI menjawab bahwa bagian itu belum bisa ditunjukkan / menjelaskan letaknya; tidak ada kursor ngawur | |

## 2. Memilih tahun (aksi `pilih`)

> Hanya bisa diuji bila data APBDes punya **lebih dari satu tahun** (pemilih tahun baru muncul saat itu).

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| 2.1 | Tanya: *"tampilkan APBDes tahun 2025"* (pakai tahun yang memang ada) | Pindah ke Keuangan bila perlu → kursor ke **Pemilih tahun** → dropdown terbuka → tahun dipilih → kartu menampilkan data tahun itu | |
| 2.2 | Tanya tahun yang tidak ada, mis. *"tampilkan APBDes 2010"* | AI menyebut tahun yang tersedia; dropdown tidak diubah | |

## 3. Klik tampilan & tombol yang mengubah data

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| 3.1 | (Opsional, bila data keuangan sedang gagal dimuat dan tombol **"Coba lagi"** tampil) tanya: *"klik coba lagi"* | Kursor ke tombol lalu tombol diklik, data dimuat ulang | |
| 3.2 | Di halaman mana pun, tanya: *"tekan tombol simpan"* / *"hapus data ini"* | AI **tidak mengklik**; cukup menunjuk (bila terdaftar) dan berkata **"silakan tekan sendiri"** | |
| 3.3 | Tanya: *"klik menu Pengaturan"* (elemen tanpa penanda boleh-diklik) | Tidak ada klik; AI menjelaskan / menunjuk bila ada target | |

## 4. Mode perbesar — panel ditutup sementara (P6)

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| 4.1 | Tekan tombol **perbesar** di panel, lalu tanya: *"tunjukkan total APBDes"* | Setelah jawaban selesai panel **menutup**, kursor & sorotan berjalan, lalu muncul tombol **"Kembali ke chat"** | |
| 4.2 | Klik **"Kembali ke chat"** | Panel terbuka lagi (mode perbesar) dengan **percakapan utuh**, termasuk jawaban terakhir | |
| 4.3 | Ulangi 1.1 dalam mode **normal** (440px) | Panel **tetap terbuka** selama kursor berjalan | |

## 5. Label "Sumber" bisa diklik (P3)

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| 5.1 | Tanya: *"berapa total APBDes?"* → di bawah jawaban muncul **"Sumber: Keuangan & Anggaran"** | Label tampil sebagai tautan yang bisa diklik | |
| 5.2 | Buka DevTools → tab **Network**, lalu klik label **Sumber** | Pindah ke Keuangan bila perlu → kursor ke **Total APBDes**. **Tidak ada** request baru ke `/api/assistant/*` (tanpa AI, tanpa kuota) | |
| 5.3 | Tanya data modul lain, mis. *"ada berapa pengaduan aktif?"* | Label **Sumber: Pengaduan…** tampil sebagai **teks biasa** (belum ada target di modul itu) | |

## 6. Izin & keamanan

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| 6.1 | Di `/admin/roles` cabut izin **Keuangan** untuk role `user`; login sebagai user biasa → tanya *"tunjukkan total APBDes"* | AI menyatakan tidak punya akses modul Keuangan; **tidak** pindah halaman / tidak menunjuk | |
| 6.2 | Masih sebagai user tanpa izin Keuangan → tanya data lain lalu lihat label Sumber | Label Sumber Keuangan (bila muncul) **tidak bisa diklik** | |
| 6.3 | Kembalikan izin Keuangan untuk role `user` | — | |

## 7. Aksesibilitas — kurangi gerakan (P7)

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| 7.1 | Aktifkan *Reduce motion* di OS (macOS: System Settings → Accessibility → Display → Reduce motion), muat ulang halaman → tanya *"tunjukkan total APBDes"* | Kartu disorot + halaman bergulir, **tanpa** animasi kursor meluncur | |
| 7.2 | Matikan lagi *Reduce motion* | — | |

## 8. Ketahanan

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| 8.1 | Tanya *"tunjukkan total APBDes"* lalu segera tekan **stop** sebelum jawaban selesai | Tidak ada aksi kursor yang berjalan; bubble "Pertanyaan dibatalkan." | |
| 8.2 | Tanya *"tunjukkan total APBDes"*, lalu saat jawaban masih mengalir klik **Percakapan baru** | Aksi tidak dijalankan di percakapan baru | |
| 8.3 | Saat data Keuangan masih memuat (muat ulang halaman lalu langsung bertanya) | Kursor menunggu kartu muncul; bila terlalu lama muncul pesan **"Maaf, saya belum bisa menunjukkan bagian itu di layar."** | |
| 8.4 | (Opsional) `/wall` dengan akun kiosk: tanya *"tunjukkan total APBDes"* | Perilaku sesuai keputusan: pindah ke halaman tujuan & menunjuk. Catat bila mengganggu tampilan NOC | |
| 8.5 | Ganti bahasa ke **English** lalu ulangi 1.1 | Teks panel & pesan gagal berbahasa Inggris | |

## Catatan hasil uji

| Tanggal | Penguji | Langkah ❌ | Catatan / screenshot |
|---|---|---|---|
| | | | |
