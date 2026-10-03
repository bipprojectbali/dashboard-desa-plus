# 06b — Fitur 3 Suara, Tahap S2: kontrol sesi lengkap, diagnostik admin, metrik kepatuhan

> **Status: DISETUJUI user 2026-10-03 (#57)** — semua saran Q1–Q9 diterima; kuota kiosk **tetap 60 menit/hari**. Belum ada kode; S2 dikerjakan setelah S1 di-merge. Disusun 2026-10-03 (task_85e56600e424).
> Rujukan: `06-fitur-3-suara.md` v3 §5.2 (lingkup S2), keputusan #47 (menit nyata), #53, #54–#56,
> `discus/metrik-kepatuhan-ai.md` (M1–M4, disetujui #56), handoff FOREVIA §13 (`idea/JENNA_DEVELOPER_HANDOFF_CROSS_PROJECT_2026-10-02.md`),
> `idea/compare-forevia-vs-dashboard-desa.md`.
>
> Tanda **[S1]** = bagian yang bergantung pada rancangan/kode S1 final (branch `feature/ai-voice-s1`, belum di-merge).
> Isi S1 di bawah dibaca dari branch itu per 2026-10-03; bila S1 berubah sebelum merge, bagian bertanda [S1] disesuaikan.

---

## 1. Lingkup

**Masuk S2:**
1. Batas **total** sesi suara bersamaan (default **3**, diatur admin) + reservasi atomik (tidak bisa jebol karena dua klik bersamaan).
2. **State machine** sesi lengkap: `starting → active → closing → selesai`, plus `startup_failed` dan `startup_uncertain` (adaptasi FOREVIA).
3. **Sweeper** (job tiap ±10 detik): menutup sesi yang heartbeat-nya mati, sesi `starting` yang macet, dan menyelesaikan `closing`.
4. **Perpanjangan sesi manual** dengan batas jumlah perpanjangan dan tetap tunduk kuota harian.
5. **Diagnostik admin hanya-baca** di `/admin/ai-assistant`: daftar sesi + log tahap tanpa PII.
6. **Metrik kepatuhan M1–M4** (#56): endpoint penutupan giliran, tabel penanda tanpa teks, kartu "Kualitas jawaban", ambang peringatan, retensi 90 hari.
7. **§Biaya** — harga resmi OpenAI per 2026-10-03 + perkiraan biaya (§12).

**Tidak masuk S2:** M5/M6 (menyusul, #56), notifikasi email/Telegram, admin membuka percakapan user (#56 Q4 = tidak),
mode kiosk/TV khusus (lihat 06 v3), V2 fallback (STT+TTS), suara di HP.

### 1.1 Yang dianggap sudah ada dari S1 [S1]

| Hal | Isi di S1 (branch `feature/ai-voice-s1`) |
|---|---|
| Tabel sesi | `assistant_voice_session`: `id, userId, status (default 'starting'), startedAt, lastHeartbeatAt, endedAt, billedSeconds, extendedSeconds, endReason`; index `(userId, startedAt)`, `status` |
| Status dipakai | `starting`, `active`, `ended`, `failed`; sesi terbuka = `starting`/`active` |
| 1 sesi per user | insert lalu `findOpenSessions` — yang tertua menang, sisanya `failed`/`duplicate` (tidak atomik, **tanpa batas total**) |
| Heartbeat | tiap 15 dtk; basi setelah 45 dtk; dibereskan **malas** (saat user mulai sesi baru) dan ditagih sampai heartbeat terakhir |
| Menit nyata (#47) | `billedSeconds` dihitung server; kuota harian per WITA (`voiceDailyMinutesUser` 60, `voiceDailyMinutesKiosk` 60) → 429 + `secondsUntilResetWita` |
| Perpanjangan | `POST /voice/sessions/:id/extend` (+60 dtk, `VOICE_EXTEND_SECONDS`), **tanpa batas jumlah** |
| Izin | `use-ai-voice` (admin & user) |
| Endpoint | `POST /voice/consent`, `POST /voice/sessions`, `/:id/heartbeat`, `/:id/extend`, `/:id/close` (idempoten) |
| Yang **belum** ada | ID sesi penyedia (`session.id` OpenAI) tidak disimpan → server tidak bisa hangup; tidak ada `closing`/`startup_uncertain`; tidak ada log tahap; tidak ada metrik |

---

## 2. State machine sesi

### 2.1 Status

| Status (nama FOREVIA) | Nilai di DB (usul) | Arti | Terhitung "terbuka"? |
|---|---|---|---|
| starting | `starting` | Slot sudah direservasi, sesi penyedia belum dibuat / belum ada `session.id` | ya |
| active | `active` | Sesi penyedia dibuat, `providerSessionId` tersimpan, klien terhubung | ya |
| closing | `closing` | Penutupan diminta server (sweeper/kuota/admin nonaktifkan) — menunggu konfirmasi hangup | ya (masih mungkin memakan biaya) |
| hangup_accepted | `ended` | Selesai: klien mengonfirmasi `session.closed`, **atau** hangup server diterima, **atau** batas coba habis | tidak |
| startup_failed | `failed` | Pembuatan sesi **pasti** ditolak (penyedia menjawab error HTTP) | tidak |
| startup_uncertain | `startup_uncertain` | Permintaan create terkirim tetapi jawabannya tidak diketahui (timeout/jaringan putus) — sesi penyedia **mungkin** ada | ya, **khusus user itu** (memblokir sesi baru user tsb) |

Usul: **pakai ulang nilai S1** `ended` dan `failed` (tidak perlu migrasi data S1), tambah `closing` dan `startup_uncertain`.
`endReason` membedakan penyebab (lihat 2.3). Lihat pertanyaan Q2.

### 2.2 Transisi

| Dari | Ke | Pemicu | Pelaku |
|---|---|---|---|
| — | `starting` | reservasi lolos (§3) | `POST /voice/sessions` |
| `starting` | `active` | create penyedia sukses, `providerSessionId` disimpan | idem |
| `starting` | `failed` | penyedia menjawab error HTTP (4xx/5xx dengan body) | idem |
| `starting` | `startup_uncertain` | timeout/jaringan putus setelah request terkirim; **atau** `starting` > 90 dtk (server crash di tengah) | endpoint / sweeper |
| `startup_uncertain` | `failed` (`uncertain_cleared`) | > 120 dtk sejak mulai (klien pasti tidak pernah dapat kredensial, lihat 2.4) | sweeper |
| `active` | `ended` | klien `POST /close` setelah `session.closed` (alur normal) | klien |
| `active` | `closing` | heartbeat mati > 45 dtk, lewat batas durasi, kuota habis, asisten/slot dinonaktifkan | sweeper / heartbeat |
| `closing` | `ended` | hangup diterima (2xx) atau penyedia bilang sesi sudah tidak ada (404) atau klien kebetulan `POST /close` | sweeper / klien |
| `closing` | `ended` (`hangup_unconfirmed`) | 3× gagal hangup (jeda ≥ 60 dtk) — penyedia akan memutus sendiri lewat batas durasi (`expired`) | sweeper |

Status akhir (`ended`, `failed`) **tidak pernah** berubah lagi. Semua transisi memakai `updateMany where status = <asal>`
(compare-and-set) supaya sweeper dan klien yang bersamaan tidak saling timpa; yang kalah cukup diabaikan (idempoten).

**Larangan (dari FOREVIA):** `startup_uncertain` **tidak boleh** memicu create ulang otomatis — create tidak idempoten.

### 2.3 `endReason` (gabungan S1 + baru)

- Dari klien (S1): `user`, `idle`, `max_duration`, `quota`, `error`, `page_hidden`.
- Baru dari server: `heartbeat_lost`, `assistant_disabled`, `start_failed`, `duplicate` (S1, hilang setelah reservasi atomik), `uncertain_cleared`, `hangup_unconfirmed`.
- Alasan penyedia (dari `session.closed.reason`, dikirim klien saat `/close`, disimpan terpisah di `providerCloseReason`): `close_requested`, `expired`, `content`, `remote_hangup`, `connection_lost`.

### 2.4 Kenapa `startup_uncertain` boleh dibereskan otomatis (beda dengan FOREVIA)

Di FOREVIA (SIP) penyedia bisa tetap menelepon walau server tidak tahu. Di kita (WebRTC), kredensial/SDP baru sampai ke
browser **setelah** create sukses dijawab ke server. Bila jawaban hilang, browser tidak pernah tersambung → sesi penyedia
(kalau terlanjur dibuat) tidak dipakai dan akan berakhir sendiri. Risiko biayanya ≈ tagihan awal 15 dtk ($0,0125, perlu
dikonfirmasi apakah tetap ditagih bila tidak pernah tersambung). Karena itu usul: sweeper membereskan otomatis setelah 120 dtk
dan mencatat di log tahap; admin cukup melihat jumlahnya. **[S1]** Bergantung pada cara `openLiveSession` S1 menyerahkan
kredensial ke browser — bila ternyata browser membuat sesi sendiri dengan token sementara, aturan ini ditinjau ulang.

---

## 3. Reservasi atomik & batas sesi bersamaan

Mengganti pola S1 "insert lalu buang duplikat". Satu transaksi Postgres pendek, **tanpa** panggilan HTTP di dalamnya:

```
BEGIN
  SELECT pg_advisory_xact_lock(<konstanta VOICE_RESERVATION_LOCK>)   -- satu desa = satu kunci global
  bereskan sesi basi user ini (heartbeat > 45 dtk)                  -- sama seperti releaseStale S1
  hitung sesi terbuka user ini (starting/active/closing/startup_uncertain)
      ≥ 1  → 409 voice_session_active (atau voice_session_uncertain bila startup_uncertain)
  hitung sesi terbuka SEMUA user (starting/active/closing)
      ≥ voiceMaxSessionsTotal → 429 voice_capacity_full
  cek kuota harian WITA → 429 voice_quota_exhausted (+ secondsUntilResetWita)
  INSERT status 'starting'
COMMIT
→ di luar transaksi: create sesi penyedia (timeout 15 dtk) → active / failed / startup_uncertain
```

- Kunci advisory dilepas otomatis saat COMMIT/ROLLBACK; transaksi hanya berisi query lokal (milidetik).
- Prisma: `prisma.$transaction(async (tx) => { await tx.$executeRaw\`SELECT pg_advisory_xact_lock(...)\`; ... })`.
- `startup_uncertain` **tidak** dihitung ke batas total (tidak ada browser yang memakainya), tetapi memblokir user pemiliknya.
- `closing` **dihitung** ke batas total (sesi penyedia mungkin masih jalan dan masih ditagih).
- Setting baru `voiceMaxSessionsTotal` (Int, default 3, rentang 1–20). Batas per user tetap konstanta 1 (#53), bukan setting.
- Kode error baru: `voice_capacity_full` (pesan UI: "Semua jalur suara sedang dipakai, coba lagi sebentar lagi"),
  `voice_session_uncertain` ("Sesi sebelumnya belum selesai dibereskan, coba lagi dalam 2 menit").

---

## 4. Sweeper

File baru `src/jobs/assistant-voice-sweeper.ts`, didaftarkan di `src/index.ts` di sebelah `startAssistantRetentionScheduler`.

- Interval **10 dtk** (`VOICE_SWEEP_INTERVAL_MS`). Tiap putaran dibungkus `pg_try_advisory_lock(VOICE_SWEEPER_LOCK)`;
  bila gagal (instance lain sedang jalan) putaran dilewati → aman bila suatu saat ada >1 proses.
- Logika keputusan dipisah sebagai **fungsi murni** `planSweep(sessions, settings, now)` → daftar aksi, supaya bisa dites tanpa DB.
- Langkah per putaran (semua compare-and-set, batasi 50 baris per langkah):
  1. `active` dengan `lastHeartbeatAt` < now − 45 dtk → `closing` (`heartbeat_lost`), `billedSeconds` = sampai heartbeat terakhir (sama dengan S1).
  2. `active` yang melewati `voiceSessionMaxMinutes` + `extendedSeconds` + toleransi 30 dtk → `closing` (`max_duration`).
  3. `active` milik user yang kuota hari ini (WITA) sudah habis → `closing` (`quota`). (Heartbeat S1 sudah menangani ini bila klien hidup; sweeper menutup celah klien mati.)
  4. Asisten/slot suara dinonaktifkan admin → semua `active` → `closing` (`assistant_disabled`).
  5. `closing`: bila ada `providerSessionId` dan (`lastHangupAt` kosong atau ≥ 60 dtk lalu) → panggil hangup penyedia;
     2xx/404 → `ended`; gagal → `hangupAttempts + 1`; setelah 3 kali → `ended` (`hangup_unconfirmed`).
  6. `starting` > 90 dtk → `startup_uncertain`.
  7. `startup_uncertain` > 120 dtk sejak `startedAt` → `failed` (`uncertain_cleared`).
- Hangup penyedia: `POST /v1/live/sessions/{session_id}/hangup`. Referensi resmi menyebut endpoint ini untuk "End a SIP call";
  alasan `close_requested` di panduan menyebut endpoint hangup secara umum. **Perlu dikonfirmasi** bahwa endpoint ini juga
  menutup sesi WebRTC. Cadangan: kontrol server lewat sideband `wss://api.openai.com/v1/live/sessions/{session_id}/attach`
  lalu kirim `session.close`. Bila keduanya tidak bisa, sesi penyedia berhenti sendiri pada batas durasinya (`expired`) —
  biaya terburuk = sisa durasi sesi (≤ 10 menit = $0,50).
- Yang dipanggil hangup hanya server (kunci API di server). Waktu tunggu HTTP 15 dtk; jangan pernah log kunci/headers.
- Lazy release S1 tetap dipertahankan (pertahanan lapis kedua); keduanya idempoten.

---

## 5. Perpanjangan sesi manual

S1 sudah punya `POST /:id/extend` (+60 dtk). S2 menambah aturan di server:

- Setting baru `voiceMaxExtensions` (Int, default **2**, 0 = mati). Lewat batas → 409 `voice_extend_limit`.
- Perpanjangan ditolak bila sisa kuota harian < 60 dtk → 429 `voice_quota_exhausted`.
- Hanya untuk status `active`; kolom baru `extensionCount` (Int, default 0) dinaikkan dalam compare-and-set yang sama.
- UI **[S1]**: tombol "Perpanjang 1 menit" muncul 30 dtk sebelum batas durasi (bila S1 belum punya, ditambah di S2),
  hilang bila batas tercapai, dengan teks sisa perpanjangan ("tersisa 1 kali").
- Tiap perpanjangan dicatat di log tahap (`extended`).

---

## 6. Diagnostik admin (hanya-baca)

### 6.1 Log tahap tanpa PII

Tabel baru `assistant_voice_event`:

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | TEXT PK | cuid |
| `sessionId` | TEXT FK → `assistant_voice_session.id` ON DELETE CASCADE | |
| `stage` | TEXT | daftar tetap (di bawah) |
| `code` | TEXT NULL | kode error/alasan, dari daftar tetap — **tidak pernah** pesan mentah dari penyedia |
| `latencyMs` | INT NULL | mis. lama create penyedia |
| `createdAt` | TIMESTAMP(3) | index `(sessionId, createdAt)`, `(createdAt)` |

Tahap: `reserved`, `reserve_rejected`, `provider_create_ok`, `provider_create_failed`, `provider_create_uncertain`, `activated`,
`extended`, `heartbeat_lost`, `close_requested`, `hangup_ok`, `hangup_failed`, `closed`, `uncertain_cleared`,
`client_error` (kode dari klien, daftar tetap: `mic_denied`, `ice_failed`, `connection_lost`, `datachannel_failed`, `unknown`).

Tidak ada: teks ucapan, isi pesan, IP, user agent, email, nama. Penolakan reservasi tidak punya baris sesi (tidak bisa
memakai FK), jadi `reserve_rejected` dicatat di log server (`logger.info` dengan kode, tanpa userId) dan bila disetujui
ditampilkan sebagai angka "ditolak hari ini" (lihat Q5).

### 6.2 Tampilan di `/admin/ai-assistant` (tab baru "Suara")

- Ringkasan: **sesi aktif sekarang n / batas**, menit terpakai hari ini (WITA), sesi gagal & tak pasti hari ini.
- Daftar sesi (paginasi 20/halaman, filter status & tanggal): user (nama tampilan — lihat Q4), mulai (WITA), durasi tertagih,
  perpanjangan, status, `endReason`, `providerCloseReason`.
- Klik baris → linimasa log tahap (6.1). **Tanpa** tautan ke percakapan (#56 Q4).
- Hanya-baca: tidak ada tombol tutup paksa di S2 (sweeper yang menutup). Lihat Q3.
- Hak akses: endpoint di bawah prefix `/admin/ai-assistant` yang sudah ada (guard admin sama dengan halaman lain).

---

## 7. Metrik kepatuhan M1–M4 (#56)

### 7.1 Sumber & kapan dihitung

| Metrik | Kanal | Sumber teks | Dihitung saat |
|---|---|---|---|
| M1 angka berubah | suara | transkrip ucapan GPT-Live (dari klien) vs teks Claude giliran itu (di server) | `POST /voice/sessions/:id/turns` |
| M2 nama vendor | suara + chat | suara: transkrip ucapan; chat & suara: teks Claude | turns (ucapan) + akhir stream chat (teks Claude) |
| M3 jawab sendiri | suara | transkrip ucapan + flag `delegated` dari klien | turns |
| M4 pola data pribadi | suara + chat | idem M2 | idem M2 |

- Penutupan giliran: klien mengirim **setelah** respons asisten selesai diucapkan (event transkrip ucapan asisten selesai):
  `POST /assistant/voice/sessions/:id/turns` body
  `{ turnId, messageId | null, delegated: boolean, assistantTranscript: string (≤ 4000 karakter) }`.
  - `delegated` = klien melihat `session.delegation.created` pada giliran itu; `messageId` = pesan asisten Claude yang dihasilkan (null bila tidak ada delegasi).
  - Server memeriksa: sesi milik user & berstatus `active`/`closing`; `messageId` (bila ada) milik percakapan user dan `modality = voice`; `turnId` unik per sesi (idempoten, kirim ulang tidak menggandakan).
  - **Transkrip tidak disimpan dan tidak di-log** (hanya dihitung di memori lalu dibuang). Body route dikecualikan dari log request.
- Pencocok angka & pemformat angka lisan dari S0 (`src/components/assistant/voice-lab/voice-lab.verify.ts`,
  `voice-lab.spoken-numbers.ts`) dipindah ke modul bersama yang bisa dipakai server dan klien (mis. `src/lib/voice/`). **[S1]** bila S1 sudah memindahkannya, dipakai apa adanya.
- M2 & M4 chat: dihitung di akhir stream chat (setelah teks Claude final tersimpan), tanpa panggilan AI tambahan.

### 7.2 Aturan deteksi

- **M1**: ambil angka & nama dari teks Claude **setelah** diubah ke bentuk lisan (#53: ≥ 1 juta disingkat, "sekitar" bila nilai berubah);
  cocokkan dengan transkrip ucapan. Simpan `matched/total`. Bila teks Claude tidak berisi angka → tidak ada baris M1 (tidak masuk penyebut).
  Giliran ditandai bila `matched < total`.
- **M2**: daftar istilah dari setting `complianceVendorTerms` (default: OpenAI, ChatGPT, GPT, Anthropic, Claude, Gemini, Google AI),
  cocok tanpa beda huruf besar/kecil dan per kata utuh. Disimpan: istilah dari daftar itu saja.
- **M3**: `delegated = false` dan ucapan asisten > **12 kata** (`M3_MIN_WORDS`, konstanta) → ditandai. Basa-basi pendek ("Baik, sebentar ya") tidak terhitung.
- **M4**: regex NIK (16 digit berurutan, boleh dipisah spasi/titik), nomor HP Indonesia (`08…`/`+62…`, 10–13 digit), email.
  Disimpan **hanya jenis**: `nik` / `phone` / `email`.

### 7.3 Tabel penanda

Tabel baru `assistant_compliance_flag` (satu baris per metrik per giliran; tanpa teks percakapan):

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | TEXT PK | |
| `channel` | TEXT | `voice` / `chat` |
| `metric` | TEXT | `M1`–`M4` |
| `flagged` | BOOLEAN | melanggar atau tidak |
| `matched`, `total` | INT NULL | khusus M1 |
| `term` | TEXT NULL | M2: istilah vendor dari daftar; M4: `nik`/`phone`/`email` |
| `voiceSessionId` | TEXT NULL FK ON DELETE SET NULL | |
| `messageId` | TEXT NULL FK ON DELETE SET NULL | pesan bisa terhapus oleh retensi percakapan |
| `turnId` | TEXT NULL | unik bersama `voiceSessionId`+`metric` (idempoten) |
| `createdAt` | TIMESTAMP(3) | index `(metric, createdAt)`, `(createdAt)` |

- Baris ditulis untuk **semua** giliran suara bagi M1 (bila ada angka) dan M3 (penyebut %), sedangkan M2/M4 hanya ditulis saat **terjadi**.
- Tidak ada `userId` (privasi #56). Admin tidak bisa melompat ke percakapan.

### 7.4 Kartu "Kualitas jawaban" & ambang

- Di `/admin/ai-assistant` (tab Ringkasan), pilihan **7 / 30 hari** (hari WITA):
  M1 % giliran suara berangka yang berubah; M2 jumlah kejadian (+ istilah terbanyak); M3 % giliran suara jawab sendiri; M4 jumlah kejadian per jenis (harus 0).
- Peringatan (dihitung saat kartu dimuat, tanpa job):
  - **M1**: > 5% dari **50 baris M1 terakhir** (giliran suara berangka) — butuh minimal 50 baris; bila kurang tampil "data belum cukup" (#53).
  - **M2, M4**: setiap kejadian → lencana merah berisi jumlah & waktu terakhir.
  - M3: tanpa ambang di S2 (tampil angka saja) — lihat Q6.
- Tidak ada notifikasi email/Telegram.
- Konstanta bernama: `M1_ALERT_RATE = 0.05`, `M1_ALERT_WINDOW = 50`, `M3_MIN_WORDS = 12`.

### 7.5 Retensi

- `COMPLIANCE_RETENTION_DAYS = 90` (konstanta, **terpisah** dari `retentionDays` percakapan yang bisa 0 = selamanya).
- Job `src/jobs/assistant-retention.ts` (harian 04:00) diperluas: hapus `assistant_compliance_flag` dan `assistant_voice_event`
  lebih tua dari 90 hari, juga `assistant_voice_session` berstatus akhir > 90 hari (event ikut terhapus lewat cascade). Lihat Q7.
- Log jumlah baris terhapus saja.

---

## 8. Perkiraan perubahan teknis

### 8.1 Schema + migration (satu file, idempoten)

- `assistant_voice_session`: tambah `providerSessionId TEXT NULL`, `providerCloseReason TEXT NULL`, `providerBilledSeconds INT NULL`
  (dari `usage.seconds` final yang dilaporkan klien — hanya untuk rekonsiliasi, **bukan** dasar kuota), `extensionCount INT NOT NULL DEFAULT 0`,
  `hangupAttempts INT NOT NULL DEFAULT 0`, `lastHangupAt TIMESTAMP(3) NULL`. Semua `ADD COLUMN IF NOT EXISTS`; kolom NOT NULL punya DEFAULT.
- Index baru `(status, lastHeartbeatAt)` untuk sweeper (`CREATE INDEX IF NOT EXISTS`).
- `assistant_settings`: `voiceMaxSessionsTotal INT NOT NULL DEFAULT 3`, `voiceMaxExtensions INT NOT NULL DEFAULT 2`,
  `complianceVendorTerms TEXT[] NOT NULL DEFAULT ARRAY[...]`.
- Tabel baru `assistant_voice_event`, `assistant_compliance_flag` (`CREATE TABLE IF NOT EXISTS`, FK lewat blok `DO $$ ... pg_constraint` seperti S1).
- Nilai status baru tidak butuh migrasi (kolom TEXT). Komentar migration menjelaskan **kenapa** (reservasi atomik, hangup server, metrik #56).

### 8.2 Endpoint

| Method & path | Baru/Ubah | Isi |
|---|---|---|
| `POST /assistant/voice/sessions` | ubah | reservasi atomik §3, simpan `providerSessionId`, `startup_uncertain` |
| `POST /assistant/voice/sessions/:id/extend` | ubah | batas `voiceMaxExtensions`, cek kuota |
| `POST /assistant/voice/sessions/:id/close` | ubah | terima `providerUsageSeconds`, `providerCloseReason`, `clientError` (opsional, enum) |
| `POST /assistant/voice/sessions/:id/turns` | baru | penutupan giliran → M1–M4 suara |
| `GET /admin/ai-assistant/voice/summary` | baru | aktif/batas, menit hari ini, gagal/tak pasti hari ini |
| `GET /admin/ai-assistant/voice/sessions?status&from&to&page` | baru | daftar sesi berpaginasi |
| `GET /admin/ai-assistant/voice/sessions/:id/events` | baru | log tahap |
| `GET /admin/ai-assistant/compliance/summary?days=7\|30` | baru | angka kartu + status peringatan |
| `PATCH` setting admin yang ada | ubah | 3 field setting baru + validasi rentang |

### 8.3 Job & modul (perkiraan file, mengikuti batas ukuran file)

- `src/jobs/assistant-voice-sweeper.ts` (penjadwal) + `src/api/assistant/voice/voice.sweep.ts` (`planSweep` murni + eksekutor).
- `src/api/assistant/voice/voice.reservation.ts` (transaksi §3), `voice.hangup.ts` (panggilan hangup), `voice.events.repo.ts`.
- `src/api/assistant/compliance/` — `compliance.detect.ts` (M1–M4 murni), `compliance.repo.ts`, `compliance.summary.ts`.
- `src/api/assistant/routes/voice-admin.route.ts`, `compliance-admin.route.ts`.
- Modul bersama angka lisan (§7.1).
- Perluasan `src/jobs/assistant-retention.ts`.

### 8.4 Komponen admin & klien

- `src/components/admin/ai-assistant/voice/` — `VoiceSummaryCards.tsx`, `VoiceSessionTable.tsx`, `VoiceSessionTimeline.tsx`.
- `src/components/admin/ai-assistant/ComplianceCard.tsx`.
- Form setting: 3 field baru.
- Klien suara **[S1]**: kirim `session.close` + tunggu `session.closed` (≤ 5 dtk) sebelum `/close`; kirim `/turns` per giliran;
  kirim `clientError`; tombol perpanjang; pesan untuk `voice_capacity_full` / `voice_session_uncertain` / `voice_extend_limit`.

---

## 9. Test

Runner `bun:test`. Test DB (`tests/db/`, `bun run test:db`) memakai `TEST_DATABASE_URL`, memanggil `assertTestDatabase()`, menghapus data sendiri.

| Area | Lokasi | Kasus utama |
|---|---|---|
| Balapan reservasi | `tests/db/assistant-voice-reservation.test.ts` | 2 start bersamaan (`Promise.all`) user sama → tepat 1 sukses, 1 `voice_session_active`; 4 user berbeda, batas 3 → 3 sukses, 1 `voice_capacity_full`; 10 start acak → jumlah terbuka tidak pernah > batas; `closing` ikut terhitung; `startup_uncertain` hanya memblokir pemiliknya |
| Reservasi + kuota | idem | kuota habis di dalam lock → 429, tidak ada baris `starting` tersisa |
| Sweeper murni | `tests/api/assistant/voice-sweep.test.ts` | `planSweep` dengan `now` disuntik: heartbeat 44 vs 46 dtk; max durasi + perpanjangan + toleransi; `starting` 89 vs 91 dtk; `startup_uncertain` 119 vs 121 dtk; jeda hangup 59 vs 60 dtk; 3× gagal → `hangup_unconfirmed`; status akhir tidak disentuh |
| Sweeper DB | `tests/db/assistant-voice-sweeper.test.ts` | satu putaran memindahkan status benar; dua putaran bersamaan tidak dobel aksi (advisory lock); hangup ditiru (mock fetch) 2xx/404/500 |
| Batas hari WITA | `tests/api/assistant/voice-wita.test.ts` + DB | 15:59:59 UTC (23:59:59 WITA) vs 16:00:00 UTC (00:00 WITA) → kuota reset; sesi mulai 23:58 WITA dihitung ke hari mulainya **[S1: cara S1 menghitung sesi lintas tengah malam]**; jendela kartu 7/30 hari memakai hari WITA |
| Close idempoten | DB | `/close` dua kali; `/close` setelah sweeper sudah `closing`/`ended`; balapan sweeper vs klien → satu pemenang, `billedSeconds` tidak dobel |
| Perpanjangan | DB | ke-3 ditolak bila batas 2; ditolak bila sisa kuota < 60 dtk; bukan `active` → 409 |
| Deteksi M1–M4 | `tests/api/assistant/compliance-detect.test.ts` | angka lisan ("1,3 juta", "sekitar") cocok; angka berubah terdeteksi; tanpa angka → tidak ada baris; vendor per kata utuh ("GPT" ya, "gptx" tidak); M3 12 vs 13 kata, `delegated=true` tidak ditandai; NIK/HP/email terdeteksi, simpan jenis saja |
| Transkrip tidak tersimpan | DB | setelah `/turns`, tidak ada kolom/baris berisi transkrip; logger (spy) tidak menerima transkrip |
| `/turns` idempoten & kepemilikan | DB | `turnId` sama dua kali → satu set baris; sesi user lain → 404; `messageId` bukan milik user → 403/404 |
| Ringkasan & ambang | DB | 49 baris → "data belum cukup"; 50 baris, 3 ditandai (6%) → peringatan; 2 (4%) → tidak; M2/M4 satu kejadian → lencana |
| Retensi | `tests/api/assistant/retention.test.ts` (perluas) | cutoff 90 hari; `retentionDays = 0` percakapan tidak mempengaruhi retensi metrik |
| Auth guard | `tests/api/assistant/voice-admin.test.ts` | tanpa auth → 401; endpoint admin untuk non-admin → 403 (pola `tests/api/sosial.test.ts`) |

Gerbang: `bun run verify` dan `bun run test:db` = 0 gagal.

---

## 10. Kriteria selesai

1. Tidak mungkin ada > `voiceMaxSessionsTotal` sesi terbuka atau > 1 per user, dibuktikan test balapan.
2. Semua status §2 dipakai; tidak ada sesi tertinggal `starting`/`active`/`closing` > 3 menit setelah browser ditutup paksa.
3. Server memanggil hangup penyedia untuk sesi yang ditutup server (atau tercatat `hangup_unconfirmed` bila endpoint tidak mendukung WebRTC).
4. Perpanjangan dibatasi jumlah & kuota.
5. Admin melihat sesi aktif/batas, daftar sesi, dan linimasa tahap — tanpa teks percakapan atau PII.
6. Kartu "Kualitas jawaban" menampilkan M1–M4 7/30 hari + peringatan sesuai ambang; tidak ada transkrip tersimpan.
7. Retensi 90 hari jalan di job harian.
8. Migration idempoten (dijalankan 2× tanpa error), `bun run verify` + `bun run test:db` hijau, `CHANGELOG.md` diisi saat deploy.

---

## 11. Uji manual (laptop/desktop)

1. Batas 3: buka sesi suara dari 3 akun berbeda → sesi ke-4 (akun ke-4) mendapat pesan "Semua jalur suara sedang dipakai".
2. Tab kedua akun sama → ditolak (S1), lalu tutup tab pertama → tab kedua bisa mulai setelah ≤ 1 menit.
3. Matikan Wi-Fi saat sesi berjalan → dalam ±1 menit admin melihat status `closing`/`ended` (`heartbeat_lost`); menit tertagih berhenti di heartbeat terakhir.
4. Tutup paksa browser → sama seperti no. 3; cek di dashboard OpenAI bahwa sesi tidak berjalan sampai batas durasi (verifikasi hangup).
5. Perpanjang 2× → tombol hilang; percobaan ke-3 lewat API ditolak.
6. Nonaktifkan asisten di admin saat sesi berjalan → sesi tertutup dengan `assistant_disabled`.
7. Ajukan pertanyaan berangka ("berapa total APBDes 2026") → kartu M1 bertambah satu giliran; tanyakan "kamu pakai model apa?" → bila Jenna menyebut vendor, M2 tercatat.
8. Admin membuka linimasa sesi → hanya tahap, kode, latensi; tidak ada teks.
9. Cek DB: tabel `assistant_compliance_flag` tidak berisi kalimat apa pun.

---

## 12. §Biaya — harga resmi OpenAI & perkiraan

### 12.1 Harga (diakses 2026-10-03)

| Model | Harga | Sumber |
|---|---|---|
| `gpt-live-1` (V1-B, telinga & mulut) | **$0,05 per menit sesi aktif**, ditagih per detik (tidak dibulatkan ke atas); tarif tunggal — audio masuk & keluar **tidak** dihitung terpisah | https://developers.openai.com/api/docs/models/gpt-live-1 ; https://developers.openai.com/api/docs/pricing |
| `gpt-live-transcribe` | $0,017 / menit | https://developers.openai.com/api/docs/pricing |
| `gpt-realtime-whisper` | $0,017 / menit | idem |
| `gpt-transcribe` | $0,0045 / menit | idem |
| `gpt-4o-transcribe` / `gpt-4o-mini-transcribe` | $0,006 / $0,003 per menit | idem |
| `gpt-4o-mini-tts` | input teks $0,60 / 1 jt token; **output audio $12,00 / 1 jt token** (per menit tidak tercantum; ±$0,015/menit = **perlu dikonfirmasi**) | idem |
| `tts-1` | $15 / 1 jt karakter | idem |
| `gpt-realtime-2.1` (pembanding) | audio $32 masuk / $64 keluar; teks $4 / $24 per 1 jt token | idem |
| `gpt-realtime-2.1-mini` (pembanding) | audio $10 / $20; teks $0,60 / $2,40 per 1 jt token | idem |

Fakta penagihan `gpt-live-1` (https://developers.openai.com/api/docs/guides/voice-latency-cost?api=live,
https://developers.openai.com/api/docs/guides/live-conversations):
- Yang ditagih = **waktu sesi aktif**: saat user bicara, asisten bicara, **keduanya diam**, atau backend bekerja. **Mute mikrofon tidak menghentikan tagihan** → menutup sesi saat idle adalah satu-satunya penghemat (S1: auto-off 120 dtk).
- `POST /v1/live/sessions` menagih 15 dtk saat inisialisasi; dikreditkan bila sesi berjalan (bukan tambahan).
- Pemakaian resmi: `usage.seconds` kumulatif di `session.usage.updated` (jangan dijumlah) dan nilai final di `session.closed`.
- Delegasi ke backend: "Backend model and tool usage is billed separately" — di kita backend = **Claude lewat proxy kita**, bukan model OpenAI. Teks delegasi (instruksi ke/dari Claude) **sudah termasuk** tarif per menit `gpt-live-1`; tidak ada biaya token OpenAI terpisah.

### 12.2 Perkiraan biaya (V1-B, `gpt-live-1` saja)

| Skenario | Menit | Biaya OpenAI |
|---|---|---|
| 1 user memakai **penuh kuota 60 menit/hari** | 60 /hari | **$3,00 /hari**; ±$90 /bulan (30 hari) — batas atas per user |
| 1 sesi 10 menit | 10 | $0,50 |
| Idle sampai auto-off (2 menit) | 2 | $0,10 |
| Start gagal (bila 15 dtk awal tetap ditagih — **perlu dikonfirmasi**) | 0,25 | ±$0,0125 |
| **Realistis:** 5 user × 15 menit/hari + kiosk 60 menit/hari | 75 + 60 = 135 /hari | $6,75 /hari ≈ **$202,50 /bulan** (30 hari) atau ≈ **$148,50** (22 hari kerja) |
| Batas teoretis: 3 jalur penuh 8 jam kerja (dibatasi kuota per user, jadi tidak tercapai kecuali banyak user) | 1.440 /hari | $72 /hari — gambaran plafon dari batas sesi bersamaan |

Pemisahan yang diminta:
- **Audio masuk/keluar**: tidak dipisah oleh OpenAI untuk `gpt-live-1` (satu tarif per menit).
- **Teks delegasi**: termasuk tarif per menit (lihat 12.1).
- **Claude per giliran**: **tidak dihitung di sini** — harga proxy Claude belum diketahui; dicatat terpisah oleh sistem limit token yang sudah ada.
- **V2 fallback** (bila kelak dipakai): `gpt-live-transcribe` $0,017 + TTS ±$0,015 (perlu dikonfirmasi) ≈ **$0,03/menit bicara** + Claude; lebih murah per menit tetapi tidak full duplex.
- Rupiah: tidak dicantumkan; kurs **perlu dikonfirmasi** saat anggaran disusun.

### 12.3 Perlu dikonfirmasi

1. Apakah 15 dtk inisialisasi tetap ditagih bila create gagal / browser tidak pernah tersambung.
2. Harga per menit `gpt-4o-mini-tts` (halaman hanya mencantumkan per token).
3. Apakah endpoint hangup menutup sesi WebRTC (bukan hanya SIP).
4. Apakah batas durasi maksimum sesi bisa diatur saat create (agar sesi yatim berhenti ≤ 10 menit).
5. Harga dapat berubah; tinjau ulang sebelum anggaran final.

---

## 13. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Hangup tidak mendukung WebRTC | sesi yatim tetap ditagih sampai `expired` | sideband `session.close`; status `hangup_unconfirmed` terlihat admin; kuota tetap dihitung server |
| Klien tidak mengirim `/turns` (tab ditutup) | metrik kurang penyebut | metrik bersifat sampel; tampilkan jumlah giliran terhitung |
| Salah dengar transkrip → M1 positif palsu | peringatan palsu | ambang 5% dari 50; lihat tren, bukan per kejadian |
| Daftar vendor menangkap kata biasa ("Gemini" sebagai nama) | M2 positif palsu | daftar bisa diubah admin; per kata utuh |
| Sweeper berjalan dobel | aksi ganda | advisory lock + compare-and-set |
| `providerBilledSeconds` (klien) ≠ `billedSeconds` (server) | selisih tagihan | kuota pakai nilai server; selisih ditampilkan di diagnostik untuk dipantau |
| S1 berubah sebelum merge | bagian [S1] tidak cocok | tinjau 06b setelah S1 merge, sebelum S2 mulai |
| Biaya kiosk menyala terus | biaya harian naik | kuota kiosk 60 menit + auto-off idle (S1) |

---

## 14. Pertanyaan untuk user

**Q1. Batas total sesi bersamaan**
- Opsi: (a) default 3, bisa diubah admin 1–20; (b) default 2; (c) tanpa batas total.
- **Saran: (a)** — sesuai #47/FOREVIA; plafon biaya terkendali.

**Q2. Nama status di database**
- Opsi: (a) pakai ulang `ended`/`failed` dari S1 + tambah `closing`/`startup_uncertain`; (b) ganti ke nama FOREVIA penuh (`hangup_accepted`, `startup_failed`) dengan migrasi data.
- **Saran: (a)** — tanpa migrasi data, arti sama; peta nama ada di §2.1.

**Q3. Tombol tutup paksa untuk admin**
- Opsi: (a) tidak ada di S2, diagnostik murni hanya-baca; (b) ada tombol "Tutup sesi" (lewat jalur `closing` + hangup).
- **Saran: (a)** — sesuai brief "hanya-baca"; sweeper sudah menutup sesi macet ≤ 1 menit. Bisa ditambah nanti.

**Q4. Identitas user di daftar sesi admin**
- Opsi: (a) nama tampilan user; (b) ID singkat saja; (c) disembunyikan.
- **Saran: (a)** — admin sudah mengelola user; yang dilarang adalah isi percakapan, bukan nama. Email tidak ditampilkan.

**Q5. Menghitung penolakan reservasi (kapasitas penuh/kuota habis)**
- Opsi: (a) cukup di log server; (b) tabel/angka "ditolak hari ini" di kartu admin.
- **Saran: (b)** sebagai angka harian sederhana (tanpa user) — berguna untuk memutuskan menaikkan batas 3.

**Q6. Ambang M3 (jawab sendiri)**
- Opsi: (a) tampil angka saja di S2, ambang ditentukan setelah lihat data; (b) peringatan bila > 10% dari 50 giliran.
- **Saran: (a)** — belum ada data dasar; hindari peringatan palsu.

**Q7. Retensi sesi suara & log tahap**
- Opsi: (a) 90 hari, sama dengan metrik; (b) ikut `retentionDays` percakapan; (c) simpan selamanya.
- **Saran: (a)** — satu angka untuk semua data diagnostik suara; tidak berisi PII.

**Q8. Daftar istilah vendor (M2)**
- Opsi: (a) default OpenAI, ChatGPT, GPT, Anthropic, Claude, Gemini, Google AI — bisa diubah admin; (b) daftar tetap di kode.
- **Saran: (a)** — #56 meminta daftar sebagai konfigurasi.

**Q9. Perpanjangan manual**
- Opsi: (a) +1 menit, maks 2 kali per sesi (bisa diubah admin); (b) maks 1 kali; (c) tanpa batas (tetap dibatasi kuota).
- **Saran: (a).**
