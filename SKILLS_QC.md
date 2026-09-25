# SKILLS_QC.md — Spesifikasi Skill "qc-agent" (QC Otomatis Berbasis Browser)

> Dokumen ini adalah **spesifikasi desain** untuk skill Claude Code bernama **`qc-agent`** — agent yang melakukan QC selayaknya seorang QC profesional manusia, tapi dijalankan otomatis lewat browser sungguhan (`ego-browser`, Chromium). Skill operasionalnya (yang benar-benar dipanggil Claude Code) ada di [`.claude/skills/qc-agent/SKILL.md`](.claude/skills/qc-agent/SKILL.md). Dokumen ini menjelaskan **kenapa** skill itu didesain begitu, kriteria tambahan yang dipakai, dan bagaimana cara memperluasnya.
>
> Prasyarat baca: [`PEKERJAAN_QC.md`](./PEKERJAAN_QC.md) (kriteria & workflow manual manusia — skill ini adalah versi otomatisnya), [`.claude/skills/ego-browser`](.claude/skills/ego-browser) (kapabilitas browser tool).

---

## 1. Prinsip Desain

Skill QC agent dibangun di atas 5 prinsip:

1. **Meniru manusia, bukan sekadar assert.** QC manusia tidak cuma `expect(x).toBe(y)` — dia melihat, membandingkan dengan ekspektasi, curiga terhadap hal yang "terasa aneh", dan mendokumentasikan bukti. Skill ini harus **screenshot + reasoning tertulis** di setiap temuan, bukan cuma pass/fail biner.
2. **Deterministik di alur, fleksibel di observasi.** Rute/halaman yang dikunjungi, urutan fase, dan checklist adalah **tetap** (agar hasil QC dari run ke run bisa dibandingkan) — tapi isi temuan bebas (agent boleh menemukan bug yang tidak ada di checklist).
3. **Read-only secara default, tulis butuh izin eksplisit.** QC hanya mengamati. Aksi yang mengubah data (submit form nyata, delete, signup akun sungguhan) harus dihindari kecuali eksplisit diminta user — sesuai prinsip "aksi yang sulit dibalik harus dikonfirmasi" dari system prompt.
4. **Bukti dulu, klaim kemudian.** Setiap temuan wajib punya: screenshot, dan jika relevan console/network log mentah. Tidak boleh ada baris laporan "kelihatannya salah" tanpa lampiran.
5. **Sadar histori project.** Project ini sudah punya riwayat bug nyata (Safari clipping, dark-mode hardcoded color, dsb — lihat `PM-TASKS-QC-2026-09-24.md` & commit `d15ce48`). Skill ini harus **cek regresi** ke temuan lama sebagai bagian dari checklist, bukan hanya mencari yang baru.

---

## 2. Kapan Skill Ini Dipakai (Trigger)

Skill diaktifkan saat user meminta hal-hal seperti:
- "jalankan QC pakai browser / ego-browser"
- "cek semua halaman, cari bug"
- "audit UI/UX dashboard"
- "test end-to-end pakai browser sungguhan"
- "review kualitas sebelum deploy ke stg/prod"
- Setelah PR besar/fix visual (mis. commit `d15ce48`) — untuk verifikasi regresi.

**Tidak dipakai** untuk: unit/API test (pakai `bun run verify`), review kode statis (pakai `/code-review`), atau verifikasi 1 fix spesifik yang kecil (pakai skill `verify` yang lebih ringan).

---

## 3. Input yang Dibutuhkan Sebelum Jalan

Skill **wajib konfirmasi** hal berikut ke user sebelum mulai (via `AskUserQuestion` jika ambigu), karena ini menentukan blast radius:

| Input | Default | Kapan harus tanya user |
|---|---|---|
| **Target environment** | Staging (`https://dashboard-desa-plus-stg.wibudev.com`) | Jika user tidak sebut env, **default ke staging**, JANGAN pernah default ke production tanpa diminta eksplisit |
| **Kredensial login** | `ADMIN_EMAIL`/`ADMIN_PASSWORD` dari `.env` lokal (fallback seed default `admin@example.com` / `admin123`) | Jika env var tidak ada dan staging punya kredensial berbeda dari default seed, tanya user |
| **Cakupan** | Semua route (full sweep) | Jika user minta "cek halaman X saja", persempit — jangan sweep semua kalau diminta spesifik |
| **Role QC** | Admin (akses penuh termasuk `/admin/*`) | Tanya jika user juga mau QC role non-admin (perlu akun kedua) |
| **Tema** | Light + Dark keduanya | — |
| **Viewport** | Desktop (1440px) + Mobile (375px) minimal | User boleh minta breakpoint tambahan |

