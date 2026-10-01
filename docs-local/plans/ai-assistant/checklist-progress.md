# Checklist progress — AI Assistant

> **Belum ada pekerjaan kode yang dimulai.** Setiap tahap baru dikerjakan setelah **perintah eksplisit
> user**. Setiap tahap: branch sendiri → kode + test → `bun run verify` (+ `bun run test:db` bila ada) →
> lapor → **user menyetujui merge**. Tidak ada push/deploy tanpa perintah.
>
> ⛔ **Tidak pernah merge ke `main`.** Semua branch selesai di-merge (`--no-ff`) ke branch integrasi **`join`**
> (dibuat dari `main` 2026-10-01), hanya atas perintah user. Branch tahap berikutnya dibuat dari `join`.
>
> Legenda: `[ ]` belum · `[x]` selesai · `[~]` sedang dikerjakan · `[-]` ditunda/dibatalkan (dengan alasan)
> Rujukan: `03-pondasi.md` (disetujui), `04`–`06` (fitur), `07-roadmap.md`, `discus/*`.
> Revisi 2 (2026-10-01): diselaraskan ulang dengan seluruh keputusan; ditambah §9 pembagian kerja lintas sesi.

## 0. Keputusan

> Pembahasan fitur dilanjutkan di sesi **dashboard-desa-plus-59** (perintah user 2026-10-01). Sesi ini
> (**dashboard-desa-plus-0d**) menjadi **sesi induk**: menerima ringkasan keputusan dari sesi lain dan
> memperbarui README, checklist, serta dokumen 04–07. Sesi 59 hanya mengedit file diskusinya di `discus/`.

- [x] Pondasi `03-pondasi.md` disetujui (2026-09-30)
- [x] Temuan 1–7 diputuskan (`discus/temuan.md`)
- [x] P-1: dokumen + 4 pertanyaan disetujui (2026-10-01)
- [x] Fitur 1: FAB di `/profile` (terverifikasi) & bukan di `/admin`; tool MVP cukup; tombol salin **ya**; disclaimer **ya**
- [x] Fitur 1: dokumen `04` **disetujui** setelah revisi (FAB di `/wall` via akun kiosk; tool tetap 6) — 2026-10-01, sesi 59
- [ ] Fitur 2: pembahasan `05-fitur-2-pointer.md` — menghalangi **F2**
- [ ] Fitur 3: pembahasan `06-fitur-3-suara.md` — menghalangi **F3**

## 1. Persiapan

- [x] Database test lokal `dashboard_noc_test` dibuat + 23 migrasi diterapkan (2026-09-30)
- [x] `TEST_DATABASE_URL` ditambahkan ke `.env` lokal (2026-09-30)
- [ ] (User) Buat `AI_CREDENTIALS_KEY` (64 hex) dan pasang di env Portainer staging & produksi — nilainya harus tetap; dibutuhkan sebelum deploy, bukan sebelum coding
- [ ] (User) Siapkan Base URL + API key + nama model Claude proxy — dibutuhkan di P3 (uji koneksi)

## 2. Aturan yang berlaku di SEMUA tahap

- Branch: `fix/…` / `feature/…` dari **`join`** (bukan `main`); merge hanya ke `join`; commit `<type>(<scope>): <deskripsi>` bahasa Inggris
- File baru mengikuti batas ukuran (route ≤150, service ≤300, repo ≤250, util ≤200, test ≤400 baris); tidak menambah kode ke file yang sudah over-limit
- Kode memakai istilah `assistant`; "Jenna" hanya nilai default nama di DB (temuan 6c)
- Rahasia baru tanpa prefix `VITE_`; `VITE_JENNA_API_TOKEN` tidak boleh dirujuk dari frontend (temuan 6d)
- Log tanpa isi pesan/PII/API key; tidak ada `catch {}` kosong
- Dokumentasi yang terdampak diperbarui di branch yang sama (aturan 16)
- Sebelum push apa pun: **Pre-Push Guarantee Report** (aturan 18)

