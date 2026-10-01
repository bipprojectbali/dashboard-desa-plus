# 05 — Fitur 2: AI menggerakkan kursor & menunjuk elemen

> **Status: DIBAHAS (sesi 59).** P1 (pendekatan) diputuskan: **B**. P2–P7 masih dibahas — lihat `discus/fitur-2-pointer.md`.
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
| P1 | Slot tidak dipakai — penunjuk memakai otak chat (satu loop) | Paling sederhana; cocok dengan pendekatan B |
| P2 | Model **lebih cepat/murah** khusus giliran yang hanya meminta navigasi/penunjukan | Butuh pemilah permintaan (router ringan) |
| P3 | Kredensial untuk eksperimen page-agent (pendekatan A) lewat proxy server | Hanya jika A dipilih |

## 4. Desain pendekatan B

Jenis aksi (whitelist di klien, tolak yang lain):

| `type` | Efek | Konfirmasi |
|---|---|---|
| `navigate` | Pindah rute (hanya rute terdaftar, izin dicek) | Tidak |
| `pointTo` | Kursor virtual bergerak ke elemen, lalu elemen disorot | Tidak |
| `highlight` | Sorot beberapa elemen berurutan (tur singkat) | Tidak |
| `scrollTo` | Gulir ke elemen | Tidak |
| `setFilter` | Ubah filter/tab/periode di halaman (tampilan saja) | Tidak |
| `click` | Menekan tombol | Di luar cakupan baca-saja — **tidak** di MVP |

Prasyarat & kondisi kode saat ini:
1. **Anchor elemen**: `data-ai-target="modul.bagian"`. Saat ini **0** `data-testid`/`data-ai-*`/`id`,
   hanya 19 `aria-label`. Kabar baiknya, komponen sudah dipecah per domain
   (`src/components/keuangan/kpi-cards.tsx`, `allocation-chart.tsx`, `dashboard/chart-apbdes.tsx`, …)
   sehingga anchor cukup ditempel di akar tiap kartu. Mulai dari 1 halaman (usulan: Keuangan, 148 baris).
2. **Registry target** di kode (bukan dari LLM): `{ id, route, label, deskripsi, requiredFeature }`.
   Rute bisa diturunkan dari daftar menu `sidebar.tsx` (sudah memetakan rute → izin) dan `MODULE_URL`
   di `search.ts`.
3. Tool server `buka_halaman(route)` / `tunjukkan_elemen(target)` memvalidasi target & izin lalu
   mengembalikan aksi — tidak menyentuh DOM.
4. `AssistantCursor`: posisi dari `getBoundingClientRect`, easing, ring sorotan. Panel chat tetap
   terbuka. Hormati `prefers-reduced-motion`.

Risiko & mitigasi:
- Elemen belum ter-render (data loading, `PageTransition` beranimasi ~430 ms) → tunggu anchor muncul
  dengan batas waktu, lalu beri tahu user.
- File halaman yang sudah melewati batas (`demografi-pekerjaan.tsx` 1172 baris,
  `pengaduan-layanan-publik.tsx` 553 baris): menambah anchor di sana hanya boleh <10 baris kohesif;
  idealnya dipecah dulu.
- Mode kiosk `/wall` tidak memakai `MainLayout` → fitur otomatis tidak aktif.
- Aksi dari hasil injeksi data warga → whitelist jenis aksi + target.

## 5. Pertanyaan untuk sesi pembahasan fitur 2
1. Pendekatan A atau B? (Rekomendasi: B.)
2. Arti slot `pointer`: P1, P2, atau P3?
3. Halaman percontohan pertama untuk anchor?
4. Perlu mode "tur" (beberapa elemen berurutan dengan narasi) di versi pertama?