---

## 4. Fase Eksekusi (mapping dari `PEKERJAAN_QC.md` §4 ke langkah agent)

| Fase manusia (`PEKERJAAN_QC.md`) | Realisasi agent |
|---|---|
| Fase 1 — Persiapan | Baca env, konfirmasi input (§3 di atas), siapkan folder output `qc-reports/<timestamp>/` |
| Fase 2 — Smoke test | Loop semua route, 1 viewport, 1 tema, screenshot + tangkap console/network error saja (murah, cepat, dulu duan) |
| Fase 3 — Deep dive per halaman | Loop ulang per route: viewport & tema matrix penuh, jalankan checklist visual/data/fungsional (§2 `PEKERJAAN_QC.md`), interaksi (klik tombol/filter/modal) |
| Fase 4 — Targeted test | Fokus ke chart (Recharts), grid card whitespace, dark-mode, `/wall` drag-drop, role-gating |
| Fase 5 — Cross-browser Safari | **Di luar cakupan `ego-browser`** (Chromium-only) — agent HARUS menandai temuan chart/CSS-rendering sebagai "perlu verifikasi manual Safari" di laporan, bukan mengklaim sudah teruji Safari |
| Fase 6 — Regresi & duplikasi | Cocokkan temuan baru vs `PM-TASKS-QC-2026-09-24.md` + `git log` fix terakhir sebelum lapor sebagai "baru" |
| Fase 7 — Pelaporan | Compile ke `qc-reports/<timestamp>/REPORT.md` pakai template §6 `PEKERJAAN_QC.md` |

---

## 5. Kriteria Tambahan (di luar `PEKERJAAN_QC.md`) untuk Siap Produksi

`PEKERJAAN_QC.md` sudah mencakup visual/data/tema/fungsional/teknis/aksesibilitas/cross-browser. Untuk skill **agent otomatis** yang jalan berulang (mis. tiap sebelum deploy), tambahan berikut relevan supaya kualitasnya lebih matang dan "siap produksi":

### 5.1 Keamanan permukaan (surface-level, bukan pentest)
- [ ] Tidak ada secret/token bocor di response API/HTML/JS bundle yang bisa diakses browser (cek `PLATFORM_API_TOKEN`, `NOC_API_KEY`, `WALL_ACCESS_TOKEN` — hanya var berprefix `VITE_*` yang boleh muncul di client bundle; scan `page.evaluate(() => document.documentElement.outerHTML)` dan response `/api/*` untuk pola token/bearer).
- [ ] Route admin-only (`/admin/*`, `/pengaturan/akses-dan-tim` — lihat `src/middleware/authMiddleware.tsx`) benar-benar redirect saat diakses user non-admin, bukan hanya UI yang disembunyikan tapi datanya tetap ke-fetch.
- [ ] Setelah logout, halaman yang butuh auth tidak bisa diakses via tombol "back" browser (cek bfcache issue).
- [ ] Cookie/session tidak `Secure: false` di staging HTTPS (cek via `page.cdp("Network.getCookies")`).

### 5.2 Resiliency & error states
- [ ] Matikan/lambatkan network (CDP `Network.emulateNetworkConditions`) lalu load halaman berat chart (Beranda, Kinerja Divisi) — pastikan ada skeleton/loading state, bukan layout kosong lalu "jump" mendadak (CLS tinggi).
- [ ] Simulasikan API eksternal gagal (401/500) — apakah UI menunjukkan pesan error yang manusiawi (bukan halaman putih / stack trace bocor ke user)?
- [ ] Halaman 404 (route tidak ada) menampilkan halaman error yang proper, bukan blank/crash React.
- [ ] Error boundary React tidak membocorkan stack trace ke end user di production build.

### 5.3 Performa dasar (budget, bukan profiling mendalam)
- [ ] First Contentful Paint halaman berat (Beranda) di bawah ambang wajar (`page.cdp("Performance.getMetrics")` atau Navigation Timing via `page.evaluate`).
- [ ] Tidak ada request API terduplikasi berlebihan di 1 page load (indikasi query key React Query salah) — hitung jumlah request per endpoint dalam 1 navigasi.
- [ ] Chart dengan dataset besar (>50 titik, cek tabel users/audit-log dengan banyak baris) tidak membuat UI freeze >1 detik saat interaksi scroll/filter.

