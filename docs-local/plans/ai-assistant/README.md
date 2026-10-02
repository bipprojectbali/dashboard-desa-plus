# AI Assistant — Dashboard Desa Plus

> **Scope:** AI Assistant **milik Dashboard Desa Plus** (hidup di aplikasi dashboard, untuk pengguna
> dashboard). `desa-platform` hanya **referensi pola** — kodenya tidak di-import dan AI-nya tidak dipanggil.
>
> **Status (2026-09-30): pondasi disetujui; fitur 1–3 masih draf. Belum ada kode yang ditulis.**
> Aturan kerja: implementasi baru dimulai setelah dokumen yang relevan disetujui.

## Alur pembahasan

1. **Pondasi** (`03-pondasi.md`) — disetujui paling awal.
2. **Fitur 1** chat panel (`04`) → 3. **Fitur 2** penunjuk (`05`) → 4. **Fitur 3** suara (`06`) — satu per satu.

## Isi folder

| File | Isi | Status |
|---|---|---|
| `00-design-plan.md` | **Ringkasan design plan untuk dipaparkan ke tim**: wireframe UI, alur kerja, keputusan, roadmap, status | Ringkasan |
| `discus/keputusan.md` | Jawaban user atas 7 pertanyaan awal (+ screenshot di folder utama) | Sumber keputusan |
| `01-kondisi-project.md` | Inventaris aset yang bisa dipakai ulang, gap, dan temuan di kode | Analisa |
| `02-analisa-blueprint.md` | Fase 0–11 blueprint desa-platform: Terapkan / Adaptasi / Tunda / Tidak relevan | Analisa |
| `03-pondasi.md` | **Setup & persiapan**: model data, kredensial per fitur, izin, provider, tool/executor, prompt, batas, endpoint, halaman admin, test | **Disetujui** (2026-09-30) |
| `04-fitur-1-chat-panel.md` | FAB + panel "Tanya AI", endpoint percakapan, tool awal | **Disetujui** (2026-10-01) |
| `05-fitur-2-pointer.md` | AI menunjuk elemen (pendekatan page-agent vs whitelist) | **Disetujui** (2026-10-02) |
| `06-fitur-3-suara.md` | Interaksi suara (3 tingkat) | Draf |
| `07-roadmap.md` | Tahapan P0–P3 (pondasi) lalu F1–F3 | Draf |
| `discus/temuan.md` | Diskusi temuan satu per satu: fakta → opsi → rekomendasi → keputusan | Selesai (1–7) |
| `discus/jawab.md` | Jawaban user + tanggapan agent (A–D) | Berjalan |
| `discus/p-1-verifikasi-api.md` | Rancangan P-1: API menolak user belum terverifikasi | **Disetujui** (2026-10-01) |
| `discus/p-1-precheck.sql` | Query read-only sebelum deploy P-1 (user & API key terdampak) | Siap pakai |
| `discus/fitur-2-pointer.md` | Diskusi Fitur 2 (P1–P7) — sesi 59 → 61 | **Tuntas** (2026-10-01) |
| `discus/fitur-2-alasan-pendekatan-b.md` | **Pegangan untuk tim**: kenapa pendekatan B, bukan page-agent; cara kerja B; kapan page-agent layak dipakai | Final (keputusan #28) |
| `discus/fitur-3-suara.md` | Analisa Fitur 3 suara full duplex (OpenAI): alur, opsi a/b/c, fakta kode, rekomendasi, 14 pertanyaan | Dijawab user (2026-10-02); diskusi lanjut **ditunda** sampai uji manual F2 selesai |
| `discus/fitur-2-page-agent-tinjau-ulang.md` | Tinjau ulang page-agent (permintaan user 2026-10-01): fakta baru v1.12.4, opsi O1–O4 | **Tuntas** — B diperluas (2026-10-02) |
| `checklist-progress.md` | Checklist progres semua tahap | Aktif |
| `test/` | Semua daftar uji manual (kolom hasil diisi user) | Aktif |
| `test/uji-manual-fitur-2.md` | Uji manual Fitur 2 (penunjuk) — Keuangan, P3, P6, izin | Siap dipakai |
| `test/uji-manual-fitur-2-beranda-divisi.md` | Uji manual penunjuk di Beranda & Kinerja Divisi (F2-d) | Siap dipakai |
| `test/uji-manual-fitur-2-f2f.md` | Uji manual penunjuk di BUMDes, Sosial, Keamanan, Jenna Analytic (F2-f) | Siap dipakai |
| `test/uji-manual-fitur-2-wall.md` | Uji manual penunjuk di `/wall` (F2-w) | Siap dipakai |
| `test/uji-manual-fitur-2-f2e.md` | Uji manual penunjuk di Pengaduan & Demografi (F2-e) | Siap dipakai |

## Keputusan yang sudah diambil user

| # | Topik | Keputusan | Diterapkan di |
|---|---|---|---|
| 1 | Kunci LLM | Akun yang sama dengan desa-platform — **Claude custom proxy** (OpenAI-compatible). Base URL + API key bisa diisi **per fitur** | 03 §3 |
| 2 | Pengguna | User yang sudah **diverifikasi admin** (`emailVerified === true`, diverifikasi di `/admin/users`) + izin baru `use-ai-assistant` (default admin & user, bisa dimatikan per role) | 03 §4, temuan 2 & 7 |
| 3 | Cakupan | **Baca-saja** | 03, 04 |
| 4 | Riwayat | **Disimpan di DB** | 03 §2 |
| 5 | Suara | Dibahas lebih lanjut (user baru pertama kali menyentuh mode suara) | 06 |
| 6 | Nama | Bisa diatur lewat config, **default "Jenna"** | 03 §2, §7 |
| 7 | `docs-local/` | Awalnya dibiarkan; **2026-10-01 user minta di-commit & di-push** agar tracker bersih (dokumen perencanaan ikut di repo) | — |
| 8 | Batas pemakaian | **Disimpan di DB & bisa diatur admin** (bukan env) | 03 §2, §8 |
| 9 | Slot per fitur | Slot API key Penunjuk & Suara **disiapkan dulu** | 03 §3 |
| 10 | Test DB | Database test terpisah (`TEST_DATABASE_URL`) | 03 §14 |
| 11 | Autentikasi chat | Hanya sesi browser, bukan API key dashboard | 03 §11 |
| 12 | `JENNA_DAILY_COST_LIMIT` | Dihapus, diganti pengaturan DB | 03 §15 |
| 13 | Temperature/max tokens | Field opsional di form admin | 03 §10 |
| 14 | Data AI & cache | Mengikuti cache yang ada; keuangan mendukung parameter tahun | temuan 1 |
| 15 | Resolver izin | Opsi C: sisip izin di migrasi + satu fungsi `resolveAllowedFeatures` | temuan 2 |
| 16 | Data sensitif | Opsi A: tanpa nama orang, koordinat, teks tulisan warga | temuan 3 |
| 17 | Izin `view-*` di API | Diperbaiki terpisah setelah pondasi (`fix/api-permission-guard`) | temuan 4 |
| 18 | `.env.staging` | Cukup perbaiki keterangan `PROJECT-STRUCTURE.md` | temuan 5 |
| 19 | Env `VITE_JENNA_API_TOKEN` | Dibiarkan (hanya dipakai server; kunci AI di DB) | temuan 6d |
| 20 | `database.test.ts` | Pindah ke database test, email asli diganti nilai test | temuan 6e |
| 21 | Keterangan `verify` | Disamakan (usulan: ubah keterangan di `CLAUDE.md`) | temuan 6f |
| 22 | Verifikasi di API | Branch `fix/api-require-verified-user` **sebelum** pondasi AI | temuan 7 |
| 23 | Merge | **Tidak pernah ke `main`**; integrasi di branch `join` | checklist |
| 24 | Dokumen 04 | Disetujui (2026-10-01) | 04 §9 |
| 25 | FAB di `/wall` | Ya, hanya bila kiosk login akun khusus terverifikasi + izin; `/wall` tetap publik | 04 §1, §9 no. 7 |
| 26 | Tool versi pertama | Tetap 6; Sosial/Keamanan/BUMDes/Jenna Analytic di tahap 2 | 04 §4, §9 no. 8 |
| 27 | Kuota akun kiosk `/wall` | Default **100 pesan/hari**, akun kiosk dipilih admin, bisa diubah | 03 §2, §8, §10 |
| 28 | Fitur 2 — pendekatan | **B**: target terdaftar, satu loop, baca-saja; page-agent untuk masa depan (aksi tulis) | 05 §2 |
| 29 | Fitur 2 — slot Penunjuk | **Belum dipakai**: penunjuk memakai otak chat (satu loop); slot tetap ada, berlabel "belum dipakai" | 05 §3 |
| 30 | Fitur 2 — kapan menunjuk | Hanya bila diminta; label "Sumber" bisa diklik untuk menunjuk tanpa memanggil AI/kuota | 05 §4 |
| 31 | Fitur 2 — aksi versi pertama | `navigate` + `pointTo` (termasuk gulir, kursor, sorotan); tur & ganti filter ditunda. **DIUBAH 2026-10-01: + klik TAMPILAN** (tab, tahun, detail, menu) pada target terdaftar ber-daftar-izin; tombol tulis hanya ditunjuk ("silakan tekan sendiri"); klik tulis dengan konfirmasi = tahap berikutnya. Baca-saja (#3) tetap | 05 §4, `discus/fitur-2-page-agent-tinjau-ulang.md` |
| 32 | Fitur 2 — halaman percontohan | Keuangan (`/keuangan-anggaran`) dulu, lalu Beranda | 05 §4 |
| 33 | Fitur 2 — mode perbesar | Panel ditutup sementara saat menunjuk, lalu tombol "Kembali ke chat" (percakapan utuh). **Ralat 2026-10-01: tidak ada tampilan HP** — dashboard dipakai untuk NOC | 05 §4, 04 §2 |
| 34 | Fitur 2 — aksesibilitas | `prefers-reduced-motion` aktif → sorotan + gulir tanpa animasi kursor | 05 §4 |
| 35 | Kuota & kegagalan AI | Pertanyaan yang gagal karena provider **tidak dihitung kuota** (tetap disimpan berstatus "error" untuk admin) | 03 §8 |
| 36 | Fitur 1 lanjutan | F1-c s.d. F1-e di sesi `chat-a6`, worktree & branch yang sama (`feature/ai-assistant-chat`), satu sub-tahap per perintah | checklist §5 |
| 37 | Fitur 2 — pendekatan setelah tinjau ulang page-agent | **B diperluas**: tool `klik_elemen(target)` / `pilih(target, nilai)` khusus target tampilan terdaftar (daftar izin); page-agent tidak dipakai sekarang | 05, `discus/fitur-2-page-agent-tinjau-ulang.md` Q2 |
| 38 | Fitur 3 — provider suara | **OpenAI** (bukan Claude); user sudah menyiapkan API key OpenAI, disimpan lewat slot `voice` di halaman admin (terenkripsi). Arsitektur full duplex dianalisa worker `ai_suara` | `discus/fitur-3-suara.md` |
| 39 | Dokumen 05 & pembagian Fitur 2 | `05` **disetujui**; implementasi F2-a (paralel) + F2-b (setelah F1-e) | 05, checklist §7 |
| 40 | Penunjuk di `/wall` | AI menjawab dan hanya menunjuk widget yang ada di wall; tidak pindah halaman keluar dari wall (untuk sekarang) | checklist §7 |
| 41 | Urutan cakupan penunjuk | F2-d (Beranda & Kinerja Divisi) selesai → **F2-f** (BUMDes, Sosial, Keamanan, Jenna Analytic) → F2-e (Pengaduan & Demografi, perlu pecah file besar) | checklist §7 |
| 42 | Widget Status Sistem (ops) di `/wall` | Dibuka untuk akun kiosk: izin penunjuk `view-dashboard` (bukan `sync-noc`) — keputusan user 2026-10-02 | checklist §7 |

## Ringkasan eksekutif

1. **Pakai "Lampiran A" blueprint (FAB + panel)**, bukan varian WhatsApp. Sekitar separuh blueprint
   (webhook, dedup, buffer, registrasi/OTP/KTP, handoff) tidak relevan karena user dashboard sudah login.
2. **Yang diadopsi:** kontrak tool + registry yang difilter izin, loop `executeWithTools`
   (maks iterasi, timeout, sanitasi), dan prinsip "LLM memutuskan, kode menjaga".
3. **Aset terbesar di dashboard:** builder `src/api/wall-snapshot/*` — data per domain yang sudah
   ber-cache, bertipe, bebas PII, dan angkanya identik dengan dashboard. Tool AI cukup membungkusnya.
4. **Tanpa dependency baru:** `fetch`, Web Crypto, Prisma, Elysia yang sudah ada.
5. **Dua temuan yang memengaruhi desain:** (a) fitur izin baru tidak otomatis muncul untuk role `user`
   → perlu resolver + sisipan izin di migrasi; (b) izin `view-*` tidak ditegakkan di API mana pun →
   AI menegakkannya sendiri di tool (temuan (b) di luar scope, hanya dilaporkan).
6. Fitur 2 paling aman sebagai **aksi UI ber-whitelist**; fitur 3 dimulai dari Web Speech API di atas
   pipeline teks yang sama.

## Pertanyaan yang menunggu jawaban (pondasi)

Pertanyaan pondasi (`03` §16) dan temuan 1–7 **sudah diputuskan semua**. User lama dengan
`emailVerified = null` dianggap belum terverifikasi (temuan 7). `03-pondasi.md` disetujui.
