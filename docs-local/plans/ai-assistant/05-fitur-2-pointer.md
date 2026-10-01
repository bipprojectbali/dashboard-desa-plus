# 05 — Fitur 2: AI menggerakkan kursor & menunjuk elemen

> **Status: SEMUA KEPUTUSAN TUNTAS (2026-10-01, sesi 59 → sesi 61)** — menunggu persetujuan akhir dokumen ini
> sebelum implementasi. Ringkasan:
>
> | # | Keputusan |
> |---|---|
> | P1 | Pendekatan **B**: target terdaftar (`data-ai-target` + registry di kode), tool `buka_halaman`/`tunjukkan_elemen`, satu loop `executeWithTools`, baca-saja |
> | P2 | Slot `pointer` **belum dipakai** — penunjuk memakai otak chat; slot berlabel "belum dipakai" di admin |
> | P3 | Menunjuk **hanya bila diminta** + label "Sumber: X" yang bisa diklik (tanpa AI/kuota) |
> | P4 | Versi pertama: `navigate` + `pointTo` (termasuk `scrollTo`); tur & `setFilter` ditunda; `click` tidak |
> | P5 | Percontohan **Keuangan** (`/keuangan-anggaran`), lalu Beranda |
> | P6 | Panel ditutup sementara saat menunjuk + tombol "Kembali ke chat" (HP & mode perbesar) |
> | P7 | Hormati `prefers-reduced-motion`: sorotan + gulir tanpa animasi kursor |
> Referensi: [alibaba/page-agent](https://github.com/alibaba/page-agent) (MIT). Padanan di blueprint:
> Lampiran A.4 no. 2 (aksi UI) dan no. 3 (konfirmasi aksi berisiko).

## 1. Apa yang dilakukan page-agent (dari README resmi)
- Agen berjalan **di dalam halaman** (JavaScript di browser), tanpa extension/headless browser.
- **Berbasis teks DOM**, bukan screenshot: elemen interaktif diekstrak jadi teks, LLM memilih aksi.
- "Bring your own LLM" via endpoint kompatibel OpenAI (`model`, `baseURL`, `apiKey`) — dikonfigurasi di browser.
- Ada extension Chrome (multi-halaman) dan MCP server (beta). Zod sebagai peer dependency.

## 2. Dua pendekatan

| | A. Library page-agent | B. Aksi UI ber-whitelist (pola blueprint) |
|---|---|---|
| Cara kerja | LLM melihat seluruh DOM, bebas klik/isi/scroll elemen mana pun | Tool server mengembalikan `actions: [{type:'pointTo', target:'keuangan.realisasi'}]`; frontend menganimasikan kursor ke elemen ber-anchor |
| Kecepatan demo | Cepat | Perlu menandai elemen dulu |
| Kontrol & keamanan | Default rendah (agen bisa menekan tombol apa pun); aksi bisa dimatikan lewat `customTools`, tetapi teks layar (termasuk nama warga) tetap terkirim ke LLM | Tinggi: hanya jenis aksi & target terdaftar |
| Integrasi dengan fitur 1 | Loop LLM kedua di browser | Satu loop yang sama (`executeWithTools`); aksi = output tambahan (`actions` di kontrak `04`) |
| Kunci API | Bisa tetap di server lewat `customFetch` (lihat koreksi di bawah) | Tetap di server |
| Dependency | Tambah package (+ Zod) — perlu izin | Tidak ada |

### Koreksi setelah pendalaman kode page-agent v1.12.4 (sesi 59, 2026-10-01)

Detail lengkap: `discus/fitur-2-alasan-pendekatan-b.md` §4 (dipindah dari `discus/fitur-2-pointer.md`). Beberapa baris tabel di atas perlu dikoreksi:
- **Kunci API tidak harus di browser.** Opsi `customFetch` bisa mengarahkan panggilan LLM ke endpoint server dashboard, jadi kunci tetap di server.
- **Aksi bawaan bisa dimatikan.** `customTools: { click_element_by_index: null, … }`. Tersedia juga `interactiveBlacklist`/`interactiveWhitelist`, `transformPageContent` (penyaring teks), dan `getPageInstructions(url)`.
- **Claude didukung.**

Kendala yang tetap ada:
1. **Yang dikirim ke LLM adalah teks yang tampil di layar.** Contoh: halaman Pengaduan menampilkan `nama_pengusul` (`pengaduan-layanan-publik.tsx:534`, sudah dicek sesi induk) → bentrok dengan kebijakan data keputusan #16 (temuan 3, opsi A), kecuali setiap halaman disaring lewat `transformPageContent`.
2. **Ada dua loop LLM** (di browser dan di server), sehingga izin, batas, dan log harus dijaga di dua tempat.
3. **Biaya:** satu pertanyaan bisa memicu banyak panggilan LLM (hingga 40 langkah), sedangkan kuota kita dihitung per pesan.
4. **Kalau aksi dimatikan, yang tersisa hanya gulir.** Tool "tunjuk" tidak ada bawaan, jadi tetap harus ditulis sendiri.
5. API hook masih `@experimental`, dengan breaking change di versi 1.8 dan 1.10.
6. Ada dependency baru.

**Keputusan user (2026-10-01, sesi 59): pendekatan B** — target terdaftar, satu loop `executeWithTools`, baca-saja.
page-agent dicatat sebagai pilihan masa depan bila cakupan dibuka untuk aksi tulis (lewat `customFetch` ke server +
slot `pointer`, terkait opsi P3 di §3). Ide animasi kursor/sorotan boleh diadaptasi (lisensi MIT, dengan atribusi). A hanya referensi (cara ekstraksi DOM, animasi kursor/sorotan)
atau eksperimen terpisah mode "tunjukkan saja". A layak dipertimbangkan kelak **jika cakupan dibuka untuk aksi tulis**,
lewat `customFetch` + slot `pointer` (opsi P3 di §3).

## 3. Apa arti "slot API key Penunjuk"? (perlu diputuskan saat fitur ini dibahas)

Pondasi sudah menyiapkan slot `pointer` (kosong → pakai `chat`). Tiga kemungkinan pemakaian:

| Opsi | Arti | Catatan |
|---|---|---|
| P1 | Slot tidak dipakai — penunjuk memakai otak chat (satu loop) | Paling sederhana; cocok dengan pendekatan B — **DIPILIH user (2026-10-01)**. Slot `pointer` tetap ada di DB & admin, berlabel "belum dipakai". `pickSlot` di `provider/resolve.ts` sudah fallback ke `chat` |
| P2 | Model **lebih cepat/murah** khusus giliran yang hanya meminta navigasi/penunjukan | Butuh pemilah permintaan (router ringan) |
| P3 | Kredensial untuk eksperimen page-agent (pendekatan A) lewat proxy server | Hanya jika A dipilih |

## 4. Desain pendekatan B

Jenis aksi (whitelist di klien, tolak yang lain):

| `type` | Efek | Konfirmasi |
|---|---|---|
| `navigate` | Pindah rute (hanya rute terdaftar, izin dicek) | Tidak — **versi pertama** |
| `pointTo` | Kursor virtual bergerak ke elemen, lalu elemen disorot (termasuk `scrollTo`) | Tidak — **versi pertama** |
| `highlight` | Sorot beberapa elemen berurutan (tur singkat) | Tidak — **ditunda** |
| `scrollTo` | Gulir ke elemen | Tidak — **bagian dari `pointTo`** |
| `setFilter` | Ubah filter/tab/periode di halaman (tampilan saja) | Tidak — **ditunda** |
| `click` | Menekan tombol | **Tidak dibuat** (baca-saja) |

Prasyarat & kondisi kode saat ini:
1. **Anchor elemen**: `data-ai-target="modul.bagian"`. Saat ini **0** `data-testid`/`data-ai-*`/`id`,
   hanya 19 `aria-label`. Kabar baiknya, komponen sudah dipecah per domain
   (`src/components/keuangan/kpi-cards.tsx`, `allocation-chart.tsx`, `dashboard/chart-apbdes.tsx`, …)
   sehingga anchor cukup ditempel di akar tiap kartu. **Keputusan (2026-10-01): mulai dari Keuangan
   (`/keuangan-anggaran`, `keuangan-anggaran.tsx` 148 baris, 5 kartu di `src/components/keuangan/`), lalu Beranda.**
2. **Registry target** di kode (bukan dari LLM): `{ id, route, label, deskripsi, requiredFeature }`.
   Rute bisa diturunkan dari daftar menu `sidebar.tsx` (sudah memetakan rute → izin) dan `MODULE_URL`
   di `search.ts`.
3. Tool server `buka_halaman(route)` / `tunjukkan_elemen(target)` memvalidasi target & izin lalu
   mengembalikan aksi — tidak menyentuh DOM. **Keputusan (2026-10-01): AI hanya memanggilnya bila user meminta**
   ("tunjukkan", "di mana", "buka").
4. **Label "Sumber: X" di bawah jawaban bisa diklik** → frontend langsung menunjuk kartu modul itu, tanpa
   memanggil AI dan tanpa memakai kuota. Label diturunkan dari daftar tool yang dijalankan executor
   (`toolsUsed`); pemetaan tool → modul → target registry dibuat saat implementasi.
4. `AssistantCursor`: posisi dari `getBoundingClientRect`, easing, ring sorotan. Panel chat tetap
   terbuka di desktop mode normal. **Keputusan P6 (2026-10-01):** bila panel menutupi layar (HP = layar penuh,
   desktop mode perbesar = lebar penuh), panel **ditutup sementara**, kursor & sorotan berjalan, lalu muncul
   tombol **"Kembali ke chat"** yang membuka panel lagi dengan percakapan utuh. Hormati `prefers-reduced-motion`.

Risiko & mitigasi:
- Elemen belum ter-render (data loading, `PageTransition` beranimasi ~430 ms) → tunggu anchor muncul
  dengan batas waktu, lalu beri tahu user.
- File halaman yang sudah melewati batas (`demografi-pekerjaan.tsx` 1172 baris,
  `pengaduan-layanan-publik.tsx` 553 baris): menambah anchor di sana hanya boleh <10 baris kohesif;
  idealnya dipecah dulu.
- Mode kiosk `/wall` tidak memakai `MainLayout` → fitur otomatis tidak aktif.
- Aksi dari hasil injeksi data warga → whitelist jenis aksi + target.

## 5. Pertanyaan awal (semua sudah dijawab — lihat ringkasan di atas)
1. Pendekatan A atau B? (Rekomendasi: B.)
2. Arti slot `pointer`: P1, P2, atau P3?
3. Halaman percontohan pertama untuk anchor?
4. Perlu mode "tur" (beberapa elemen berurutan dengan narasi) di versi pertama?
