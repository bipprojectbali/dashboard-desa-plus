# PEKERJAAN_QC.md — Panduan QC Profesional untuk Dashboard Desa Plus

> Dokumen ini disusun untuk QC yang bertugas melakukan **analisa menyeluruh berbasis browser (Chrome)** terhadap project **Dashboard Desa Plus (NOC)** — mencakup kriteria uji, jenis bug, dan langkah kerja sistematis agar hasil QC rapi, reproducible, dan actionable bagi tim dev.
>
> Referensi silang: [`PM-TASKS-QC-2026-09-24.md`](./PM-TASKS-QC-2026-09-24.md) (contoh QC berbasis pembacaan kode — dokumen ini melengkapinya dengan QC berbasis **browser/visual**), [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md), [`docs/DATABASE.md`](./docs/DATABASE.md).

---

## 1. Tujuan & Ruang Lingkup

QC dilakukan dengan cara **membuka aplikasi langsung di Chrome**, menavigasi seluruh halaman, dan mencatat setiap penyimpangan dari perilaku yang diharapkan — baik dari sisi visual, fungsional, maupun teknis (console/network). Tools rekomendasi: skill **`ego-browser`** (Chromium dengan kemampuan screenshot, klik, isi form, baca console/network) — pakai ini sebagai driver utama, bukan hanya "melihat" manual.

**Cakupan aplikasi** (dari `src/routes/*`):

| Area | Route | Fokus QC |
|---|---|---|
| Beranda | `/` | Chart APBDes, statistik surat, kepuasan layanan, SDGs |
| Kinerja Divisi | `/kinerja-divisi` | Divisi teraktif, dokumen, progress aktivitas |
| Layanan Publik | `/pengaduan-layanan-publik` | Tren pengaduan, surat terbanyak, pengajuan terbaru |
| Demografi & Kependudukan | `/demografi-pekerjaan` | Pengelompokan umur, pekerjaan, sektor unggulan |
| Keuangan & Anggaran | `/keuangan-anggaran` | Alokasi anggaran, realisasi APBDes |
| BUMDes & UMKM | `/bumdes` | Tabel penjualan produk, modal detail |
| Sosial & Kesejahteraan | `/sosial` | — |
| Keamanan | `/keamanan` | — |
| Jenna Analytic | `/jenna-analytic` | Interaksi chatbot, jam tersibuk |
| Bantuan | `/bantuan` | FAQ |
| Admin | `/admin/*` | Users, roles, API key, audit log, system health, settings |
| Pengaturan | `/pengaturan/*` | Umum, keamanan, notifikasi, akses & tim, sinkronisasi |
| Profile | `/profile/*` | Edit profile |
| Auth | `/signin`, `/signup` | Login/register flow |
| Users | `/users`, `/users/$id` | Detail user |
| NOC Video Wall | `/wall` | Kiosk display (layout builder drag-and-drop) |

**Matriks lingkungan minimal:**
- **Browser:** Chrome desktop (utama, via `ego-browser`), plus verifikasi silang di Safari untuk bug yang diketahui browser-specific (lihat §5.5).
- **Viewport:** Desktop (≥1440px), Laptop (1280px), Tablet (768px), Mobile (375px).
- **Tema:** Light mode & Dark mode (project ini eksplisit punya bug dark-mode sebelumnya, lihat `d15ce48`).
- **Role:** minimal 2 role (admin & non-admin) jika `RolePermission` membatasi akses menu.
- **Environment:** Staging (`https://dashboard-desa-plus-stg.wibudev.com`) sebagai target utama QC (bukan localhost) agar konsisten dengan data & deployment nyata.

---

## 2. Kriteria QC (Acceptance Criteria per Kategori)

Gunakan kriteria berikut sebagai checklist "PASS/FAIL" per halaman — bukan sekadar opini "kelihatan oke":

### 2.1 Visual / Layout
- [ ] Tidak ada elemen teks terpotong (truncated tanpa ellipsis, overflow tersembunyi tanpa indikasi).
- [ ] Label sumbu chart (X/Y axis) terbaca penuh atau di-truncate dengan `...` + tooltip lengkap on-hover.
- [ ] Tidak ada whitespace kosong tidak wajar di card/grid (mis. card sejajar dengan tinggi berbeda karena content pendek — lihat pola di `kinerja-divisi.tsx` grid 3-kolom).
- [ ] Padding/margin konsisten antar card sejenis di halaman yang sama.
- [ ] Tidak ada elemen overlap/tumpang tindih (terutama tooltip, dropdown, modal terhadap elemen lain).
- [ ] Semua gambar/asset ter-render (bandingkan Beranda SDGs — cek `<img>` tag & Network tab untuk request gagal/blocked).
- [ ] Responsive: layout tidak pecah di breakpoint tablet/mobile (grid Mantine `Grid.Col span` harus punya breakpoint yang wajar).