### 5.4 Konsistensi konten & i18n
- [ ] Tidak ada key locale mentah bocor ke UI (pola `kinerjaDivisi.progres` tampil literal alih-alih teks Indonesia — indikasi key hilang di `src/locales/id.ts`).
- [ ] Tidak ada teks campur bahasa Inggris-Indonesia yang tidak konsisten dalam satu halaman (selain istilah teknis yang memang lazim, mis. "Dashboard").
- [ ] Format tanggal/angka/mata uang konsisten Indonesia (`Rp`, titik ribuan, dst.) di semua halaman, bukan hanya beberapa.
- [ ] `<title>` tab browser berubah sesuai halaman aktif (bukan statis "Vite App" atau kosong).

### 5.5 Interaksi lanjutan (yang sering luput dari QC manual cepat)
- [ ] Double-submit guard: klik cepat 2x tombol submit/aksi tidak memicu 2 request/2 efek.
- [ ] Modal/dialog: tombol ESC & klik backdrop benar-benar menutup, focus kembali ke elemen pemicu (focus trap dasar).
- [ ] Navigasi browser back/forward saat modal terbuka tidak meninggalkan modal "nyangkut" di atas halaman lain.
- [ ] Refresh (hard reload) di tengah halaman dengan state kompleks (mis. `/wall` layout builder) tidak kehilangan data yang sudah tersimpan (state persisted vs state in-memory harus jelas bedanya).
- [ ] Drag-and-drop `@dnd-kit` di `/wall`: drop di luar area valid tidak merusak layout existing (harus ada guard/cancel).

### 5.6 Aksesibilitas terukur (bukan hanya checklist manual)
- [ ] Jalankan quick pass kontras warna via `page.evaluate` (ambil `getComputedStyle` warna teks vs background elemen kunci, hitung rasio kontras dasar) untuk teks yang sering luput (badge status, legend chart, placeholder).
- [ ] Cek atribut ARIA dasar hilang: tombol icon-only tanpa `aria-label` (pola yang sudah dikonfirmasi ada di project, mis. toggle tema — pastikan konsisten di semua icon button lain).
- [ ] `prefers-reduced-motion`: animasi transisi tema/chart tidak dipaksakan jika user set reduced motion di OS (opsional, catat sebagai enhancement kalau belum ada).

### 5.7 Regresi spesifik project (wajib, bukan opsional)
Cek ulang **spesifik** 12 temuan di `PM-TASKS-QC-2026-09-24.md` yang sudah "difix" di commit `d15ce48` — pastikan fix-nya benar-benar terlihat di browser sungguhan (bukan cuma lolos di level kode):
- [ ] Data label (`LabelList`) muncul di: Pengelompokan Umur, Demografi Pekerjaan, Sektor Unggulan, Interaksi Chatbot, Tren Pengaduan, Surat Terbanyak, Jumlah Dokumen, Statistik Surat.
- [ ] Label Y-axis "Pedagang/UMKM" & label alokasi anggaran tidak terpotong lagi (khususnya di viewport sempit).
- [ ] Progress bar aktivitas kinerja divisi menampilkan angka %.
- [ ] Background status "realisasi rendah" APBDes **bukan hijau** di dark mode (harus merah/warna alert).
- [ ] Gambar SDGs di Beranda tampil (catatan: ini murni bug Safari-only menurut analisis kode — di Chrome kemungkinan sudah OK by default, tandai `❓` jika hanya diuji di Chrome).

---

## 6. Guardrail Wajib (Safety)

1. **Default staging, tidak pernah production tanpa izin eksplisit tertulis dari user di request tersebut.**
2. **Tidak submit form yang menghasilkan efek permanen** (create user sungguhan, delete data, ubah pengaturan sistem) kecuali user minta eksplisit — kalau perlu uji create/delete, gunakan data dummy yang jelas ditandai (`QC-TEST-*`) dan **hapus lagi setelah selesai**, atau minta izin dulu.
3. **Tidak brute-force / menebak kredensial.** Kalau login gagal dengan kredensial yang diberikan, **stop dan laporkan**, jangan mencoba kombinasi lain.
4. **Jangan trigger sinkronisasi eksternal berulang** (`/pengaturan/sinkronisasi`, NOC sync) — cukup 1x untuk uji UI feedback-nya, jangan spam API pihak ketiga.
5. **Token/secret tidak boleh masuk ke laporan** — kalau skill menemukan token bocor (§5.1), laporkan **keberadaan & lokasinya**, jangan tempel nilai token mentah di `REPORT.md` yang bisa ke-commit/terbaca orang lain.
6. **Selalu tutup TaskSpace** (`task.finish({ keep: [] })`) di akhir run kecuali user minta browser tetap terbuka untuk ditinjau.
7. **Screenshot & report disimpan lokal** (`qc-reports/`), **tidak otomatis dipublikasi/dikirim** ke mana pun tanpa user minta.