## 3. P-1 — API menolak user belum terverifikasi · branch `fix/api-require-verified-user`

> Dikerjakan di sesi **dashboard-desa-plus-61** (atas perintah user, 2026-10-01). Sesi perencanaan
> (dashboard-desa-plus-0d) tidak mengubah file repo selama P-1 berjalan.

- [x] Branch dari `main`
- [x] Fungsi murni `isVerified(user)` / `isUnverifiedAllowed(pathname)` + test unit (`true` lolos; `false`/`null`/`undefined` ditolak)
- [x] `apiMiddleware.tsx`: 403 `"Akun menunggu verifikasi admin"` untuk `emailVerified !== true` — sesi **dan** API key; pengecualian `/api/profile/update` (route di luar middleware — `/api/auth/*`, `/api/session`, `/api/health`, `/api/version` — dan carve-out wall/docs tidak berubah)
- [x] Frontend: `authMiddleware.tsx:140` & `signin.tsx:84` → `!== true`
- [x] Script `test:db` (gagal jelas tanpa `TEST_DATABASE_URL`) + folder `tests/db/`; `.env.example` + placeholder `TEST_DATABASE_URL`
- [x] Test DB: belum terverifikasi → 403 di `GET /api/keuangan`; `/api/profile/update` lolos; terverifikasi → normal; API key milik belum terverifikasi → 403; tanpa sesi → 401 (tetap)
- [x] Docs: `CLAUDE.md` (daftar command + bagian Testing: `test:db`, `TEST_DATABASE_URL`)
- [x] `bun run verify` + `bun run test:db` hijau
- [x] Lapor ke user (ringkasan, hasil test, nama branch, breaking change)
- [ ] (Sebelum **deploy**) Jalankan `discus/p-1-precheck.sql` (read-only) di staging & produksi: user `false`/`null` + API key aktif milik user belum terverifikasi; user yang aktif diverifikasi admin dulu. (SQL sudah diuji di DB dev lokal: 0 terdampak.)
- [x] Merge ke `join` (`2244d0a`, `--no-ff`) atas perintah user — 2026-10-01. `main` tidak disentuh
- [x] Push `origin/join` atas perintah user (Pre-Push Guarantee Report ditampilkan) — 2026-10-01. Deploy **ditunda**: user mencoba di lokal dulu

> Catatan implementasi (2026-10-01):
> - `emailVerified` di `apiMiddleware` dibaca dari DB (query `findUnique` yang sudah ada), bukan dari sesi —
>   cookie cache Better Auth menyimpan data user hingga 30 hari, jadi pencabutan verifikasi baru berlaku lewat DB.
> - Path data yang dites: `GET /api/keuangan/apbdes-detail` (`/api/keuangan` sendiri tidak ada → 404) dan `GET /api/my-permissions/`.
> - `tests/db/` jalan dengan `tests/db/bunfig.toml` (tanpa preload happy-dom — happy-dom membuang `set-cookie`).
> - Route yang punya skema respons 403 berbeda membalas **422** alih-alih 403 ke user belum terverifikasi (validasi
>   respons Elysia) — tetap ditolak. Terbukti di `POST /api/apikey/update` & `/delete`; route `invitation` (skema 403
>   `{ error }`) kemungkinan sama. Pola ini sudah ada sebelumnya untuk 401/IP-whitelist.
> - `apiMiddleware.tsx` kini 181 baris; kandidat pecah (lookup API key) di `fix/api-permission-guard`.
>
> Review sesi 0d (2026-10-01): dicek ulang di branch — `bun run test` 386 pass/0 fail, `bun run test:db` 12 pass/0 fail,
> biome bersih di 8 file yang diubah, tidak ada error `tsc` di file yang diubah (70 error `tsc` yang ada semuanya
> di test lama, sudah ada sebelum P-1). Catatan: `package.json` terformat ulang seluruhnya (spasi → tab, ±250 baris
> diff) padahal perubahan isinya hanya 4 script; tambahan pengaman sebelum merge: hitung juga API key aktif milik
> user belum terverifikasi di staging/produksi.

