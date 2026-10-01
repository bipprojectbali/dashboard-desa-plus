# Alasan memilih pendekatan B untuk Fitur 2 (penunjuk)

> **Keputusan:** user, 2026-10-01 — pendekatan **B** (target terdaftar). Lihat `fitur-2-pointer.md` P1.
> **Kegunaan dokumen ini:** pegangan untuk menjelaskan ke tim **kenapa tidak memakai
> alibaba/page-agent (opsi A)** dan **bagaimana B bekerja**. Semua klaim dicek ke kode sumber
> page-agent v1.12.4 dan kode dashboard per 2026-10-01.

## 1. Ringkasan satu paragraf

page-agent adalah produk matang untuk **AI yang mengoperasikan halaman** (klik, isi formulir).
Fitur 2 dashboard adalah **AI yang menunjukkan** isi halaman dalam mode **baca-saja**. page-agent
membaca apa pun yang tampil di layar (termasuk nama warga), menjalankan otak AI kedua di browser,
dan memakai banyak panggilan LLM per pertanyaan. Pendekatan B memakai otak chat yang sama di server,
hanya menerima data yang sudah disaring, dan hanya boleh menunjuk target yang terdaftar di kode.
page-agent **tidak ditolak selamanya** — disimpan untuk saat AI boleh melakukan aksi tulis (§5).

## 2. Perbandingan singkat

