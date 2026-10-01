# Architecture

## Overview

Single Bun process menjalankan Elysia (HTTP server) + Vite middleware (React SPA). Request ke `/api/*` dihandle Elysia; semua request lain serve React SPA.

```
Browser
  │
  ├── /api/*  → Elysia (src/api/)
  └── /*      → Vite → React SPA (src/routes/)
                          │
                          └── fetch() → /api/*  (internal)
                          └── fetch() → VITE_DESA_API_URL  (external, langsung)
```

Entry point: `src/index.ts` — merakit `Elysia().use(api)`, mount 2 route proxy langsung (lihat di bawah), lalu serve Vite middleware (dev) atau static files + SPA fallback (production). Production juga auto-seed database jika `ADMIN_EMAIL` di-set, dan menjalankan `startSyncScheduler()` (`src/jobs/sync.ts`) untuk background sync job dari NOC serta `startAssistantRetentionScheduler()` (`src/jobs/assistant-retention.ts`, harian 04:00 waktu server) yang menghapus percakapan AI assistant yang tidak aktif lebih lama dari `retentionDays` (0 = simpan selamanya).

---

## Server Side — `src/api/`

Semua Elysia plugin di-mount berantai di `src/api/index.tsx` pada instance `Elysia({ prefix: "/api" })`. Urutan mount (sesuai file):

| File | Prefix | Isi |
|---|---|---|
| `admin.ts` | `/admin` | Admin: manajemen user, invalidasi cache |
| `noc.ts` | `/noc` | Integrasi & sync NOC system |
| `apikey.ts` | `/apikey` | Manajemen API keys |
| `profile.ts` | `/profile` | Profil user |
| `division.ts` | `/division` | CRUD divisi |
| `complaint.ts` | `/complaint` | Pengaduan layanan publik |
| `resident.ts` | `/resident` | Data penduduk |
| `dashboard.ts` | `/dashboard` | Agregasi data dashboard utama |
| `demografi.ts` | `/demografi` | Data kependudukan & cache |
| `notification-preferences.ts` | `/notification-preferences` | Preferensi notifikasi |
| `umkm.ts` | `/umkm` | Data UMKM lokal |
| `bumdes.ts` | `/bumdes` | Halaman BUM Desa |
| `umum-preferences.ts` | `/umum-preferences` | Preferensi umum |
| `keamanan.ts` | `/keamanan` | Halaman keamanan desa |
| `keamanan-preferences.ts` | `/keamanan-preferences` | Preferensi keamanan akun |
| `akses-preferences.ts` | `/akses-preferences` | Preferensi akses & tim |
| `wall-layout.ts` | `/wall-layout` | Konfigurasi layout Video Wall |
| `keuangan.ts` | `/keuangan` | Keuangan & anggaran (APBDes) |
| `system-stats.ts` | (lihat file) | Statistik sistem (admin) |
| `activity-log.ts` | `/activity-log` | Audit log aktivitas user |
| `invitation.ts` | `/invitation` | Sistem undangan user |
| `ip-whitelist.ts` | `/ip-whitelist` | IP whitelist enforcement |
| `search.ts` | `/search` | Global search |
| `sosial.ts` | `/sosial` | Layanan sosial |
| `sosial-kesejahteraan.ts` | `/sosial/kesejahteraan` | Data kesejahteraan masyarakat |
| `sync-log.ts` | `/admin/sync` | Riwayat sinkronisasi NOC |
| `bantuan.ts` | `/bantuan` | Halaman bantuan / help |
| `admin-faq.ts` | `/admin/faq` | CRUD FAQ (drag-and-drop reorder) |
| `my-permissions.ts` | `/my-permissions` | Permission user yang sedang login |

Plus route langsung di `api` object (bukan plugin terpisah): `GET /api/health`, `GET /api/version`, `ALL /api/auth/*` (Better Auth handler), `GET /api/session`. Swagger docs di-mount di `/api/docs` hanya saat `NODE_ENV !== "production"`.