## 4. Pondasi · branch `feature/ai-assistant-pondasi` dari `join` (P-1 sudah di `join`)

### P1 — Data, izin, enkripsi

> Dikerjakan di sesi **dashboard-desa-plus-61** (perintah user 2026-10-01). Hanya sesi itu yang menyentuh skema/migrasi.
- [x] Model Prisma: `AssistantSettings` (singleton, `enabled` default **false**), `AiProviderConfig` (slot `chat`/`pointer`/`voice`), `AssistantConversation`, `AssistantMessage` (+ `userId` denormalisasi, index) + relasi di `User`
- [x] `AssistantSettings`: tambah `kioskUserId` (opsional, relasi ke User `onDelete: SetNull`) + `dailyMessageLimitKiosk` default **100** (keputusan user 2026-10-01) — lewat migrasi lanjutan kecil karena `add_ai_assistant` sudah diterapkan di DB lokal
- [x] Migrasi `add_ai_assistant`: guard `IF NOT EXISTS`, sisip izin `use-ai-assistant` (admin & user, `ON CONFLICT DO NOTHING`), komentar alasan
- [x] Migrasi diterapkan ke DB dev lokal **dan** `dashboard_noc_test`
- [x] `permission.ts`: fitur `use-ai-assistant` (default admin & user) + fungsi murni `resolveAllowedFeatures()`; `my-permissions.ts` memakainya
- [x] Resolver menangani role di luar `admin`/`user` — DB dev berisi role **`moderator`** yang tidak ada di `ROLES`/`DEFAULT_PERMISSIONS` (perilaku sekarang: jatuh ke default `user`); pertahankan perilaku itu + test
- [x] `src/utils/secret-crypto.ts` (AES-256-GCM, format `v1:`, **fail-closed**, dekripsi gagal → error jelas, bukan crash)
- [x] `.env.example`: tambah `AI_CREDENTIALS_KEY` (placeholder), hapus `JENNA_DAILY_COST_LIMIT`; buat kunci lokal di `.env`
- [x] `database.test.ts` dipindah ke `tests/db/` + email asli diganti nilai test (temuan 6e)
- [x] Test: crypto (round-trip, tamper, env kosong), resolver izin (fitur tanpa baris → default), izin tersisip di DB test
- [x] Docs: `docs/DATABASE.md` + bagian Database `CLAUDE.md` (39 → 43 model, domain "AI Assistant")
- [x] `bun run verify` + `bun run test:db` hijau

> Catatan implementasi P1 (2026-10-01, branch `feature/ai-assistant-pondasi` dari `join` 2244d0a, belum di-merge/push):
> - Migrasi `20261001032147_add_ai_assistant`: idempotent (sudah dijalankan dua kali di DB test tanpa error); FK pakai blok `DO $$` + cek `pg_constraint`; baris izin memakai `gen_random_uuid()::text` sebagai id.
> - `resolveAllowedFeatures(role, records)`: admin → semua fitur (sama seperti sebelumnya); hanya key di `FEATURES` yang dikembalikan (baris fitur lama yang sudah dihapus diabaikan). `checkPermission()` tidak diubah selain log saat error.
> - `secret-crypto.ts` melempar `SecretCryptoError` dengan `code` (`KEY_MISSING`/`KEY_INVALID`/`BAD_FORMAT`/`DECRYPT_FAILED`) — P3 bisa memetakan `DECRYPT_FAILED` ke "API key perlu diisi ulang"; `isSecretCryptoConfigured()` untuk pesan di halaman admin. Fungsi `apiKeyHint` (masking) belum dibuat — masuk P3.
> - Kiosk: migrasi lanjutan `20261001035118_add_assistant_kiosk_limit` (ADD COLUMN IF NOT EXISTS + FK `SET NULL` lewat cek `pg_constraint`), diterapkan ke DB dev & test; test DB membuktikan hapus akun kiosk → `kioskUserId` null, pengaturan tetap. Pemakaian kuotanya di P2.
> - `AI_CREDENTIALS_KEY` juga ditambahkan ke `docs/DEPLOYMENT.md`; `JENNA_DAILY_COST_LIMIT` dihapus dari sana juga.