| Aspek | A. page-agent | B. Target terdaftar |
|---|---|---|
| Yang dilihat AI | Teks seluruh layar (termasuk nama pengusul pengaduan) | Data dari tool server yang sudah disaring (keputusan #16) |
| Otak AI | Dua: loop di browser + loop chat di server | Satu: `executeWithTools` yang sama dengan Fitur 1 |
| Panggilan LLM per pertanyaan | Banyak (maks 40 langkah, tiap langkah kirim isi layar) | Sama dengan chat biasa (maks 6 iterasi pondasi) |
| Kuota per pesan (50/hari, kiosk 100) | Sulit diprediksi | Tetap 1 pesan = 1 jawaban |
| Menunjuk elemen | Tidak ada bawaan → tetap tulis sendiri | Dirancang khusus untuk ini |
| Baca-saja | Harus mematikan tool bawaan satu per satu | Tidak ada aksi tulis sejak awal |
| Kunci API | Bisa aman lewat `customFetch` ke server | Di server |
| Dependency baru | Ya (`page-agent`, `zod`, `chalk`, `ai-motion`) | Tidak |
| Stabilitas API | Hook `@experimental`; breaking change di 1.8 & 1.10 | Kode sendiri |

## 3. Cara kerja pendekatan B

### 3.1 Yang disiapkan di kode

1. **Penanda elemen** — atribut tak terlihat di akar kartu, mis.
   `<Card data-ai-target="keuangan.realisasi">`. Tidak mengubah tampilan.
2. **Daftar target (registry)** di kode, bukan dari AI:

   | id | Halaman | Nama | Keterangan untuk AI | Izin |
   |---|---|---|---|---|
   | `keuangan.realisasi` | `/keuangan-anggaran` | Kartu Realisasi | Persentase realisasi APBDes tahun berjalan | `view-keuangan` |
   | `keuangan.alokasi` | `/keuangan-anggaran` | Grafik Alokasi | Alokasi anggaran per sektor | `view-keuangan` |

3. **Dua tool tambahan** di samping tool data Fitur 1: `buka_halaman(halaman)` dan
   `tunjukkan_elemen(target)`. AI hanya diberi target yang **boleh dilihat user tersebut**.

### 3.2 Alur satu pertanyaan

```
User: "Tunjukkan realisasi APBDes"
  │
  ▼
Server (otak AI yang sama dengan chat)
  1. AI memanggil ringkasan_keuangan        → angka 62%
  2. AI memanggil tunjukkan_elemen("keuangan.realisasi")
       └ server cek: target terdaftar? user punya izin? → ya
       └ hasil hanya catatan aksi: { type: "pointTo", target: "keuangan.realisasi" }
  3. AI menulis jawaban
  │
  ▼  { jawaban: "Realisasi APBDes 2026 sebesar 62%…", actions: [navigate, pointTo] }
  │
Browser
  4. Cek ulang: jenis aksi & target ada di whitelist? → ya
  5. Pindah ke /keuangan-anggaran (panel chat tetap terbuka)
  6. Tunggu kartu muncul (dengan batas waktu)
  7. Gulir → kursor bergerak halus → kartu disorot beberapa detik
```

Server tidak menyentuh layar; ia hanya mengirim instruksi. AI tidak pernah mengklik apa pun.

### 3.3 Kapan AI hanya menjawab, kapan menunjuk

AI yang memutuskan (sama seperti memutuskan kapan mengambil data), diarahkan tiga lapis:

1. **Keterangan tool** — mis. *"Gunakan `tunjukkan_elemen` HANYA jika user meminta ditunjukkan atau
   bertanya letak sesuatu ('di mana…', 'tunjukkan…', 'buka…')."*
2. **Aturan prompt** (lapisan "Aturan jawaban" di `03` §7) — mis. maksimal satu aksi tunjuk per
   jawaban; konteks halaman aktif ikut dipertimbangkan.
3. **Penjaga kode** — tidak bergantung kecerdasan AI. Target karangan, target tanpa izin, atau aksi
   hasil "perintah" tersembunyi di data warga ditolak server **dan** browser.

| Pertanyaan | Perilaku |
|---|---|
| "Berapa realisasi APBDes?" | Jawab saja |
| "Di mana saya lihat realisasi APBDes?" | Jawab + tunjuk kartu |
| "Tunjukkan grafik alokasi" | (Pindah halaman) + tunjuk |
| "Bandingkan realisasi 2025 dan 2026" | Jawab saja (tidak ada kartu perbandingan) |

**Batasan yang jujur:** lapis 1–2 tidak 100% — sesekali AI bisa menunjuk tanpa diminta atau lupa
menunjuk. Keamanan tidak terpengaruh (lapis 3); ketepatan disetel lewat kalimat aturan dan diuji
dengan daftar contoh pertanyaan seperti tabel di atas. Seberapa "berani" AI menunjuk diputuskan di
`fitur-2-pointer.md` P3.

## 4. Pendalaman opsi A — alibaba/page-agent (dicek dari kode sumber v1.12.4, 2026-10-01)

**Kondisi proyek:** MIT, ±29 ribu bintang, aktif (commit terakhir 2026-09-29, rilis v1.12.4 2026-09-06).
Paket: `page-agent` (lengkap dengan panel UI) atau `@page-agent/core` + `@page-agent/page-controller`
(tanpa UI). Peer dependency `zod` (sudah ada di node_modules dashboard sebagai dependency tidak langsung, v4).

**Cara kerjanya:** setiap langkah, isi halaman diringkas menjadi teks (elemen interaktif + teks di
sekitarnya) → dikirim ke LLM → LLM memilih satu tool → dijalankan → ulang sampai `done` (maks 40 langkah).
Tool bawaan: `done`, `wait`, `ask_user`, `click_element_by_index`, `input_text`,
`select_dropdown_option`, `scroll`, `scroll_horizontally`, `execute_javascript` (eksperimen, mati bawaan).

### Yang ternyata bisa diatasi (koreksi atas analisa awal di `05` §2)

| Kekhawatiran awal | Fakta di kode |
|---|---|
| API key harus di browser | Opsi `customFetch` → panggilan LLM bisa diarahkan ke endpoint server dashboard; server yang memasang kunci & mengecek sesi/izin/kuota. Kunci asli tidak ke browser |
| Agen bisa menekan apa saja | `customTools` bisa **menghapus** tool bawaan (`click_element_by_index: null`, dst.) dan menambah tool sendiri. `interactiveBlacklist/Whitelist` membatasi elemen yang terlihat |
| Tidak tahu konteks halaman | `instructions.getPageInstructions(url)` memberi petunjuk per halaman |
| Data sensitif | `transformPageContent` bisa menyaring teks halaman sebelum dikirim |
| Claude | Didukung (ada penyesuaian khusus model `claude*`), endpoint OpenAI-compatible |
| Panel UI China/Inggris | Bisa dipakai tanpa panelnya (core + controller), UI tetap panel Mantine kita |

### Yang tetap menjadi masalah untuk dashboard ini

1. **AI "membaca layar", bukan data yang sudah disaring.** Yang dikirim ke LLM adalah apa pun yang
   tampil. Contoh nyata: halaman Pengaduan menampilkan judul pengaduan **dan nama pengusul**
   (`src/components/pengaduan-layanan-publik.tsx` ±baris 531–535). Ini bertentangan dengan keputusan
   #16 (tanpa nama orang / teks warga). `transformPageContent` hanya menerima teks mentah, jadi
   penyaringannya harus menebak pola nama — rapuh.
2. **Dua otak terpisah.** Loop page-agent berjalan di browser, terpisah dari `executeWithTools` di
   server. Riwayat chat, `toolsUsed`, izin per tool, dan audit harus disambung ulang.
3. **Satu pertanyaan = banyak panggilan LLM.** Tiap langkah mengirim ringkasan halaman lagi.
   Kuota kita dihitung per pesan (50/hari, kiosk 100/hari) → biaya per pesan jauh lebih besar dan sulit diprediksi.
4. **Kekuatannya justru di aksi** (klik, isi formulir, pilih dropdown). Setelah semua itu dimatikan
   demi baca-saja, yang tersisa hanya `scroll`. "Menunjuk elemen" **tidak ada** sebagai tool bawaan
   (kursornya hanya muncul saat mengklik) → tetap harus menulis tool tunjuk sendiri.
5. **API masih bergerak.** `customTools` dan semua hook ditandai `@experimental`; ada perubahan
   besar di 1.8 dan 1.10 (siklus hidup agen). Menaikkan versi berisiko memecah integrasi.
6. Tambah dependency (`page-agent` + `zod` langsung + `chalk` + `ai-motion`) → perlu izin (aturan dependency).

### Kesimpulan pendalaman

 page-agent adalah produk matang untuk **"AI yang mengoperasikan halaman"**
(isi formulir, klik alur kerja). Fitur 2 kita adalah **"AI yang menunjukkan"** dalam mode baca-saja.
Untuk tujuan itu, B lebih cocok: satu otak, data sudah disaring di server, biaya 1 pesan = 1 jawaban.

## 5. Kapan opsi A layak dipakai

 jika kelak cakupan dibuka untuk **aksi tulis** (mis. membantu admin
mengisi formulir di `/admin/*`). Saat itu page-agent dipasang lewat `customFetch` ke server,
memakai **slot API key Penunjuk** (= opsi P3 di P2), di halaman yang tidak menampilkan data warga.
Ide yang dicontek sekarang (MIT, cantumkan atribusi): gaya kursor & sorotan (`page-controller/src/mask`).
