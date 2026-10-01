# Diskusi Fitur 2 — AI menunjuk elemen di layar

> Rujukan: `05-fitur-2-pointer.md` (analisa). Jawab langsung di file ini di bawah tiap pertanyaan.
> Status: ⏳ dibahas.

## Gambaran yang dituju (contoh)

User di halaman Beranda membuka panel dan bertanya *"Di mana saya bisa lihat realisasi APBDes?"*
1. Asisten menjawab di panel: "Realisasi APBDes 2026 sebesar 62%, ada di halaman Keuangan."
2. Dashboard pindah ke `/keuangan-anggaran`, panel tetap terbuka.
3. Kursor virtual bergerak halus ke kartu "Realisasi", kartu itu diberi cincin sorotan beberapa detik.

Tidak ada tombol yang ditekan oleh AI. Semua tetap **baca-saja**.

---

## P1. Pendekatan

| Opsi | Cara kerja | Catatan |
|---|---|---|
| A | Library alibaba/page-agent: AI membaca seluruh isi halaman dan bebas klik/isi elemen mana pun | Bertentangan dengan keputusan baca-saja; API key harus diatur di browser; tambah dependency |
| B | AI hanya boleh memilih **target yang sudah didaftarkan** di kode (mis. `keuangan.realisasi`); frontend yang menggerakkan kursor | Aman, tanpa dependency, memakai otak chat yang sama |

**Saran: B.** page-agent tetap dipakai sebagai referensi cara animasi kursor/sorotan.

Analisa lengkap opsi A dan cara kerja B dipindah ke **`fitur-2-alasan-pendekatan-b.md`** (pegangan untuk menjelaskan ke tim).

Jawaban: **B** (user, 2026-10-01). page-agent dicatat sebagai pilihan masa depan bila cakupan dibuka untuk aksi tulis (lewat `customFetch` + slot Penunjuk).

---

## P2. Arti slot API key "Penunjuk"

| Opsi | Arti |
|---|---|
| P1 | Slot tidak dipakai dulu — penunjuk memakai otak chat (satu loop). Slot tetap ada untuk nanti |
| P2 | Model lebih cepat/murah khusus permintaan "tunjukkan/buka", butuh pemilah permintaan |
| P3 | Kredensial untuk eksperimen page-agent (hanya jika opsi A) |

**Saran: P1.** Paling sederhana; bisa naik ke P2 kalau terasa lambat.

Jawaban:

---

## P3. Kapan AI menunjuk?

| Opsi | Perilaku |
|---|---|
| a | Hanya saat user meminta ("tunjukkan", "di mana", "buka") |
| b | Setiap kali jawabannya menyebut data yang ada kartunya di layar |
| c | (a) + label "Sumber: Keuangan" di bawah jawaban bisa diklik → menunjuk kartunya (tanpa memanggil AI lagi) |

**Saran: c.** AI tidak "mengganggu" layar tanpa diminta, tapi user tetap bisa melihat asal angka dengan satu klik.

Jawaban:

---

## P4. Jenis aksi di versi pertama

| Aksi | Efek | Saran |
|---|---|---|
| `navigate` | Pindah halaman (hanya rute terdaftar & sesuai izin) | ✅ versi pertama |
| `pointTo` | Kursor bergerak ke elemen + sorotan | ✅ versi pertama |
| `scrollTo` | Gulir ke elemen | ✅ versi pertama (bagian dari `pointTo`) |
| `highlight` (tur beberapa elemen berurutan) | Tur singkat dengan narasi | ⏸ nanti |
| `setFilter` (ganti tab/periode/tahun) | Mengubah tampilan | ⏸ nanti |
| `click` | Menekan tombol | ❌ tidak (baca-saja) |

Jawaban:

---

## P5. Halaman percontohan

Anchor (`data-ai-target`) saat ini belum ada sama sekali. Mulai dari satu halaman:

| Opsi | Alasan |
|---|---|
| **Keuangan** (`/keuangan-anggaran`) | File kecil (148 baris), kartu sudah terpisah: KPI, alokasi, pendapatan-belanja, laporan, dana bantuan. Cocok dengan tool `ringkasan_keuangan` |
| Beranda (`/`) | Paling sering dibuka, tapi kartunya lintas modul |

**Saran: Keuangan**, lalu Beranda.

Jawaban:

---

## P6. Di HP (layar kecil)

Di HP panel chat menutupi layar penuh, jadi kursor tidak akan terlihat.

| Opsi | Perilaku |
|---|---|
| a | Panel otomatis mengecil/menutup saat menunjuk, lalu tombol "kembali ke chat" |
| b | Fitur penunjuk tidak aktif di HP (jawaban teks saja) |

**Saran: a.**

Jawaban:

---

## P7. Aksesibilitas

User yang menyalakan "kurangi gerakan" (`prefers-reduced-motion`) mendapat sorotan tanpa animasi kursor.
**Saran: ya** (tidak perlu keputusan kecuali Anda keberatan).

Jawaban:
