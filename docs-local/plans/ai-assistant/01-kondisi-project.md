# 01 — Kondisi project dashboard-desa-plus (per 2026-09-30)

Diperiksa langsung dari kode, branch `bagas/analyst` (HEAD `dd66cc5`, v0.1.64).
Revisi 2: ditambah hasil analisa lanjutan setelah keputusan user (`keputusan.md`).

## Yang sudah ada dan bisa dipakai ulang

| Aset | Lokasi | Relevansi untuk AI assistant |
|---|---|---|
| Endpoint chat (stub) | `src/api/jenna.ts` — `POST /api/jenna/chat`, body `{ message, history: [{id,text,sender}] }`, balas `{ reply }` statis | Dipensiunkan setelah halaman Bantuan pindah ke komponen baru |
| UI chat | `src/components/help-page.tsx` (baris ~161–260) dan duplikatnya di `src/routes/admin/help.tsx` | Tertanam di halaman Bantuan, bukan FAB global |
| Auth per request | `src/middleware/apiMiddleware.tsx` → `derive` `user` dari sesi Better Auth **atau** API key (`x-api-key`/Bearer); `onBeforeHandle` → 401 tanpa user, plus penegakan IP whitelist | Identitas pasti → `ToolContext.user` |
| RBAC fitur | `src/utils/permission.ts` (`FEATURES`, `DEFAULT_PERMISSIONS`, role `admin`/`user`) + model `RolePermission` + `GET /api/my-permissions` + halaman `/admin/roles` (membaca `FEATURES` otomatis) | Sumber filter tool. Lihat temuan no. 1 & 2 |
| **Builder data per domain** | `src/api/wall-snapshot/build-*.ts` (keuangan, pengaduan, demografi, divisi, sosial, keamanan, bumdes, beranda, kpi, jenna) + tipe di `src/types/wall.ts` | **Sumber data tool terbaik**: server-side, ber-cache (`withCache`), bertipe, sengaja bebas PII (ada komentar eksplisit), angka sama dengan dashboard & video wall |
| Pencarian full-text | `src/api/search.ts` — `to_tsvector`/`ts_rank` untuk complaint, activity, document; `MODULE_URL` | Kandidat tool `cari_data` (fungsi perlu di-export) dan peta rute fitur 2 |
| FAQ | model `Faq` + `src/api/admin-faq.ts` + `GET /api/bantuan/faq` | Tool `lookup_faq` |
| Cache | `src/utils/cache.ts` (`cache`, `withCache`, `TTL`) — in-memory | Cache config AI 30 detik |
| Zona waktu | `src/config/timezone.ts` — aplikasi ditetapkan WITA | Reset kuota harian 00:00 WITA, tanggal di prompt |
| Singleton config | model `WallLayout` (`id @default("singleton")`) + `src/api/wall-layout.ts` (guard admin di handler) | Pola untuk `AssistantSettings` |
| Audit | model `ActivityLog` + `src/api/activity-log.ts` | Catat perubahan konfigurasi AI (tanpa rahasia) |
| Layout global | `src/routes/__root.tsx` → `components/layout/main-layout.tsx` (247 baris). `MainLayout` **tidak** dipakai di `/signin`, `/signup`, `/admin`, `/profile`, `/wall` | Tempat FAB; otomatis tersembunyi di rute tersebut |
| Store izin frontend | `src/store/permission.ts` (Valtio) diisi `main-layout` dari `/api/my-permissions` | FAB membaca `use-ai-assistant` dari sini |
| i18n | `src/locales/id.ts` & `en.ts`, `src/store/i18n.ts` | Bahasa jawaban & teks panel |
| Tema | `useIsDark`, warna header/navbar di `main-layout` | Panel mengikuti terang/gelap |
| Verifikasi admin ("acc") | `User.emailVerified`: user baru non-admin dibuat `false` (`src/utils/auth.ts`), admin memverifikasi di `/admin/users` (`POST /api/admin/users/verify`); frontend menolak user belum terverifikasi (`signin.tsx`, `authMiddleware.tsx`) | Syarat pakai asisten, dicek ulang di server |
| Test | `bun test tests` (`tests/api/*` ±48 file, pola `api.handle(new Request(...))`) | Test assistant mengikuti pola ini |
| Background job | `src/jobs/sync.ts` (`startSyncScheduler`) | Tempat job retensi riwayat |