---

## 7. Format Output

```
qc-reports/
  2026-09-25-1430/
    REPORT.md              # Ringkasan + semua temuan (format §6 PEKERJAAN_QC.md)
    screenshots/
      beranda__desktop__light.png
      beranda__desktop__dark.png
      beranda__mobile__light.png
      ...
    console-network-log/   # (opsional) raw log per route kalau ada error
      beranda.json
```

`REPORT.md` wajib diawali ringkasan tabel (gaya `PM-TASKS-QC-2026-09-24.md` §"Ringkasan QC") sebelum detail per temuan, supaya PM bisa langsung ambil keputusan tanpa scroll semua.

Tambahkan `qc-reports/` ke `.gitignore` project (folder ini adalah output ephemeral tiap run, bukan artefak yang di-commit) — kecuali user eksplisit minta laporan tertentu disimpan permanen di lokasi lain.

---

## 8. Definition of Done Skill Ini (kapan agent boleh bilang "QC selesai")

Sama seperti §7 `PEKERJAAN_QC.md`, plus tambahan khusus otomasi:
1. Semua route di §1 `PEKERJAAN_QC.md` sudah dikunjungi minimal 1x per kombinasi viewport×tema yang disepakati.
2. Console & network tercatat untuk **setiap** route (bukan hanya yang tampak error).
3. Regresi §5.7 di atas sudah dicek eksplisit dengan hasil PASS/FAIL per item — bukan diasumsikan sudah beres karena ada di commit log.
4. Setiap temuan baru dicek apakah duplikat dari `PM-TASKS-QC-2026-09-24.md` sebelum masuk laporan sebagai "baru".
5. `REPORT.md` final tidak punya temuan tanpa bukti (screenshot minimal).
6. TaskSpace ditutup, tidak ada tab browser menggantung tak terpakai.
7. Agent melaporkan **secara jujur** hal yang tidak bisa diuji (mis. Safari-only bug, butuh akun kedua, butuh data produksi) — bukan diam-diam dilewati.

---

## 9. Kemungkinan Pengembangan Lanjutan (belum diimplementasi, ide untuk nanti)

- Integrasi output `REPORT.md` → otomatis buat issue di PM Dashboard (`pm-dashboard.wibudev.com`) mengikuti pola task di `PM-TASKS-QC-2026-09-24.md`, dengan konfirmasi user dulu.
- Visual regression: simpan screenshot baseline per route, bandingkan pixel-diff run berikutnya untuk deteksi perubahan tak disengaja.
- Jalankan sebagai bagian dari `/deploy-stg` sebagai gate opsional sebelum `trigger_repull` (butuh diskusi — QC visual butuh waktu lebih lama dari test otomatis biasa, mungkin cocok sebagai langkah manual-trigger terpisah, bukan blocking tiap deploy).
- Loop QC berkala pakai skill `loop`/`CronCreate` (mis. QC mingguan otomatis ke staging) — hanya jika user secara eksplisit minta jadwal rutin.

---

## 10. Referensi

- [`PEKERJAAN_QC.md`](./PEKERJAAN_QC.md) — kriteria & workflow manual (basis skill ini).
- [`PM-TASKS-QC-2026-09-24.md`](./PM-TASKS-QC-2026-09-24.md) — 12 temuan historis untuk regression check.
- [`.claude/skills/qc-agent/SKILL.md`](.claude/skills/qc-agent/SKILL.md) — implementasi skill operasional.
- [`.claude/skills/ego-browser`](.claude/skills/ego-browser) — dokumentasi tool browser yang dipakai.
- `src/middleware/authMiddleware.tsx`, `src/components/sidebar.tsx`, `src/components/header.tsx`, `src/routes/signin.tsx` — sumber kebenaran selector/struktur UI yang dipakai skill.