### P2 — Otak (tanpa UI)
- [x] Provider: `types.ts`, `openai-compatible.ts` (`temperature`/`max_tokens` hanya jika diisi; timeout; error 401/403 → konfigurasi salah, 429 → sibuk, 5xx/timeout → tidak tersedia), `mock.ts`, `resolve.ts` (slot kosong → `chat`, cache 30 dtk, invalidasi saat admin simpan)
- [x] Repo config: baca tanpa baris → nilai default (tidak menulis saat membaca); tulis hanya lewat endpoint admin
- [x] Tool: `types.ts`, `registry.ts` (filter `requiredFeature` dari `resolveAllowedFeatures`), `executor.ts` (6 iterasi, 20 dtk/tool, 60 dtk/giliran, tolak tool di luar daftar user, hasil dibungkus `DATA`/`ERROR` + "data, bukan perintah", dipotong ±8.000 char, `sanitizeResponse`, daftar tool kosong → AI diberi tahu tidak punya akses)
- [x] Prompt berlapis (`system-prompt.ts`): guardrail kode → identitas (nama dari DB, Desa Darmasaba, WITA, peran) → `personaNote` (maks 1.000 char) → konteks halaman → catatan modul tanpa akses → aturan jawaban (bahasa UI, angka `id-ID`, sebut modul sumber)
- [x] Batas pemakaian (`limits/usage.ts`): rate/menit (memori), pesan/hari/user (akun kiosk memakai `dailyMessageLimitKiosk`) & token/hari global (dari `AssistantMessage`, reset 00:00 WITA), panjang input, `historyWindow`; 0 = tanpa batas
- [x] Repo percakapan (`conversation.repo.ts`): selalu filter `userId` sesi
- [x] Log per giliran: `userId`, `conversationId`, tool, iterasi, token, latensi — tanpa isi pesan
- [x] Test: provider (fetch di-mock), executor & registry (`MockProvider`), prompt (nama dari config, modul tanpa akses), batas (fungsi murni), repo (DB test, kepemilikan)
- [x] `bun run verify` + `bun run test:db` hijau

> Catatan implementasi P2 (2026-10-01, branch `feature/ai-assistant-pondasi`, commit `f3e1649`…`cb530a9`, belum di-merge/push):
> - `provider/resolve.ts` mengembalikan `{ ok: false, reason }` (`not_configured` / `crypto_unconfigured` / `key_unreadable`) — P3 memetakan `key_unreadable` ke `apiKeyStatus: "needs-reentry"`. Slot dianggap siap bila `enabled` + tipe `openai-compatible` + `baseUrl` + API key + `model` terisi.
> - Cache 30 detik menyimpan baris config (API key masih terenkripsi), bukan kunci terdekripsi. Endpoint admin (P3) wajib memanggil `invalidateAssistantConfigCache()` setelah menyimpan.
> - `loadAllowedFeatures(role)` baru di `permission.ts`: error DB dilempar (registry AI tidak jatuh ke default); `/api/my-permissions` tetap fallback ke default.
> - Batas waktu memakai helper `deadline.ts` (AbortController + setTimeout), bukan `AbortSignal.any`, supaya sama di Bun dan di test (happy-dom).
> - `historyWindow` 0 = seluruh riwayat (sesuai aturan "0 = tanpa batas"); P3 sebaiknya membatasi rentang input admin.
> - `appendMessages` mengisi `createdAt` eksplisit (+1 ms per pesan) karena `now()` Postgres konstan dalam satu transaksi.
> - Konteks halaman dari klien dibersihkan (satu baris, tanpa `#`, maks 120 char) sebelum masuk prompt.
> - Belum ada route yang di-mount — endpoint `/api/assistant/*` di P3/F1-b.