## Yang belum ada (gap)

| Gap | Dampak / rencana |
|---|---|
| Redis / WebSocket / SSE | Riwayat di Postgres; transport HTTP biasa lalu SSE |
| Provider LLM | Belum ada kode/ENV provider → klien OpenAI-compatible baru |
| Util enkripsi | Belum ada → `src/utils/secret-crypto.ts` (Web Crypto native) |
| Rate limit / kuota | `JENNA_DAILY_COST_LIMIT` ada di `.env.example` tetapi **tidak dipakai** → diganti pengaturan DB |
| Verifikasi di API | Status acc **ada** (`User.emailVerified`, diubah admin di `/admin/users`), tetapi hanya ditegakkan di frontend; `apiMiddleware` tidak memeriksanya (lihat `discus/temuan.md` temuan 7) |
| `TEST_DATABASE_URL` | Tidak ada. Hampir semua test tanpa DB, kecuali `tests/api/database.test.ts` yang membaca DB dev (read-only) |
| Anchor elemen | 0 `data-testid`/`data-ai-*`/`id`, hanya 19 `aria-label` → prasyarat fitur 2 |
| Multi-tenant | Single-desa (Darmasaba) — cukup konstanta/config |

## Temuan yang perlu diperhatikan

1. **Fitur izin baru tidak otomatis muncul untuk role `user`.** `GET /api/my-permissions` hanya
   mengembalikan baris DB bila role sudah punya baris; fitur baru tanpa baris dianggap tidak diizinkan
   sampai admin membuka `/admin/roles`. Ditangani di pondasi (`03` §4).
2. **Izin `view-*` tidak ditegakkan di API.** `checkPermission()` tidak dipanggil di route mana pun; izin
   hanya menyaring menu sidebar. Di luar scope — dilaporkan saja. AI assistant menegakkan izin di tool.
3. **File melebihi batas:** `help-page.tsx` 1081, `demografi-pekerjaan.tsx` 1172, `admin/preferences.tsx`
   1373, `admin/settings.tsx` 738, `admin/help.tsx` 726, `pengaduan-layanan-publik.tsx` 553 baris.
   Kode AI dibuat di file baru.
4. **Env `VITE_JENNA_API_TOKEN`:** hanya dibaca di server hari ini, tetapi build memakai `--env='VITE_*'`
   → bila suatu saat dirujuk dari frontend, token ikut ter-bundle. Kunci LLM **tidak boleh** berprefix `VITE_`.
5. **`/api/jenna/chat` tidak memakai `message`** — belum ada logika AI apa pun.
6. **Data yang ditulis warga** (deskripsi pengaduan, `musrenbang[].namaPengusul`) → sumber prompt
   injection & PII. Koordinat CCTV di `WallKeamanan` juga sebaiknya tidak dikirim ke LLM.
7. **Kode mati di `main-layout.tsx`:** blok komentar tombol "Bantuan" melayang — dihapus saat FAB dipasang.
8. **Nama "Jenna" sudah dipakai** untuk chatbot desa-platform (halaman "Jenna Analytic", route
   `/api/jenna/analytics`). Kode asisten memakai istilah `assistant`; "Jenna" hanya nama tampilan default.
9. **`.env.staging` ter-commit** di git. Isinya tampak placeholder (DB `localhost`, secret contoh),
   jadi risikonya rendah — tetap perlu dipastikan tidak pernah berisi nilai asli.
10. **`bun run verify`** menjalankan `biome check --write` (mengubah file), sedangkan `CLAUDE.md`
    menyebutnya "lint error-only". Perlu diingat saat agent menjalankan verify.
11. **Verifikasi admin tidak ditegakkan di API** — user yang belum terverifikasi tetap mendapat sesi saat login
    dan `apiMiddleware` tidak memeriksa `emailVerified`. Rinci di `discus/temuan.md` temuan 7.
12. `docs-local/` tidak di `.gitignore` → tetap untracked (keputusan user: biarkan).

## Tumpang tindih dengan desa-platform

desa-platform punya 15 tool `desa_plus_*` (`src/ai/tools/desa-plus*.ts`) yang membaca data Desa+
(kegiatan, divisi, dokumen, diskusi, kalender, …). Domainnya beririsan dengan modul dashboard; pola &
deskripsi tool itu bisa dijadikan acuan penulisan, **tanpa** meng-import kodenya.
