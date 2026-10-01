# Tinjau ulang page-agent untuk Fitur 2 (penunjuk)

> Status: ⏳ dibahas (dibuka 2026-10-01, sesi 59, atas permintaan user lewat sesi induk 0d).
> Keputusan yang sedang berlaku: pendekatan **B** (keputusan #28–34, `05-fitur-2-pointer.md`).
> Pendalaman pertama: `fitur-2-alasan-pendekatan-b.md` §4–5. Dokumen ini **menambah** fakta baru
> dan menimbang ulang. Semua fakta dicek ke kode sumber page-agent v1.12.4 (npm terbaru, rilis 2026-09-06).
> Jawab langsung di bawah tiap pertanyaan.

## 1. Fakta baru (belum ada di pendalaman pertama)

| # | Fakta | Bukti di kode page-agent | Dampak |
|---|---|---|---|
| F1 | Elemen bertanda `data-page-agent-ignore="true"` (atau `aria-hidden="true"`) **beserta seluruh isinya** tidak ikut dikirim ke LLM | `page-controller/src/dom/dom_tree/index.js` ±baris 1489–1497 | Masalah nama warga (#16) bisa ditangani **per komponen** (tandai daftar pengaduan), tidak perlu menebak pola teks. Tapi sifatnya **daftar larangan**: komponen baru yang lupa ditandai otomatis bocor. B memakai **daftar izin** (hanya data dari tool yang sudah disaring) |
| F2 | Kursor page-agent menempel pada **lapisan penutup layar penuh** (`SimulatorMask`) yang **menelan semua klik, gerakan mouse, scroll, dan keyboard** selama agen berjalan | `page-controller/src/mask/SimulatorMask.ts` (listener `click`/`mousedown`/`wheel`/`keydown` → `preventDefault`) | Saat page-agent bekerja, user tidak bisa menyentuh layar, termasuk panel chat. Bentrok dengan keputusan P6 (panel tetap bisa dipakai di desktop) kecuali mode tembus (`PageAgent::EnablePassThrough`) dipakai |
| F3 | Kursor digerakkan lewat event internal `window` (`PageAgent::MovePointerTo`), dan kelas `SimulatorMask` **tidak diekspor** sebagai API publik | `page-controller/src/utils/index.ts:57–72`; `PageController.ts` hanya mengekspor kelas + `actions` | Memakai **hanya kursornya** (opsi hibrida "ambil kursor saja") berarti bergantung pada detail internal yang bisa berubah tanpa pemberitahuan |
| F4 | Tidak ada aksi "tunjuk tanpa klik"; kursor hanya bergerak sebagai bagian dari klik | `page-controller/src/actions.ts:77–78` (`movePointerToElement` lalu `clickPointer`) | Tool `tunjukkan` tetap harus ditulis sendiri (sama seperti B) |
| F5 | Satu tugas = satu loop sampai `done`, maks 40 langkah (bisa diturunkan lewat `maxSteps`); `ask_user` otomatis mati bila tidak disediakan | `core/src/PageAgentCore.ts:111, 231–239, 349` | Biaya bisa dibatasi, tapi tetap >1 panggilan LLM per pertanyaan |
| F6 | Ukuran paket (unpacked): `page-agent` 240 KB, `@page-agent/core` 108 KB, `@page-agent/page-controller` 273 KB, `@page-agent/llms` 52 KB, `@page-agent/ui` 106 KB, `ai-motion` 39 KB, `chalk` 56 KB — semuanya **MIT** | `npm view` 2026-10-01 | Bisa dimuat **lazy** hanya saat fitur dipakai; `zod` harus jadi dependency langsung (sekarang hanya ikut tidak langsung, v4) |
| F7 | Semua panggilan LLM lewat `customFetch` → server dashboard bisa menjadi **gerbang kedua**: cek sesi/izin, hitung kuota per langkah, batasi langkah, bahkan menyaring ulang isi halaman sebelum diteruskan ke proxy | `llms/src/OpenAIClient.ts:76` (`this.fetch(`${baseURL}/chat/completions`)`) | Sebagian keberatan "dua otak" berkurang: kontrol tetap di server, walau loop-nya di browser |

## 2. Apa yang bisa page-agent, tapi tidak bisa B

| Kebutuhan | B | page-agent |
|---|---|---|
| Menunjuk kartu data yang sudah didaftarkan (Keuangan, Beranda, …) | ✅ (perlu `data-ai-target` per kartu) | ✅ |
| Menunjuk **elemen apa pun** tanpa didaftarkan (tombol "Ekspor", menu pengaturan, filter tahun) | ❌ hanya yang ada di registry | ✅ membaca seluruh halaman |
| **Memandu alur beberapa langkah** ("bagaimana cara mengekspor laporan?" → buka menu → tunjuk tombol) | ⚠️ terbatas (tur ditunda, P4) | ✅ alami |
| **Mengisi formulir / menekan tombol** untuk user | ❌ (baca-saja) | ✅ — tapi bertentangan dengan keputusan **baca-saja** |
| Bekerja di halaman yang belum dirapikan (file >1000 baris, tanpa penanda) | ❌ perlu penanda dulu | ✅ |
| Jawaban berangka dari data tersaring (#16) | ✅ dari tool server | ⚠️ dari teks layar (perlu `data-page-agent-ignore`) |
| 1 pertanyaan = 1 kuota | ✅ | ❌ (beberapa langkah) |

**Ringkasnya:** page-agent unggul untuk **"memandu cara memakai aplikasi"** (UI apa pun, tanpa penanda).
B unggul untuk **"menunjukkan asal angka"** (data, aman, murah). Keduanya menjawab kebutuhan yang berbeda.

## 3. Opsi

| Opsi | Isi | Keputusan yang berubah |
|---|---|---|
| **O1. Tetap B** (keputusan sekarang) | Seperti `05`. Gaya kursor/sorotan ditiru (bukan diimpor) | Tidak ada |
| **O2. B + kursor dari page-controller** | B tetap, tapi animasi kursor memakai `@page-agent/page-controller` | Tidak ada keputusan berubah; tambah dependency 273 KB demi kursor, bergantung pada event internal (F3), dan lapisan penutup menelan klik (F2). **Tidak disarankan** — kursor sendiri ±100 baris |
| **O3. B untuk data + page-agent untuk "mode Panduan"** | Pertanyaan data → B (seperti sekarang). Pertanyaan "bagaimana cara…/di mana tombol…" → mode Panduan memakai page-agent: `customFetch` ke endpoint server baru, tool klik/isi/pilih/JS **dihapus**, tool `tunjukkan` sendiri, `maxSteps` kecil (mis. 6), area data warga ditandai `data-page-agent-ignore`, dimuat lazy, slot `pointer` dipakai | #29 (slot pointer jadi dipakai), #31 (tambah mode Panduan), #16 perlu aturan tambahan (penandaan wajib), kuota perlu aturan per langkah/tugas |
| **O4. page-agent penuh menggantikan B** | Semua penunjukan lewat page-agent | #28 (pendekatan), #29, #30, #31, kuota, dan #16 (data dari layar). Kehilangan "1 pesan = 1 kuota" dan jaminan daftar-izin |

## 4. Risiko versi

- `customTools`, semua hook siklus hidup, dan `transformPageContent` bertanda `@experimental`.
- Perubahan yang memecah kode di 1.8.0 (toolchain) dan 1.10.0 (siklus hidup agen, `stop()` jadi async).
- Mitigasi bila dipakai: kunci versi persis (`1.12.4`, tanpa `^`), bungkus di satu modul adaptor, test kontrak sendiri, naik versi hanya dengan membaca CHANGELOG.

## 5. Rekomendasi

1. **Versi pertama Fitur 2 tetap B (O1).** Yang sudah diputuskan (#28–34) tidak perlu dibongkar: menunjukkan
   asal angka adalah tugas B, dan B lebih aman serta lebih murah untuk itu.
2. **Kalau kebutuhan "memandu cara memakai aplikasi" memang penting, pilih O3 sebagai tahap terpisah
   setelah B jalan**, dan putuskan berdasarkan **spike** (percobaan terbatas) — bukan berdasarkan dugaan.
3. **O2 dan O4 tidak disarankan.**

Usulan spike (hanya bila user memerintahkan, dan lokasinya dikonfirmasi user):
- Branch `spike/page-agent-guide` di worktree terpisah, **tidak di-merge**. `page-agent@1.12.4` + `zod` (dependency langsung).
- Uji di 2 halaman (Keuangan + Bantuan) dengan konfigurasi O3 (tool aksi dihapus, `maxSteps` 6, `customFetch` ke endpoint server percobaan).
- Ukur: (a) teks apa saja yang terkirim ke LLM (dicatat server), (b) rata-rata langkah & token per pertanyaan,
  (c) waktu tunggu, (d) ketepatan menunjuk dibanding B pada 10 pertanyaan yang sama.
- Syarat lanjut: tidak ada nama warga di kiriman, rata-rata ≤4 langkah, waktu ≤10 detik.

## 6. Pertanyaan

### Q1. Apa yang ingin dicapai dengan page-agent?
| Pilihan | Artinya |
|---|---|
| a | Menunjukkan asal angka/data (sudah dicakup B) |
| b | **Memandu cara memakai aplikasi** (tombol, menu, alur), di halaman mana pun tanpa penanda |
| c | Kelak AI boleh mengisi formulir / menekan tombol (membuka cakupan tulis) |
| d | Lainnya / berdasarkan pengalaman memakai page-agent (jelaskan) |

Jawaban: **Penunjuk harus bisa menunjuk, pindah halaman, dan KLIK** (user, 2026-10-01 — "sekarang saya putuskan bisa klik").
Ini mengubah keputusan **#31** (`click` "tidak dibuat") dan baris `click` di `05` §4. Apakah juga mengubah
**#3 (baca-saja)** bergantung pada Q1b di bawah.

### Q1b. Klik yang mana?

"Klik" ada dua jenis, dan garis inilah yang menentukan apakah keputusan **baca-saja (#3)** berubah:

| Jenis | Contoh di dashboard | Mengubah data? |
|---|---|---|
| Klik **tampilan** | Pindah tab, pilih tahun/periode, buka detail, buka/tutup bagian, tombol menu | Tidak |
| Klik **tulis** | Simpan pengaturan, kirim undangan, ubah role, hapus API key, jalankan sinkronisasi | **Ya** |

Klik tulis **ada di halaman yang memakai `MainLayout`** (jadi FAB ikut muncul), dicek di kode:
`src/components/pengaturan/akses-dan-tim.tsx`, `akses/UndanganModal.tsx`, `akses/KelolaRoleModal.tsx`,
`pengaturan/sinkronisasi.tsx`, `pengaturan/keamanan.tsx`, `pengaturan/umum.tsx`, `pengaturan/notifikasi.tsx`,
serta `keamanan-page.tsx` dan `sosial-page.tsx` (memanggil POST/PUT/DELETE).

| Pilihan | Perilaku | Keputusan #3 |
|---|---|---|
| **a** | Hanya klik tampilan; tombol tulis tidak bisa diklik AI (AI cukup menunjuk dan berkata "silakan tekan sendiri") | Tetap baca-saja |
| b | Klik tampilan bebas; klik tulis **wajib konfirmasi user** dulu ("Jenna ingin menekan 'Kirim undangan'. Izinkan?") | Berubah: tulis dengan konfirmasi |
| c | Semua klik tanpa konfirmasi | Berubah total — **tidak disarankan** |

**Saran: a** untuk versi pertama, **b** sebagai tahap berikutnya (pola blueprint Lampiran A.4 no. 3: konfirmasi aksi berisiko).
Cara menjaganya harus **daftar izin**, bukan daftar larangan: hanya elemen bertanda "boleh diklik AI"
(mis. `data-ai-click="view"`) yang bisa diklik, supaya tombol tulis baru tidak otomatis ikut terbuka.

Jawaban: **a** (user, 2026-10-01). AI hanya boleh **klik tampilan**; tombol tulis cukup ditunjuk + "silakan tekan sendiri".
Keputusan **#3 baca-saja tetap**. Penjagaan memakai **daftar izin** (elemen bertanda boleh-diklik), bukan daftar larangan.
Klik tulis dengan konfirmasi (pilihan b) dicatat sebagai tahap berikutnya.

### Q2 (diperbarui setelah Q1 & Q1b). Pendekatan untuk tunjuk + pindah halaman + klik tampilan

Temuan penting: karena klik dijaga **daftar izin**, elemen yang boleh diklik **tetap harus ditandai**, apa pun
pendekatannya. Artinya keunggulan utama page-agent ("tanpa penanda") **hilang untuk klik**; yang tersisa
hanya untuk *membaca* dan *menunjuk* elemen tak bertanda — dan justru bagian membaca itulah yang bentrok
dengan #16 (teks layar) dan kuota per pesan.

Contoh nyata di halaman percontohan: pemilih tahun di Keuangan adalah Mantine `Select`
(`src/components/keuangan-anggaran.tsx` ±baris 100–108). Memilih "2025" = buka dropdown lalu klik opsi di
portal — dua langkah UI.

| | **B diperluas** | O3: page-agent ("mode Panduan") |
|---|---|---|
| Cara klik | Tool server `klik_elemen(target)` / `pilih(target, nilai)` hanya untuk target terdaftar berjenis tampilan; browser menggerakkan kursor lalu menjalankan klik/pemilihan | `click_element_by_index` ditimpa: hanya boleh bila elemen (atau induknya) bertanda boleh-diklik |
| Pemilih tahun (`Select`) | Satu aksi `pilih("keuangan.tahun", "2025")`; browser yang membuka dropdown & memilih opsi (nilai divalidasi dari data) | AI harus menebak 2 langkah (buka → klik opsi); opsi di portal juga harus ditandai |
| Penanda elemen | Wajib (tunjuk + klik) | Wajib untuk klik; tunjuk bisa tanpa penanda |
| Data yang dilihat AI | Hanya hasil tool tersaring (#16 aman) | Teks layar, perlu `data-page-agent-ignore` (daftar larangan) |
| Kuota | 1 pesan = 1 kuota | Beberapa langkah per pesan |
| Layar saat bekerja | Tetap bisa dipakai | Terkunci lapisan penutup (F2) kecuali mode tembus |
| Dependency / risiko versi | Tidak ada | `page-agent` + `zod`, API `@experimental` |

**Saran: B diperluas.** Keputusan #28–30 dan #32–34 tetap; #31 menjadi `navigate` + `pointTo` + `click`/`pilih`
(hanya target tampilan terdaftar). page-agent tetap dicatat untuk kelak bila klik tulis dengan konfirmasi dibuka
dan butuh menjangkau elemen tak bertanda.

Jawaban: **B diperluas** (user, 2026-10-02 — dicatat sesi induk 0d). Tool `klik_elemen(target)` / `pilih(target, nilai)` hanya untuk target tampilan terdaftar; satu otak, data tersaring, 1 pesan = 1 kuota. page-agent tetap dicatat untuk kelak (klik tulis dengan konfirmasi yang perlu menjangkau elemen tak bertanda).

### Q2. Opsi yang dipilih (O1 / O2 / O3 / O4)?
**Saran:** O1 untuk versi pertama; O3 sebagai tahap lanjutan bila Q1 = b, lewat spike dulu.

Jawaban: **O1 → B diperluas** (user, 2026-10-02). O3/O4 tidak dipakai sekarang.

### Q3. (Hanya bila O3/O4) Jalankan spike?
Butuh perintah user + konfirmasi lokasi (worktree/branch). Dependency baru: `page-agent@1.12.4` (MIT) + `zod` (MIT).
Alternatif yang sudah dipertimbangkan: tanpa dependency (B murni); hanya `@page-agent/page-controller` (O2, tidak disarankan).

Jawaban: **Tidak perlu spike** — B diperluas dipilih (user, 2026-10-02). Sebelumnya user sempat condong ke page-agent (2026-10-01).

### Kasus nyata: "Siapa divisi teraktif?" — user tidak tahu letak tampilannya

Fakta kode: kartu **"Divisi Teraktif"** ada di `/kinerja-divisi` (`src/components/kinerja-divisi/division-list.tsx`,
data `GET /api/noc/active-divisions` → `name` + `activityCount`). Beranda juga punya widget progres divisi
(`src/components/dashboard/division-progress.tsx`).

**Pendekatan B (diperluas):**
1. AI memanggil tool data `kinerja_divisi` (tool MVP Fitur 1) → menjawab "Divisi X, N kegiatan" **di halaman mana pun**.
2. AI tahu letaknya karena **peta** (registry) mencatat `divisi.teraktif` → `/kinerja-divisi`. Bila user bertanya
   "di mana?"/"tunjukkan", atau mengklik label "Sumber: Kinerja Divisi", dashboard pindah halaman lalu menunjuk kartunya.
3. 1 pertanyaan = 1 kuota. Catatan: halaman Kinerja Divisi **belum** termasuk percontohan (P5: Keuangan → Beranda),
   jadi penunjukannya baru jalan setelah halaman itu ditandai.

**page-agent:**
1. AI hanya melihat halaman saat ini (mis. Beranda) + menu samping. Ia menebak dari teks menu "Kinerja Divisi" → klik
   menu (menu samping harus bertanda boleh-diklik) → halaman baru → membaca daftar "Divisi Teraktif" → menjawab & menunjuk.
2. Perkiraan 3–4 langkah AI. Angka dibaca dari layar, bukan dari tool.
3. Risiko: daftar masih memuat (skeleton 5 baris) saat dibaca → perlu `wait`; label yang kurang jelas di halaman lain
   bisa membuat AI salah menebak.

**Kesimpulan kasus:** keduanya bisa menjawab. Bedanya: B memakai **peta yang dibuat di depan** (9 menu, terbatas);
page-agent **menjelajah seperti user baru** setiap kali bertanya.