### 2.2 Data & Informasi
- [ ] Setiap chart (Bar/Line/Pie/Donut) yang menampilkan data kuantitatif punya **data label** (angka/persentase) — bukan hanya mengandalkan tooltip on-hover (banyak temuan di `PM-TASKS-QC-2026-09-24.md` soal ini).
- [ ] Progress bar (Mantine `<Progress>`) menampilkan angka % sebagai teks, bukan hanya visual bar.
- [ ] Legend chart menyertakan nilai/persentase, bukan hanya warna+nama (lihat kasus `SatisfactionChart` yang legend-nya polos).
- [ ] **No hardcoded mock data** — sesuai konvensi CLAUDE.md, pastikan tidak ada angka dummy tersisa; state kosong harus tampil sebagai empty state/0, bukan data placeholder.
- [ ] Format angka (ribuan, rupiah, persen, tanggal) konsisten locale Indonesia di seluruh halaman.
- [ ] Data yang tampil di UI match dengan response API (bandingkan Network tab response vs render — terutama setelah transformasi seperti di `apbdes-transform`, `beranda-kpi`, `build-kpi`).

### 2.3 Warna & Tema (Light/Dark Mode)
- [ ] Toggle dark mode tidak meninggalkan warna hardcoded dari light mode (bug konkret pernah terjadi: `chart-apbdes.tsx` background hijau hardcode di dark mode meski status "merah").
- [ ] Warna status (merah=bahaya, hijau=aman, kuning=warning) konsisten dengan makna semantiknya di kedua tema.
- [ ] Kontras teks vs background memenuhi keterbacaan minimal (terutama di dark mode — teks abu gelap di atas card gelap sering jadi masalah).
- [ ] Icon alert/status sesuai kondisi data (bukan generic arrow jika seharusnya warning icon — lihat task #11 di `PM-TASKS-QC-2026-09-24.md`).

### 2.4 Fungsional / Interaksi
- [ ] Semua tombol, link, dan form dapat diklik dan memicu aksi yang benar (mis. tombol "Detail" di `sales-table.tsx` membuka `SalesDetailModal` dengan data produk yang sesuai baris yang diklik).
- [ ] Modal/dialog terbuka & tertutup dengan benar (ESC, klik luar, tombol close), tidak ada modal "nyangkut" atau backdrop tanpa modal.
- [ ] Form validation menampilkan pesan error yang jelas & sesuai bahasa (locale `id.ts`).
- [ ] Filter, sort, pagination di tabel bekerja dan hasilnya benar (cek terutama tabel besar: users, audit-log, activity-log).
- [ ] Drag-and-drop di `/wall` (layout builder, pakai `@dnd-kit`) — item bisa dipindah, resize, tidak ada state yang hilang setelah drop.
- [ ] Auth flow: signup → signin → session persist → logout, termasuk OAuth (GitHub/Google) jika dikonfigurasi di staging.
- [ ] Role-based access: user non-admin tidak bisa akses `/admin/*` (redirect atau 403 yang jelas, bukan halaman blank/crash).
- [ ] Sinkronisasi manual (`/pengaturan/sinkronisasi`) memberi feedback loading/success/error yang jelas.

### 2.5 Teknis (Console & Network)
- [ ] **Zero JS error** di Console saat navigasi normal (buka DevTools Console tiap halaman).
- [ ] Tidak ada **React key warning**, **hydration mismatch**, atau **act() warning** yang muncul berulang.
- [ ] Tidak ada request API yang gagal (4xx/5xx) tanpa penanganan UI (harus ada error state, bukan silent fail / infinite spinner).
- [ ] Request API tidak ganda tak perlu (cek TanStack Query devtools/Network — refetch berulang tanpa alasan bisa indikasi cache key salah).
- [ ] Waktu load halaman wajar (< 3 detik untuk First Contentful Paint di koneksi normal); chart-heavy page (Beranda, Kinerja Divisi) tidak nge-freeze UI thread.
- [ ] CORS: request ke `VITE_DESA_API_URL` (frontend langsung) tidak diblokir; gambar/asset eksternal (`desa-darmasaba-stg.wibudev.com/api/img/*`) ter-load tanpa error CORS/mixed-content.
- [ ] Tidak ada asset 404 (favicon, font, image).

### 2.6 Aksesibilitas dasar
- [ ] Semua image punya `alt` text yang bermakna.
- [ ] Elemen interaktif (button, link) bisa diakses via keyboard (Tab, Enter).
- [ ] Kontras warna teks minimal WCAG AA untuk teks penting (bukan hanya dekoratif).
- [ ] Focus state terlihat (tidak `outline: none` tanpa pengganti).

### 2.7 Cross-browser (khusus temuan historis project ini)
- [ ] Bandingkan rendering SVG chart (Recharts) Chrome vs Safari — Safari **clip** teks overflow pada `<text>` SVG lebih ketat daripada Chrome (pola bug berulang di project ini, lihat task #2 & #4 di `PM-TASKS-QC-2026-09-24.md`).
- [ ] WebP image rendering di Safari (kasus SDGs image, task #12) — cek apakah format WebP yang di-generate backend kompatibel.
- [ ] Flexbox/Grid gap behavior — versi Safari lama punya bug gap di flexbox.

---

## 3. Jenis Bug & Klasifikasi Severity

Gunakan taksonomi ini agar laporan QC konsisten dan mudah diprioritaskan oleh PM/dev:

### 3.1 Berdasarkan Jenis
| Jenis | Contoh Konkret di Project Ini |
|---|---|
| **Visual/UI** | Label chart terpotong (`demografi-pekerjaan.tsx` YAxis width 90px), whitespace kosong di card grid |
| **Data Integrity** | Data label hilang (LabelList tidak ada), angka tidak sinkron dengan API response |
| **Cross-browser** | Safari clip teks SVG, WebP tidak render di Safari |
| **Dark Mode / Theming** | Hardcoded color mengabaikan status semantik (`chart-apbdes.tsx` background hijau di dark mode) |
| **Functional** | Tombol/modal tidak trigger aksi yang benar, drag-and-drop `/wall` gagal |
| **Performance** | Chart re-render berlebihan, request API duplikat, TTFB lambat di staging |
| **Console Error** | Unhandled exception, React warning, uncaught promise rejection |
| **Network/API** | 4xx/5xx tanpa error state UI, CORS blocked, response shape tidak sesuai type `generated/api.ts` |
| **Auth/Security** | Role bypass (non-admin akses `/admin`), session tidak invalidate setelah logout |
| **Accessibility** | Missing alt text, kontras rendah, tidak keyboard-navigable |
| **Responsive** | Layout pecah di breakpoint tertentu |
| **Copy/Locale** | Teks salah ketik, key locale hilang (fallback ke key mentah), bahasa campur ID/EN |
| **Product/UX (bukan bug teknis)** | Fitur ada tapi dipertanyakan kegunaannya (mis. task #1 kolom Aksi di Bumdes) — catat sebagai **saran**, bukan bug |

### 3.2 Berdasarkan Severity (untuk prioritas)
| Level | Kriteria | Contoh |
|---|---|---|
| **Blocker** | Aplikasi tidak bisa dipakai / crash / data salah total | Halaman blank karena unhandled error, login gagal total |
| **Critical** | Fitur inti tidak berfungsi, data salah signifikan | Chart menampilkan angka salah, form submit gagal tanpa error message |
| **Major** | Mengganggu pengalaman, tapi ada workaround | Label terpotong parah, dark mode bug warna |
| **Minor** | Kosmetik, tidak mengganggu fungsi | Padding sedikit tidak rapi, spasi inkonsisten |
| **Trivial/Enhancement** | Saran perbaikan, bukan bug | Usulan hapus kolom yang dianggap tidak perlu |

### 3.3 Verdict QC (pakai standar yang sudah ada di project)
Ikuti legenda yang sudah dipakai di `PM-TASKS-QC-2026-09-24.md` agar konsisten lintas dokumen QC:
- ✅ **VALID** — bug/isu terkonfirmasi reproducible.
- ⚠️ **PARSIAL** — sebagian benar, perlu klarifikasi/scope ulang.
- ❓ **PERLU VERIFIKASI VISUAL** — tidak bisa dipastikan dari kode/screenshot tunggal, butuh reproduksi manual (mis. lintas browser, lintas device).

---

## 4. Langkah Kerja QC (Workflow Sistematis)

### Fase 1 — Persiapan
1. Konfirmasi environment target (staging URL, kredensial test akun admin & non-admin).
2. Siapkan `ego-browser` (skill), buka DevTools (Console + Network tab) sejak awal sesi.
3. Siapkan template laporan bug (lihat §6) dan spreadsheet/tracker untuk mencatat temuan secara real-time — jangan andalkan ingatan di akhir sesi.
4. Baca ulang task/requirement asal (PM Dashboard/`.env.pm` jika ada task spesifik yang di-assign) agar QC punya baseline "apa yang diharapkan", bukan menebak-nebak.

### Fase 2 — Smoke Test (cepat, seluruh aplikasi)
1. Buka setiap route di §1 satu per satu, screenshot tiap halaman (light & dark mode).
2. Catat error Console/Network yang muncul otomatis saat load — ini baseline murah sebelum masuk ke uji detail.
3. Pastikan navigasi menu utama (sidebar/navbar) tidak ada link mati (404).

### Fase 3 — Deep Dive per Halaman (ikuti kriteria §2)
Untuk **setiap halaman**, lakukan urutan ini:
1. **Visual pass**: screenshot full-page, zoom ke area chart/tabel, bandingkan dengan kriteria §2.1–2.3.
2. **Interaksi pass**: klik semua tombol/link/filter, isi form dengan data valid & invalid, uji modal, uji pagination.
3. **Data pass**: bandingkan angka yang tampil dengan response API mentah (buka Network tab, cari endpoint terkait, cocokkan angka).
4. **Resize pass**: ubah viewport ke breakpoint tablet/mobile, ulangi visual pass singkat.
5. **Theme pass**: toggle dark mode, ulangi visual pass singkat khusus warna.
6. Catat setiap penyimpangan langsung ke tracker dengan format §6 — jangan menunda pencatatan ke akhir.

### Fase 4 — Targeted Test (area berisiko tinggi)
Fokuskan waktu ekstra ke area yang secara historis rawan bug di project ini:
- Semua **chart Recharts** (Bar/Line/Pie) — cek data label & axis truncation di **setiap** chart, bukan hanya yang sudah dilaporkan.
- **Dark mode** di semua komponen yang punya warna kondisional/status (bukan cuma APBDes).
- **Grid layout 3-kolom** dengan card tinggi campuran (kinerja-divisi, pengaduan) — cek whitespace di berbagai kombinasi jumlah data (0 item, 1 item, 5+ item).
- **`/wall`** — kiosk display, uji drag-drop layout builder dan juga tampilan kiosk mode itu sendiri (auto-refresh, token akses).
- **Auth & role-gating** — coba akses langsung via URL halaman admin sebagai user non-admin.
- **External API dependency** — apa yang terjadi di UI kalau Desa API/NOC API/Platform API lambat atau down (loading state, error state, bukan crash).

### Fase 5 — Cross-browser Verifikasi (Safari)
Karena project ini punya riwayat bug spesifik Safari (task QC 24 Sep 2026), untuk **setiap temuan chart/layout** yang valid di Chrome, ulangi cek cepat di Safari real (bukan asumsi) sebelum menutup sebagai "cross-browser confirmed" — terutama:
- SVG text clipping pada axis chart.
- WebP image rendering (Beranda SDGs).
- Flexbox/grid gap rendering.

### Fase 6 — Regresi & Duplikasi
1. Cek apakah temuan baru adalah duplikat dari bug yang sudah pernah dilaporkan/ditutup (lihat riwayat `PM-TASKS-QC-2026-09-24.md` & `PM-TASKS-FIX-PLAN-2026-09-24.md`, dan commit log seperti `d15ce48`).
2. Jika ada fix baru yang sudah masuk (`git log`), lakukan regression test khusus untuk memastikan fix tidak memunculkan bug baru di area sekitarnya.

### Fase 7 — Pelaporan & Verifikasi Ulang
1. Susun laporan akhir memakai format §6, dikelompokkan per halaman/fitur, diurutkan severity.
2. Sertakan ringkasan tabel (seperti "Ringkasan QC" di `PM-TASKS-QC-2026-09-24.md`) agar PM cepat mengambil keputusan.
3. Setelah dev fix, lakukan **retest** khusus item yang dilaporkan (bukan smoke test ulang seluruh app, kecuali fix berdampak luas).

---

## 5. Checklist Praktis Saat Menggunakan Chrome/`ego-browser`

1. **Selalu buka DevTools Console & Network sebelum interaksi** — banyak error hanya muncul sekali saat mount komponen.
2. **Gunakan throttling network** (Slow 3G/Fast 3G) sesekali untuk menguji loading state & skeleton, bukan hanya kondisi ideal.
3. **Screenshot sebagai bukti wajib** untuk setiap bug visual — sertakan di laporan, jangan hanya deskripsi teks.
4. **Reproduce minimal 2x** sebelum melaporkan sebagai bug (hindari false positive dari flakiness/network sesaat).
5. **Cek elemen via Inspect** untuk bug layout — ambil computed style (width, overflow, z-index) sebagai bukti teknis, bukan cuma dugaan (lihat gaya analisis di `PM-TASKS-QC-2026-09-24.md` yang selalu sertakan baris kode & root cause).
6. **Test data edge case**: dataset kosong, dataset 1 item, dataset sangat banyak (>50 baris tabel), angka sangat besar (overflow format currency), nama sangat panjang (overflow label).
7. **Jangan hanya uji "happy path"** — coba input invalid di form, klik cepat berulang (double submit), navigasi back/forward browser saat modal terbuka.
8. **Uji ulang setelah refresh (hard reload)** untuk menangkap bug hydration/caching yang tidak muncul di SPA navigation biasa.

---

## 6. Template Laporan Bug (wajib per temuan)

```markdown
### [SEVERITY] Judul singkat bug

- **Halaman/Route:** /path
- **Komponen (jika diketahui):** src/components/.../file.tsx (baris jika ada)
- **Browser/Viewport:** Chrome 1440px / Safari 375px / dst.
- **Tema:** Light / Dark
- **Langkah reproduksi:**
  1. ...
  2. ...
- **Hasil aktual:** ...
- **Hasil diharapkan:** ...
- **Screenshot/Video:** (lampirkan)
- **Console/Network error (jika ada):** ...
- **Jenis bug:** (lihat §3.1)
- **Verdict:** ✅ VALID / ⚠️ PARSIAL / ❓ PERLU VERIFIKASI VISUAL
- **Catatan tambahan:** (mis. duplikat dengan task #X, kemungkinan root cause)
```

---

## 7. Kriteria "Kualitas QC yang Baik" (Definition of Done untuk pekerjaan QC-mu sendiri)

QC dianggap **selesai dengan kualitas baik** jika memenuhi semua ini — bukan hanya "sudah klik-klik semua halaman":

1. **Cakupan lengkap** — semua route di §1 sudah diuji di minimal 1 breakpoint desktop + 1 breakpoint mobile, light & dark mode.
2. **Setiap temuan reproducible** — punya langkah reproduksi jelas, bukan "kadang muncul, kadang tidak" tanpa penjelasan kondisi.
3. **Setiap temuan punya bukti** — screenshot/console log/network log, bukan deskripsi subjektif semata.
4. **Root cause disebutkan jika memungkinkan** — idealnya menunjuk file/baris kode seperti gaya `PM-TASKS-QC-2026-09-24.md`, bukan cuma "chart-nya aneh".
5. **Tidak ada duplikasi tak tercatat** — temuan yang sama dari beberapa halaman dikelompokkan/ditandai silang-referensi.
6. **Prioritas jelas** — setiap temuan punya severity (§3.2) agar PM bisa langsung urutkan pekerjaan dev.
7. **Membedakan bug vs saran produk** — jangan campur "ini rusak" dengan "menurutku sebaiknya begini" (lihat contoh task #1 Bumdes yang dikategorikan sebagai keputusan produk, bukan bug).
8. **False positive minimal** — sudah dicoba reproduksi ulang, sudah dicek apakah memang bug atau ekspektasi yang salah.
9. **Actionable** — laporan bisa langsung dikerjakan dev tanpa perlu bolak-balik bertanya "maksudnya di halaman mana / kondisi apa".
10. **Regresi tercatat** — setelah fix, ada catatan retest (pass/fail) bukan asumsi "harusnya sudah beres".

---

## 8. Referensi Internal

- [`PM-TASKS-QC-2026-09-24.md`](./PM-TASKS-QC-2026-09-24.md) — contoh nyata QC berbasis kode untuk 12 bug Safari.
- [`PM-TASKS-FIX-PLAN-2026-09-24.md`](./PM-TASKS-FIX-PLAN-2026-09-24.md) — rencana fix dari hasil QC di atas.
- Commit `d15ce48` — contoh implementasi fix nyata (data label, Y-axis, progress %, dark mode) yang bisa dipakai sebagai referensi pola bug berulang.
- `CLAUDE.md` — konvensi project (no hardcoded mock data, path alias, styling Mantine+Tailwind, dll.) yang jadi acuan "seharusnya seperti apa" saat QC menilai kesesuaian kode dengan standar project.
- `tests/api/*.test.ts` — jalankan (`bun run test`) sebagai baseline sebelum QC manual, supaya tidak menghabiskan waktu menemukan ulang bug yang sudah tercakup automated test.