### P3 — Admin & status
- [ ] `GET /api/assistant/status` — **sesi browser saja** (tolak API key), `emailVerified === true`, izin `use-ai-assistant`; hanya boolean + nama
- [ ] `/api/admin/ai-assistant/*` — settings (validasi rentang), slot per fitur (API key: tidak dikirim = pertahankan, `""` = hapus; GET hanya `apiKeyHint`/`hasApiKey`), test koneksi (`https` saja kecuali localhost dev, tanpa redirect, simpan `lastTestAt`/`lastTestOk`), `ActivityLog` tanpa rahasia; slot yang kuncinya gagal didekripsi → status "API key perlu diisi ulang"
- [ ] Halaman `/admin/ai-assistant` (file baru, bukan `admin/settings.tsx`) + item nav: Umum (saklar, nama, personaNote), Batas pemakaian (angka-angka + pilihan akun kiosk & kuota 100/hari), Kredensial (Chat/Penunjuk/Suara; temperature & max tokens opsional; badge DB/belum diisi/fallback Chat; ▷ Test), Ringkasan hari ini
- [ ] Job retensi harian di `src/jobs/` (`retentionDays`, 0 = simpan selamanya)
- [ ] Test: 401/403 (tanpa sesi, belum terverifikasi, API key, non-admin), validasi rentang batas, respons tidak pernah memuat API key
- [ ] Docs: `docs/ARCHITECTURE.md` (modul `src/api/assistant/`, route baru), `.env.example` sudah di P1
- [ ] `bun run verify` + `bun run test:db` hijau
- [ ] Uji koneksi ke proxy nyata dari halaman admin (bersama user)
- [ ] Lapor → merge setelah persetujuan

## 5. Fitur 1 — FAB + panel "Tanya AI" · branch `feature/ai-assistant-chat` (setelah pondasi di-merge)

- [x] **F1-a** Dokumen `04` disetujui (2026-10-01)
- [ ] **F1-b** Tool MVP (kebijakan data temuan 3 — tanpa nama orang, koordinat, teks tulisan warga):
  - [ ] `ringkasan_beranda` (`buildKpi` + `buildBeranda`, `view-dashboard`)
  - [ ] `ringkasan_keuangan({ tahun? })` (`fetchApbdesEntriesRaw` + `mapKeuanganList`, `view-keuangan`; tanpa tahun = terbaru; sertakan daftar tahun tersedia)
  - [ ] `statistik_pengaduan` (`buildPengaduan`, `view-pengaduan`; buang `namaPengusul`)
  - [ ] `statistik_demografi` (`buildDemografi`, `view-demografi`)
  - [ ] `kinerja_divisi` (`buildDivisi`, `view-kinerja-divisi`)
  - [ ] `lookup_faq` (`Faq` terpublikasi, full-text, `use-ai-assistant`)