**Route yang bypass plugin composition** — dua endpoint di-mount langsung di `src/index.ts` (bukan lewat `src/api/index.tsx`), sesuai komentar kode "bypass plugin composition issues":
- `GET /api/jenna/analytics` — proxy ke Jenna Analytics API (`VITE_JENNA_API_URL`)
- `GET /api/noc/pengaduan` — proxy ke NOC Pengaduan API (`VITE_JENNA_API_URL`)

**Subfolder pendukung** (logic non-plugin, dipakai internal oleh route handler di atas):
- `src/api/sources/` — fetcher raw dari API eksternal (`apbdes.ts`, `umkm-dashboard.ts`)
- `src/api/transforms/` — transformer data eksternal → shape internal (APBDes, demografi, Jenna, NOC discussions/divisions/documents/events/pengaduan/progres/projects, religion)
- `src/api/wall-snapshot/` — builder snapshot data untuk tiap kategori widget Video Wall (beranda, bumdes, demografi, divisi, jenna, keamanan, keuangan, kpi, pengaduan, sosial)
- `src/api/assistant/` — AI assistant: otak (provider, tool, prompt, batas) + route `GET /api/assistant/status`, `POST /api/assistant/chat`, `/api/assistant/conversations/*`, dan `/api/admin/ai-assistant/*` (di-mount di `src/api/index.tsx`): lihat [AI Assistant](#ai-assistant)

Auth di-handle Better Auth di `/api/auth/*` (konfigurasi di `src/utils/auth.ts`, lihat [Auth Flow](#auth-flow)).

---

## Frontend Side — `src/routes/`

TanStack Router file-based routing. File route → URL:

| File | URL | Halaman |
|---|---|---|
| `index.tsx` | `/` | Dashboard utama |
| `signin.tsx` | `/signin` | Login |
| `signup.tsx` | `/signup` | Registrasi |
| `kinerja-divisi.tsx` | `/kinerja-divisi` | Performa divisi |
| `keuangan-anggaran.tsx` | `/keuangan-anggaran` | Keuangan & anggaran (APBDes) |
| `demografi-pekerjaan.tsx` | `/demografi-pekerjaan` | Demografi & ketenagakerjaan |
| `bumdes.tsx` | `/bumdes` | BUM Desa — UMKM & penjualan |
| `pengaduan-layanan-publik.tsx` | `/pengaduan-layanan-publik` | Pengaduan publik |
| `keamanan.tsx` | `/keamanan` | Keamanan desa |
| `jenna-analytic.tsx` | `/jenna-analytic` | Analitik (Jenna AI) |
| `bantuan.tsx` | `/bantuan` | Bantuan / help |
| `sosial.tsx` | `/sosial` | Layanan sosial & kesejahteraan masyarakat |
| `wall.tsx` | `/wall` | **NOC Video Wall** — kiosk mode, lihat [Video Wall](#video-wall-wall) |
| `profile/` | `/profile` | Profil user (view + edit) |
| `users/` | `/users`, `/users/$id` | Manajemen user |
| `admin/` | `/admin/*` | Panel admin (apikey, audit-log, help, preferences, roles, settings, system-health, users) |
| `pengaturan/` | `/pengaturan/*` | Pengaturan (umum, keamanan, akses-dan-tim, notifikasi, sinkronisasi) |

---

## Components — `src/components/`

Dikelompokkan per fitur:

```
components/
├── assistant/          # Tombol AI melayang (FAB) + panel chat "Tanya AI" (lihat AI Assistant)
├── dashboard/          # Widget dashboard utama
├── kinerja-divisi/     # Komponen halaman kinerja divisi
├── umkm/               # Komponen halaman BUMDes (summary-cards, sales-table, top-products, dll)
├── keuangan/            # KPI cards, income-expense-chart, allocation-chart, dana-bantuan-card, laporan-card
├── sosial/              # Kesejahteraan, beasiswa, posyandu-schedule, health-records/stats, event-calendar
├── wall/                # Widget registry & layout builder untuk NOC Video Wall
├── pengaturan/          # Komponen halaman pengaturan
├── figma/               # ImageWithFallback dan asset dari Figma
├── ui/                  # Wrapper Radix UI + Mantine reusable
└── layout/              # Layout components (main-layout)
```

Plus komponen top-level per halaman: `bumdes-page.tsx`, `dashboard-card.tsx`, `dashboard-content.tsx`, `demografi-pekerjaan.tsx`, `dev-inspector.tsx`, `global-search.tsx`, `header.tsx`, `help-page.tsx`, `jenna-analytic.tsx`, `keamanan-page.tsx`, `keuangan-anggaran.tsx`, `kinerja-divisi.tsx`, `pengaduan-layanan-publik.tsx`, `sidebar.tsx`, `sosial-page.tsx`.

---

## State Management

**Valtio** (`src/store/`) untuk state global antar komponen:

| Store | Isi |
|---|---|
| `akses.ts` | State akses & tim (pengaturan) |
| `assistant.ts` | Panel AI assistant: terbuka/perbesar, tampilan chat/daftar, percakapan aktif & pesannya. Tidak di-reset saat panel ditutup |
| `auth.ts` | Session/user state di client |
| `i18n.ts` | Bahasa aktif |
| `notif.ts` | Notifikasi in-app |
| `permission.ts` | Permission user yang sedang login (cache dari `/api/my-permissions`) |
| `sosial.ts` | Filter & state halaman `/sosial` |
| `umkm.ts` | Filter & time range untuk halaman BUMDes |
| `wall-layout.ts` | Layout widget Video Wall (order, sizes) — sinkron dengan `WallLayout` model |

Untuk data fetching, komponen menggunakan `@tanstack/react-query` (`src/utils/query-client.ts`) atau `useState`/`useEffect` langsung tergantung kompleksitas.

---

## HTTP Clients

| Client | File | Digunakan di |
|---|---|---|
| `apiClient` | `src/utils/api-client.ts` | Frontend → endpoint internal (`/api/*`), typed dari `generated/api` |
| `desaExternalClient` | `src/utils/desa-external-client.ts` | Server → Desa Website API |
| `nocExternalClient` | `src/utils/noc-external-client.ts` | Server → NOC System API |
| `platformExternalClient` | `src/utils/platform-external-client.ts` | Server → Platform API (`PLATFORM_API_URL`, Bearer token) — Pengaduan & Surat live "Fase 2" |

Frontend juga bisa call Desa API langsung via `fetch(${VITE_DESA_API_URL}/api/ekonomi/...)` — pattern ini dipakai di `bumdes-page.tsx` dan komponen chart kepuasan warga.

---

## Auth Flow

Better Auth (`src/utils/auth.ts`) dengan Prisma adapter (`postgresql`):

- **Providers**: email+password (bcrypt cost 12) dan OAuth `github` + `google`
- **Session**: cookie cache 30 hari (`maxAge`), `expiresIn` 30 hari, `cookiePrefix: "bun-react"`, `trustProxy: true`
- **Role**: field custom `role` di `User` (default `"user"`)
- **Auto-admin**: `databaseHooks.user.create.before` — email yang cocok `ADMIN_EMAIL` otomatis jadi `role: "admin"` + `emailVerified: true`. User lain default `emailVerified: false` (butuh verifikasi admin sebelum bisa akses).
- **Activity log**: `databaseHooks.session.create.after` — setiap login dicatat ke `ActivityLog` (IP, user-agent) kecuali user menonaktifkan `logAktivitas` di `KeamananPreference`.
- **Middleware**: `src/middleware/authMiddleware.tsx` (guard server & client), `src/middleware/apiMiddleware.tsx` (dipasang di `src/api/index.tsx` sebelum semua plugin fitur).
- **Verifikasi admin di API**: `apiMiddleware` menolak user dengan `emailVerified !== true` (`false` atau `null`) dengan **403** `{ message: "Akun menunggu verifikasi admin" }` — berlaku untuk sesi dan API key; nilai `emailVerified` dibaca dari DB (bukan cookie cache sesi). Pengecualian: `/api/profile/update`. Route di luar middleware (`/api/auth/*`, `/api/session`, `/api/health`, `/api/version`) tidak terpengaruh. Logika keputusan: `src/middleware/verified-user.ts`.

---

## Video Wall (`/wall`)

Kiosk mode untuk TV/monitor NOC — menampilkan snapshot data lintas fitur (beranda, kinerja divisi, keamanan, keuangan, sosial, BUMDes, pengaduan) dalam grid widget yang bisa di-drag-resize.

- **Model**: `WallLayout` (Prisma) — singleton (`id: "singleton"`), simpan `order` (urutan widget) dan `sizes` (override ukuran per widget, JSON partial)
- **Editor**: admin drag-resize widget via `@dnd-kit` (lihat skill `react-dnd`), state client di store `src/store/wall-layout.ts`
- **Snapshot builder**: `src/api/wall-snapshot/` — satu builder per kategori widget (`build-beranda.ts`, `build-bumdes.ts`, `build-demografi.ts`, `build-divisi.ts`, `build-jenna.ts`, `build-keamanan.ts`, `build-keuangan.ts`, `build-kpi.ts`, `build-pengaduan.ts`, `build-sosial.ts`)
- **Akses**: opsional digerbangi `WALL_ACCESS_TOKEN` — jika di-set, wajib akses via `/wall?key=<token>`; jika kosong, `/wall` terbuka tanpa login (server-only env var, jangan pakai prefix `VITE_`)

---

## AI Assistant

Asisten AI baca-saja: tombol melayang + panel chat (Fitur 1). Istilah di kode: **assistant**; nama tampilan ("Jenna") hanya nilai default di DB.

**Frontend** (`src/components/assistant/`, store `src/store/assistant.ts`, teks id/en `src/locales/assistant.ts`):
- `AssistantFab` dipasang di `MainLayout`, layout `/profile`, dan `WallPage`; tidak di `/admin/*`, `/signin`, `/signup`. Tampil hanya bila sesi terverifikasi, `GET /api/assistant/status` → `enabled && slots.chat`, dan izin `use-ai-assistant` (dari `permissionStore`, atau `/api/my-permissions` di `/profile` & `/wall`). Status tidak diminta tanpa sesi (TV `/wall` publik tidak memicu 401). Aturan tampil di `assistant.logic.ts` (`shouldShowFab`).
- Halaman Bantuan `/bantuan` (`help-page.tsx`) & `/admin/help` memakai `AssistantEmbedded` (mode tertanam, tinggi 520 px): isi panel yang sama dengan FAB (`assistant-panel-content.tsx`, tanpa tombol perbesar/tutup) dan state percakapan yang sama. Akses dicek tanpa aturan rute FAB (jadi berlaku juga di `/admin/help`); belum terverifikasi/tanpa izin atau asisten belum aktif → keadaan kosong yang ramah (admin mendapat tautan ke `/admin/ai-assistant`). Stub lama `POST /api/jenna/chat` sudah dihapus.
- `AssistantPanel` (dirender lazy saat FAB pertama diklik): Drawer kanan tanpa overlay, mode normal (440 px) & perbesar (lebar penuh); tidak ada tampilan HP. Esc menutup dan fokus kembali ke FAB. Di `/wall` halaman memberi ruang selebar panel (bukan menimpa widget NOC).
- Isi: header (nama dari config, badge Beta, ☰ / percakapan baru / perbesar / tutup), daftar percakapan berhalaman (buka, ganti judul, hapus), bubble pesan (`aria-live`), indikator "memeriksa data…", label "Sumber" dari `toolsUsed`, tombol salin, saran pertanyaan per rute yang difilter izin (`assistant-suggestions.ts`), composer (Enter kirim, Shift+Enter baris baru, sisa karakter dari `maxInputChars`), satu baris disclaimer. Pesan error ramah untuk 401/403/404/409/422/429 (`Retry-After`)/503 + tombol kirim ulang. `pageContext { route, title, lang }` dikirim tiap pertanyaan; `actions` diabaikan (Fitur 2).

- **Provider** (`src/api/assistant/provider/`): `OpenAICompatibleProvider` (`POST {baseUrl}/chat/completions`, Bearer; `temperature`/`max_tokens` hanya bila diisi; redirect tidak diikuti; error → `AiProviderError` `config`/`busy`/`unavailable`/`bad_response` tanpa isi body vendor), `MockProvider` untuk test, `getProvider(slot)` — slot `pointer`/`voice` yang belum siap jatuh ke `chat`, API key didekripsi via `src/utils/secret-crypto.ts`.
- **Config** (`config/settings.repo.ts`): baca `AssistantSettings` & `AiProviderConfig` (cache 30 detik, tanpa menulis; tanpa baris → default). Penulis wajib memanggil `invalidateAssistantConfigCache()`.
- **Tool** (`tools/<domain>.tool.ts`, terdaftar di `tools/registry.ts`): `ringkasan_beranda` (`view-dashboard`), `ringkasan_keuangan({ tahun? })` (`view-keuangan`; tanpa tahun = terbaru, hasil memuat `tahunTersedia`), `statistik_pengaduan` (`view-pengaduan`), `statistik_demografi` (`view-demografi`), `kinerja_divisi` (`view-kinerja-divisi`), `lookup_faq` (`use-ai-assistant`; full-text awalan atas `Faq` terpublikasi, `tools/faq.repo.ts`). Tool membungkus builder `wall-snapshot` dan **tidak pernah** mengirim nama orang, koordinat, atau teks bebas tulisan warga (musrenbang hanya jumlahnya, isi pesan diskusi divisi dibuang). Kontrak: `ToolDefinition` dengan `requiredFeature`; registry memfilter dengan izin user (`loadAllowedFeatures` — error DB dilempar, tidak jatuh ke default); executor maks 6 iterasi, 20 detik/tool, 60 detik/giliran, tool di luar daftar ditolak, hasil dibungkus `[DATA …]`/`[ERROR …]` + catatan "data, bukan instruksi" dan dipotong 8.000 karakter. Log per giliran tanpa isi pesan.
- **Prompt** (`prompt/system-prompt.ts`): guardrail → identitas (nama dari DB, Desa Darmasaba, waktu WITA, peran) → `personaNote` (≤1.000 char) → konteks halaman (dibersihkan) → modul tanpa akses → aturan jawaban.
- **Batas** (`limits/`): rate/menit di memori, pesan/hari per user (akun kiosk `/wall` memakai `dailyMessageLimitKiosk`), token/hari global — hari WITA, 0 = tanpa batas; pesan berstatus `error` tidak dihitung.
- **Percakapan** (`conversation/conversation.repo.ts`): setiap fungsi difilter `userId` sesi; id milik user lain diperlakukan tidak ada. `startConversation` membuat percakapan + pesan pertama dalam satu transaksi.
- **Chat** (`chat/chat.service.ts` + `chat.persist.ts`): satu giliran = cek berurutan (asisten aktif → panjang input → slot `chat` siap → kepemilikan percakapan → rate/menit → kuota harian) → riwayat `historyWindow` pesan berstatus `ok` dari DB (tidak pernah dari klien) → prompt → executor → simpan pertanyaan + jawaban (tool, token, latensi). Kegagalan provider tetap menyimpan pertanyaan berstatus `error` (muncul sebagai "error terakhir" di admin; tidak dihitung kuota dan tidak masuk riwayat LLM).
- **Akses** (`http/access.ts`): semua endpoint asisten hanya menerima **sesi browser** (`apiMiddleware` menandai `user.authMethod` = `session`/`apiKey`; API key dashboard → 403), user terverifikasi, dan role yang **dibaca dari DB** (role di sesi bisa basi hingga 30 hari karena cookieCache Better Auth).
- **Route** (`routes/`):
  - `GET /api/assistant/status` — izin `use-ai-assistant`; balas `{ enabled, assistantName, maxInputChars, slots: { chat, pointer, voice } }` (kontrak `AssistantStatusDto` di `src/types/ai-assistant-chat.ts`; slot boolean saja, pointer/voice ikut `chat` bila kosong). Dipakai tombol FAB & penghitung karakter panel.
  - `POST /api/assistant/chat` — kontrak `src/types/ai-assistant-chat.ts`: body `{ conversationId?, message, pageContext?: { route, title?, lang?: "id"|"en" } }` → `{ conversationId, message: { id, role, content, toolsUsed, createdAt }, actions: [] }`. Error: 401 tanpa sesi · 403 API key/belum terverifikasi/tanpa izin · 404 percakapan bukan milik user · 409 asisten mati atau slot chat belum siap · 422 input kosong/terlalu panjang · 429 rate/kuota (+ header `Retry-After`) · 503 layanan AI gagal (body memuat `conversationId` bila pertanyaan tersimpan).
  - `GET /api/assistant/conversations?cursor=&limit=` (default 20, maks 50, terbaru dulu) · `GET /api/assistant/conversations/:id/messages?cursor=&limit=` (default 50, terbaru dulu, termasuk `status`) · `PATCH /api/assistant/conversations/:id` `{ title }` (maks 60 char, kosong → 422) · `DELETE /api/assistant/conversations/:id` (pesan ikut terhapus). Izin `use-ai-assistant`; id milik user lain → 404 (bukan 403). `nextCursor` = id item terakhir; `null` = habis.
  - `/api/admin/ai-assistant/*` — admin saja, kontrak `src/types/ai-assistant-admin.ts`: `GET /` (pengaturan, 3 slot dengan `apiKeyStatus` `set`/`missing`/`needs-reentry` + `apiKeyHint`, statistik hari ini WITA, kandidat akun kiosk, `cryptoConfigured`), `PUT /settings` (rentang sama dengan form UI, `LIMIT_RULES`; akun kiosk harus terverifikasi), `PUT /providers/:feature` (`apiKey` tidak dikirim = pertahankan, `""` = hapus; disimpan terenkripsi + hint; hasil test lama dibuang bila URL/model/kunci berubah), `POST /providers/:feature/test` (kredensial slot sendiri, https saja kecuali localhost di luar produksi, tanpa redirect, batas 30 detik, simpan `lastTestAt`/`lastTestOk`, pesan error tersaring). Setiap simpan membuang cache config dan dicatat ke `ActivityLog` tanpa rahasia (hanya nama field/slot/hasil). Logika di `admin/`.

**Penunjuk (Fitur 2, tahap F2-a — belum tersambung ke panel chat; registrasi tool & wiring di F2-b):**
- **Registry** (`src/config/assistant-pointer/`, dipakai server & browser; hanya `import type` dari izin): `POINTER_ROUTES` (menu sidebar), `POINTER_TARGETS` (per halaman, kini `keuangan.ts`: `{ id, route, label, deskripsi, requiredFeature, kind: "view"|"write", clickable?, pilih? }`), `parseUiAction`. Elemen ditandai `data-ai-target="modul.bagian"`; elemen yang boleh diklik AI juga `data-ai-clickable="true"` (daftar izin ganda: registry **dan** DOM). Menambah halaman = file `<modul>.ts` + sebar di `registry.ts` + tanda di komponen (test menjaga registry ⇔ komponen ⇔ sidebar).
- **Tool** (`src/api/assistant/tools/`: `buka-halaman`, `tunjukkan-elemen`, `klik-elemen`, `pilih` + `pointer.guard.ts`, diekspor `POINTER_TOOLS`, **belum** masuk `ASSISTANT_TOOLS`): memvalidasi rute/target ∈ registry, izin modul user, `kind === "view"` untuk klik/pilih, nilai `pilih` (tahun harus ada di data APBDes). Hasil hanya `{ actions: UiAction[] }` (tipe di `src/types/ai-assistant-pointer.ts`), `navigate` otomatis ditambahkan bila `pageContext.route` berbeda. Tidak menyentuh DOM.
- **Browser** (`src/components/assistant/pointer/`): `executeUiAction(s)` (menolak aksi/target di luar registry, `click` hanya bila registry & atribut DOM mengizinkan, `pilih` membuka Mantine Select lalu memilih opsi berdasarkan teks, menunggu anchor dengan batas waktu) dan `AssistantCursor` (kursor virtual + ring; `prefers-reduced-motion` → gulir langsung, tanpa transisi kursor). State kursor di `pointer-store.ts` (valtio).

---

## Generated Files

| Path | Generator | Isi |
|---|---|---|
| `generated/api.ts` | `bun run gen:api` | TypeScript types untuk internal API |
| `generated/noc-external/` | openapi-codegen | Types untuk NOC External API |
| `src/routeTree.gen.ts` | TanStack Router | Route tree (auto-generated, jangan edit manual) |