- [ ] **F1-b** Endpoint (sesi browser saja + terverifikasi + izin): `POST /api/assistant/chat` (401/403/409/422/429/503, `actions: []`), `GET` daftar percakapan & pesan (berhalaman, cursor), `DELETE`, `PATCH` judul; id milik user lain → 404
- [ ] **F1-b** Set evaluasi 10–20 pertanyaan dengan `MockProvider` (tool yang benar terpilih, izin dihormati)
- [ ] **F1-b** Test: izin per tool, penyaringan field sensitif, kepemilikan percakapan, kontrak endpoint, batas → 429, alur end-to-end `MockProvider`
- [ ] **F1-c** `AssistantFab` di `main-layout.tsx` (hapus blok komentar tombol Bantuan lama) + layout `/profile` + `WallPage`; tampil hanya bila ada sesi, status `enabled && slots.chat`, dan izin `use-ai-assistant`; tidak ada di `/admin`, `/signin`, `/signup`
- [ ] **F1-c** `/wall`: tetap publik; FAB hanya untuk kiosk yang login akun khusus; status dipanggil hanya bila ada sesi; bentuk panel tidak menutupi panel NOC
- [ ] (User) Buat akun kiosk khusus (mis. "NOC"), verifikasi di `/admin/users`, pastikan izin `use-ai-assistant` & `view-*` yang dibutuhkan — sebelum uji FAB di wall
- [ ] **F1-c** `AssistantPanel` (Drawer kanan, lazy; perbesar; layar penuh di mobile; `Esc` menutup + fokus kembali ke FAB; `aria-live`), header (nama dari config, badge Beta), daftar percakapan ☰, pesan + label "Sumber", indikator "memeriksa data…", composer (Enter/Shift+Enter, sisa karakter)
- [ ] **F1-c** Saran pertanyaan per rute, hanya untuk modul yang diizinkan; `pageContext` (`route`, `title`, `lang`)
- [ ] **F1-c** Tombol salin per jawaban + satu baris disclaimer di bawah input
- [ ] **F1-c** Sapaan & disclaimer memakai nama dari config (bukan "Jenna" hardcode di `locales`); id & en
- [ ] **F1-c** Store Valtio `src/store/assistant.ts`, data via TanStack Query; tema terang/gelap
- [ ] **F1-c** Uji manual di browser — hanya bila user meminta
- [ ] **F1-d** `/bantuan` (`help-page.tsx`) & `/admin/help` memakai panel yang sama (mode tertanam); hapus stub `POST /api/jenna/chat` beserta kontraknya
- [ ] **F1-e** SSE `POST /api/assistant/chat/stream`: event `status`, `delta` (iterasi terakhir), `done`
- [ ] Setiap sub-tahap: `bun run verify` + `bun run test:db` hijau → lapor → merge setelah persetujuan
- [-] 👍👎 umpan balik — ditunda (butuh kolom DB + tampilan admin)
- [-] "Add file" — ditunda (butuh penyimpanan & parser file)

## 6. Lanjutan Fitur 1 (setelah MVP dipakai)

- [ ] Tool tahap 2: `ringkasan_sosial`, `ringkasan_keamanan` (tanpa koordinat/kode CCTV & teks laporan warga), `ringkasan_bumdes`, `analitik_chatbot`, `cari_data` (export fungsi di `search.ts`; tanpa cuplikan deskripsi pengaduan)
- [ ] Cek per modul apakah sumbernya punya data multi-tahun → parameter tahun bila ada (temuan 1)

## 7. Fitur 2 — Penunjuk · menunggu pembahasan `05`

- [x] P1 pendekatan: **B** (target terdaftar, baca-saja); page-agent = opsi masa depan untuk aksi tulis — 2026-10-01
- [ ] P2–P7: arti slot `pointer`, kapan menunjuk, jenis aksi, halaman percontohan, HP, aksesibilitas (sesi 59)
- [ ] Rincian checklist ditambahkan setelah dokumen `05` disetujui

## 8. Fitur 3 — Suara · menunggu pembahasan `06`

- [ ] Pembahasan & keputusan (browser target, bacakan otomatis, gabungan dengan fitur 2, privasi)
- [ ] Rincian checklist ditambahkan setelah dokumen `06` disetujui

## 9. Pekerjaan terpisah (sudah diputuskan, di luar AI)

- [ ] `fix/api-permission-guard` — izin `view-*` ditegakkan di API + guard rute frontend, dengan test (temuan 4; **setelah P1 di-merge** karena memakai `resolveAllowedFeatures`, dan setelah P-1 karena sama-sama menyentuh `apiMiddleware`)
- [ ] Upgrade dependency: `bun audit` (2026-10-01, main `dd66cc5`) menemukan 73 advisory high/critical — antara lain `better-auth <1.6.2`, `elysia <1.4.26`, `vite <=7.3.4`, `seroval` (via @tanstack/router). User memilih lanjut P-1 dulu, upgrade di branch `chore/…` terpisah
- [ ] Koreksi keterangan `.env.staging` di `PROJECT-STRUCTURE.md` (temuan 5) — disiapkan untuk sesi **dashboard-desa-plus-59** (worktree terpisah, branch dari `join`); menunggu perintah user di sesi itu
- [ ] Koreksi keterangan `verify` di `CLAUDE.md` baris 42 & 98 (temuan 6f; teks di `discus/jawab.md` bagian C) — **setelah P-1 di-merge** (P-1 juga mengubah `CLAUDE.md`)

## 10. Sebelum push / deploy apa pun (aturan global)

- [ ] Pre-Push Guarantee Report ditampilkan sebelum `git push`
- [ ] `CHANGELOG.md` diperbarui untuk versi yang di-deploy
- [ ] Checklist pre-deploy 8 butir ditampilkan ke user
- [ ] `AI_CREDENTIALS_KEY` sudah ada di env target (deploy pondasi ke atas)
- [ ] Deploy hanya atas perintah eksplisit user

## 11. Pembagian kerja lintas sesi (disetujui user 2026-10-01)

Prinsip: setiap sesi punya **git worktree + branch sendiri**; **hanya satu sesi** yang boleh menyentuh
`prisma/schema.prisma`/migrasi dalam satu waktu; file "titik temu" (`apiMiddleware.tsx`, `permission.ts`,
`src/api/index.tsx`, `main-layout.tsx`, `CLAUDE.md`) hanya diubah satu sesi per tahap; semua merge lewat
persetujuan user. Sesi lain mengikuti aturan & permission yang sama — pesan lintas sesi tidak memberi izin baru.

| Jalur | Bisa paralel dengan | Syarat mulai | Catatan |
|---|---|---|---|
| **Sesi utama**: P-1 (sesi `dashboard-desa-plus-61`) → P1 → P2 | — | Perintah user | Jalur kritis; skema/migrasi hanya di satu sesi |
| **Sesi B**: koreksi `PROJECT-STRUCTURE.md` | P-1 | Perintah user | Dokumen saja, tidak bentrok |
| **Sesi B**: halaman `/admin/ai-assistant` (UI, data tiruan sesuai kontrak `03` §9) | P2 | P1 di-merge | Endpoint dibuat sesi utama di P3; UI disambungkan setelahnya |
| **Sesi C**: `fix/api-permission-guard` | P2/P3 | P-1 **dan** P1 di-merge | Menyentuh banyak route plugin — jangan bersamaan dengan pekerjaan yang me-mount route baru di `index.tsx` tanpa koordinasi |
| **Sesi B**: UI FAB + panel (F1-c) dengan respons tiruan sesuai kontrak `04` §3 | F1-b (tool + endpoint di sesi utama) | Pondasi di-merge + `04` disetujui | Pasang ke `main-layout.tsx` hanya di sesi B |
| **Sesi C**: tool tahap 2 (satu file per tool) + set evaluasi | F1-c | Registry (P2) di-merge | Tiap tool independen |
| **Sesi riset**: bahan diskusi fitur 2 (uji page-agent) & fitur 3 (uji Web Speech `id-ID` di browser target) | Semua | Kapan saja | Tanpa mengubah kode repo; hasil ditulis ke `discus/` |

Tidak disarankan dipecah: **P-1** (kecil, sensitif keamanan), **P1** (skema tunggal), **F1-d** (bergantung
panel F1-c), dan **koreksi `verify` di `CLAUDE.md`** (tunggu P-1).
