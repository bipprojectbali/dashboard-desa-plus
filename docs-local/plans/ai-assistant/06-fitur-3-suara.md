# 06 — Fitur 3: Suara dua arah (full-duplex) — v3 (V1-B MVP, disetujui)

> **Status: v3 DISETUJUI user 2026-10-03 (#53).** Usulan batas parafrase, aturan angka lisan, kirim per kalimat disetujui; penolakan tab kedua (versi sederhana) ditarik ke S1. S1 dikerjakan sesi `ai_suara_s0` di branch `feature/ai-voice-s1`.
> v2 disetujui 2026-10-02 (#50) dan S0 sudah diuji user. v3 menyesuaikan rancangan dengan hasil S0
> (README #51, #52) dan `test/uji-manual-s0-suara.md`. Kode S1 baru dimulai setelah v3 disetujui **dan**
> ada perintah + konfirmasi lokasi (worktree). Bagian "perubahan teknis" (§9) adalah **perkiraan**, bukan kontrak.
> Usulan yang perlu persetujuan ditandai **USULAN**.

---

## 1. Ringkasan perubahan dari v2

| Hal | v2 (2026-10-02) | v3 (sekarang) | Sumber |
|---|---|---|---|
| Otak & jalur suara | V2 dulu (OpenAI telinga + mulut, Claude otak) | **V1-B jadi pilihan utama**: GPT-Live mendengar & berbicara, Claude tetap satu-satunya otak lewat delegasi klien. V2 jadi cadangan, V1-A tetap cadangan terakhir | #51 (uji S0: V1-B mulus, V2 terasa lambat) |
| Urutan kerja | S0 → S1 → S2 → S3 lengkap | **MVP dulu** (S1 di laptop/desktop). Uji jaringan & perangkat NOC **menyusul**, bukan penghalang MVP | #52 |
| Angka di jawaban suara | belum dibahas | Angka besar **diucapkan ringkas** (juta/miliar) lewat **pemformat tetap (deterministik)**. Angka lengkap tetap di teks Claude | #52 |
| Halaman uji S0 | sekali pakai | **Dipertahankan** di `/admin/ai-assistant/voice-lab` sebagai alat diagnosa admin | #52 |
| Syarat "OpenAI tidak mengubah kalimat Claude" | syarat mutlak V1-B | Docs & S0: GPT-Live **dilatih memparafrase**, tidak ada mode resmi "bacakan persis". Diganti **batas parafrase** (§4, USULAN) + mitigasi | Temuan S0, §11 |
| Kuota | menit suara terpisah | Tetap, ditambah: **1 giliran suara = 1 pesan kuota teks** + menit suara | #50 |

Yang **tidak berubah**: #47 (menit nyata, 1 sesi/orang total 3, tab kedua ditolak, diagnostik admin), #48 (dibacakan + teks +
bisukan, penunjuk sejak S1, izin `use-ai-voice`), 60 menit/hari, 10 menit/sesi, auto-off 2 menit, tombol On/Off, Chrome/Edge
desktop, audio **tidak** disimpan, banner persetujuan sekali per user, kunci OpenAI hanya di slot Suara.

**Di luar lingkup (tetap):** ponsel; Jenna membaca layar (#45); OpenAI sebagai otak (kecuali cadangan V1-A).

---

## 2. Keputusan yang berlaku (ringkas)

| # | Keputusan | Sumber |
|---|---|---|
| 1 | **V1-B utama**: GPT-Live (WebRTC) = telinga + mulut + pengatur giliran bicara; **Claude = satu-satunya otak** lewat `/chat/stream` | #51 |
| 2 | V2 = cadangan; V1-A (otak OpenAI) = cadangan terakhir, hanya bila V1-B & V2 gagal | #46, #51 |
| 3 | MVP di laptop/desktop dulu; NOC menyusul | #52 |
| 4 | Angka besar diucapkan ringkas lewat pemformat tetap; angka lengkap tetap di teks | #52 |
| 5 | `/admin/ai-assistant/voice-lab` dipertahankan sebagai alat diagnosa admin | #52 |
| 6 | Menit nyata dihitung server; start gagal tidak memotong kuota | #47, #35 |
| 7 | 1 giliran suara = 1 pesan kuota teks (50/100) + menit suara (60/hari user & kiosk) | #50, §7 diskusi |
| 8 | 1 sesi/orang + total 3 (admin bisa ubah); tab kedua ditolak | #47 |
| 9 | Diagnostik admin: log tahapan tanpa PII + daftar sesi (baca saja) | #47 |
| 10 | Dibacakan + teks + tombol bisukan; penunjuk sejak S1; izin `use-ai-voice` | #48 |
| 11 | 10 menit/sesi (perpanjang manual), auto-off 2 menit hening, On/Off | §7 diskusi, #49 |
| 12 | Nama model **tidak di-hardcode** di kode produksi — setelan admin (aturan global #15) | §11 |

**Masih terbuka:** no. 5 (`/wall`, §10), batas parafrase (§4 — USULAN), harga per menit, uji jaringan & perangkat NOC.

---

## 3. Arsitektur V1-B

### 3.1 Alur (diagram teks)

```
 MIKROFON (Chrome/Edge desktop)
    │ audio (WebRTC, AEC browser)
    ▼
 [GPT-Live] ◄── sesi dibuat SERVER kita: SDP browser diteruskan ke OpenAI (relay)
    │            dengan kunci slot Suara (delegasi "client", instruksi "bacakan persis")
    │  event lewat data channel:
    │   • session.input_transcript.delta  ──► transkrip ucapan user tampil di panel
    │   • session.delegation.created      ──► "tolong jawab" (TANPA teks pertanyaan)
    ▼
 KLIEN (panel Jenna)
    │ susun pertanyaan dari transkrip ucapan → panggil /api/assistant/chat/stream
    ▼
 SERVER KITA: runChatTurn — SAMA dengan chat teks
    │  izin · kuota (1 pesan + menit) · riwayat (bertanda suara) · tool data · prompt varian suara
    ▼
 teks jawaban Claude (stream) + aksi penunjuk
    │                                   └──► penunjuk dijalankan di layar (sama seperti chat)
    ├──► teks lengkap tampil di panel  = PEGANGAN RESMI
    ▼
 dipotong per kalimat → PEMFORMAT ANGKA LISAN ("Rp 1.234.567.890" → "sekitar 1,2 miliar rupiah")
    │
    ▼
 session.commentary.append (per kalimat, delegation_id yang sama)
    │
    ▼
 [GPT-Live] berbicara ──► SPEAKER
    • session.output_transcript.delta ──► dipakai untuk metrik kecocokan (opsional, §4)
```

Prinsip: **satu otak, satu riwayat, satu jalur izin & kuota.** GPT-Live tidak memakai data desa sendiri;
semua jawaban berasal dari Claude lewat server kita.

### 3.2 Hal penting dari docs & S0
- `session.delegation.created` **tidak membawa teks pertanyaan** — klien wajib menyimpan transkrip ucapan
  (`input_transcript`) dan riwayat sendiri (docs live-delegation).
- **Menyela (barge-in)** ditangani GPT-Live. Tetapi docs mencatat: menyela percakapan **tidak** menghentikan
  pekerjaan backend → klien wajib **membatalkan** `/chat/stream` dan sisa kalimat yang belum dikirim.
  Kalimat yang sudah terkirim tidak bisa ditarik (temuan S0).
- **Bisukan jawaban** = mematikan audio GPT-Live di browser; teks tetap tampil. **Bisukan mikrofon** terpisah.
- Kalimat pembuka sebelum tool dipanggil dibuang (S0); hanya jawaban akhir yang dibacakan.
- Kalimat pengisi GPT-Live ("sebentar, saya cek…") boleh; tidak dihitung sebagai jawaban.

### 3.3 Pemformat angka lisan (#52)
Fungsi murni (deterministik, tanpa AI) yang dijalankan **sebelum** kalimat dikirim ke GPT-Live. **USULAN aturan:**
- ≥ 1 juta → satu angka di belakang koma + skala: "1.234.567.890" → "1,2 miliar"; bila dibulatkan, tambahkan "sekitar".
- Rupiah: "Rp" → "rupiah" di belakang angka. Persen: "45,6%" → "45,6 persen" (tidak dibulatkan).
- Tahun (1900–2100), nomor RT/RW, angka < 1 juta: tidak diubah.
- Angka lengkap **tetap** ada di teks Claude di panel.
- Diuji dengan tabel contoh (unit test), dipakai ulang oleh pencocokan angka.

### 3.4 Satu riwayat, penanda suara
Giliran suara disimpan sebagai `AssistantMessage` biasa (transkrip untuk `user`, **teks asli Claude** untuk `assistant`)
dengan `modality = "voice"`. Ikon mikrofon kecil di daftar percakapan. Audio tidak disimpan.

### 3.5 Prompt varian suara
`/chat/stream` menerima penanda suara → lapisan prompt tambahan: jawaban singkat (2–4 kalimat), tanpa markdown/tabel,
sebut angka penting saja, tawarkan "lihat rincian di layar". Tetap di bawah guardrail yang sama.

---

## 4. Batas parafrase — **USULAN** (perlu persetujuan user)

Fakta: GPT-Live dilatih memparafrase `commentary`; tidak ada mode resmi "bacakan persis" (docs, 2026-10-03).
Instruksi "bacakan persis" + kirim per kalimat hanya **menurunkan** risiko.

**Usulan aturan:**
1. **Angka dan nama harus sama** dengan teks Claude **setelah** pemformat angka lisan
   (mis. teks "1,2 miliar" diucapkan "satu koma dua miliar" = sama; diucapkan "1,3 miliar" = berubah).
2. **Gaya bahasa boleh beda** (urutan kata, kata sambung, sapaan).
3. Tidak boleh **menambah** angka atau fakta yang tidak ada di teks Claude.
4. Bila ragu, **teks Claude di panel = pegangan resmi** (sudah tampil di layar setiap giliran).

**Cara memantau:**
- **S0 (sekarang):** lencana "Angka cocok m/n" + ⚠️ "Angka berubah" di voice-lab (`voice-lab.verify.ts`).
- **Produksi (USULAN, S2):** pencocokan yang sama dijalankan di klien setelah giliran selesai, lalu hanya
  **angka hitungan** dikirim ke server (jumlah angka, jumlah cocok, ada/tidak ⚠️) — **tanpa** teks, tanpa nama, tanpa PII.
  Ditampilkan sebagai statistik di diagnostik admin.
- **Ambang tindakan (USULAN):** bila ⚠️ muncul pada lebih dari 5% giliran dalam 50 giliran terakhir → admin diberi
  peringatan untuk mengecek di voice-lab; bila tetap buruk → pertimbangkan pindah ke V2 (cadangan).
- Keterbatasan: salah dengar transkripsi bisa terhitung "berubah"; dinilai per giliran; giliran yang disela tidak dinilai.

---

## 5. Lingkup MVP (S1)

### 5.1 Yang MASUK S1
| Bagian | Isi |
|---|---|
| Tempat | Suara di **panel Jenna yang sebenarnya** (bukan halaman uji), laptop/desktop Chrome/Edge |
| Kontrol | Tombol **On/Off**; status "Menghubungkan" → "Siap bicara" → "Mendengarkan" / "Menjawab" |
| Tampilan | Transkrip ucapan langsung; jawaban **teks + suara**; ikon mikrofon saat aktif |
| Tombol | **Bisukan jawaban**, **bisukan mikrofon** |
| Percakapan | Barge-in (GPT-Live) + pembatalan `/chat/stream` & sisa kalimat |
| Penunjuk | Aksi penunjuk dijalankan seperti chat (hanya bila diminta, #30) |
| Riwayat | Satu riwayat bertanda suara → kolom `modality` (**butuh migrasi**) |
| Akses | Izin **`use-ai-voice`** (+ syarat `use-ai-assistant`, sesi browser, verifikasi) |
| Privasi | **Banner persetujuan** sekali per user (mikrofon, data ke OpenAI, suara dibuat AI) |
| Kuota dasar | Menit suara/hari (heartbeat + close, dihitung server) + **1 pesan kuota teks per giliran** |
| Batas sesi | 10 menit/sesi (+ perpanjang manual), **auto-off 2 menit** hening |
| Angka | Pemformat angka lisan |
| Pengaturan admin | Nama model GPT-Live, nama suara, batas menit, instruksi "bacakan persis" (maks 500 karakter) |

### 5.2 Yang MENYUSUL
| Tahap | Isi |
|---|---|
| **S2** | Batas sesi bersamaan (1/orang, total 3, tab kedua ditolak, reservasi atomik); mesin status lengkap (starting/active/closing/hangup_accepted/startup_failed/startup_uncertain) + **sweeper** tiap ±10 detik; diagnostik admin lengkap (log tahapan, daftar sesi, statistik kecocokan angka) |
| **S3** | `/wall` (keputusan no. 5) + uji jaringan & perangkat NOC |

**Catatan risiko MVP:** sebelum S2, dua tab milik orang yang sama bisa membuka dua sesi. Kuota menit tetap menahan
pemakaian (menit kedua sesi dijumlah). **USULAN:** bila dianggap perlu, penolakan tab kedua yang sederhana
(cek sesi aktif dengan heartbeat segar) bisa ditarik ke S1 — tambahan kecil.

---

## 6. Keamanan & privasi
- **Kunci OpenAI hanya di slot `voice`** (terenkripsi AES-256-GCM, `AI_CREDENTIALS_KEY`), tanpa jatuh ke slot `chat`.
  Tidak pernah ke browser, log, atau `ActivityLog`.
- Sesi GPT-Live dibuat **server** (relay SDP, seperti S0) → browser **tidak** menerima kunci maupun token.
  Token sementara tidak dibutuhkan untuk V1-B.
- Header `OpenAI-Safety-Identifier` = SHA-256 ID user (bukan email).
- **Audio tidak disimpan**; transkrip & teks jawaban disimpan sebagai riwayat biasa (ikut retensi 90 hari).
- **Banner persetujuan** wajib menyebut: mikrofon aktif, suara dikirim ke OpenAI, **suara jawaban dibuat AI**
  (kebijakan OpenAI).
- Data tersaring tool (#16) boleh ikut ke OpenAI (sebagai teks jawaban yang dibacakan).
- Log tahapan **tanpa PII** (tanpa isi ucapan/jawaban).

---

## 7. Kuota & sesi (rinci)
- **Menit nyata:** sesi mengirim heartbeat (±15 detik). Server menghitung dari jam server: `endedAt` saat close,
  atau `lastHeartbeatAt` bila close tak pernah datang (S1, tanpa sweeper). Dibulatkan ke atas per detik.
- **Start gagal** (OpenAI menolak / SDP gagal) → status `startup_failed`, **0 detik** ditagih.
- **Batas harian:** 60 menit user, 60 menit kiosk (admin bisa ubah; 0 = tanpa batas), hari WITA. Dicek saat start
  dan di setiap heartbeat; bila habis → server menjawab "berhenti", klien menutup sesi dengan pesan.
- **Kuota teks:** setiap `/chat/stream` dari giliran suara = 1 pesan (perilaku `runChatTurn` saat ini).
  Bila kuota teks habis → Jenna mengucapkan/menampilkan pesan kuota habis.
- **Batas sesi 10 menit** dan **auto-off 2 menit** dihitung di klien (dari S0 `voice-lab.session.ts`) **dan** dijaga
  server (sesi > batas tidak ditagih melebihi batas + perpanjangan yang tercatat).

---

## 8. Antarmuka (S1)
- Tombol On/Off di panel Jenna; nonaktif bila tanpa izin / slot `voice` belum siap / browser bukan Chrome/Edge desktop
  (dengan alasan singkat).
- Gelembung transkrip user + teks jawaban Claude (markdown seperti chat) + ikon "suara".
- Indikator sisa menit sesi + ajakan perpanjang 1 menit sebelum habis.
- Pesan galat berbahasa Indonesia sederhana: mikrofon ditolak, kuota habis, slot Suara belum diisi, koneksi putus.

---

## 9. Perkiraan perubahan teknis (ESTIMASI)

### 9.1 Skema (satu migrasi idempoten, `IF NOT EXISTS`, alasan di komentar)
- `AssistantMessage.modality` — `TEXT NOT NULL DEFAULT 'text'` (data lama otomatis "text").
- Tabel baru `AssistantVoiceSession`: `id`, `userId`, `status`, `startedAt`, `lastHeartbeatAt`, `endedAt`,
  `billedSeconds`, `extendedSeconds`, `endReason`; indeks `(userId, startedAt)`, `status`. (S2 menambah kolom mesin status bila perlu.)
- `AssistantSettings`: `voiceDailyMinutesUser` (60), `voiceDailyMinutesKiosk` (60), `voiceSessionMaxMinutes` (10),
  `voiceIdleOffSeconds` (120), `voiceLiveModel`, `voiceName`, `voiceReadExactInstruction`; S2: `voiceMaxSessionsPerUser` (1), `voiceMaxSessionsTotal` (3).
- Persetujuan suara per user: tabel kecil `AssistantVoiceConsent(userId PK, acceptedAt)`.
- Baris `RolePermission` untuk `use-ai-voice` (admin & user) di migrasi yang sama.

### 9.2 Endpoint (nama perkiraan)
| Endpoint | Fungsi |
|---|---|
| `POST /api/assistant/voice/consent` | catat persetujuan |
| `POST /api/assistant/voice/sessions` | cek izin + slot + kuota menit → buat baris sesi → relay SDP ke GPT-Live (delegasi client, instruksi) → `{ sessionId, sdp }` |
| `POST /api/assistant/voice/sessions/:id/heartbeat` | perbarui `lastHeartbeatAt`, balas sisa menit / perintah berhenti |
| `POST /api/assistant/voice/sessions/:id/close` | tutup + hitung `billedSeconds` + `endReason` |
| `/api/assistant/chat/stream` (sudah ada) | tambah field `modality: "voice"` + `voiceSessionId` → prompt varian suara, simpan modalitas |
| `GET /api/assistant/status` (sudah ada) | `slots.voice` sudah benar (perbaikan `fix/voice-slot-status` di join) + `voiceAllowed` dari izin |

Semua lewat `access.ts` (sesi browser, verifikasi, role dari DB) + izin `use-ai-voice`.

### 9.3 Pemakaian ulang kode S0 (`feature/ai-voice-s0`)

> Catatan: branch S0 **belum di-merge ke `join`**. S1 perlu S0 masuk `join` dulu (atau S1 dibuat dari branch S0).

| Pindah ke modul produksi (dipakai panel **dan** voice-lab) | Tetap di voice-lab (alat diagnosa) |
|---|---|
| Server: `voice-lab.slot.ts` (kunci hanya dari slot Suara), `voice-lab.upstream.ts` (POST ke OpenAI + safety id), bagian `createLiveSession` di `voice-lab.service.ts`, validasi instruksi (maks 500) | Jalur V2: `voice-lab.v2.ts`, `transcriber`, `tts`, `vad`, endpoint `transcribe-token` / `transcribe-call` / `tts` |
| Klien: `voice-lab.peer.ts` (WebRTC + data channel), `voice-lab.sentences.ts` (pemecah kalimat id-ID), `voice-lab.v1b-send.ts` (kirim per kalimat + batal), `voice-lab.v1b-answer.ts` (panggil `/chat/stream`), `voice-lab.v1b-turn.ts`, `voice-lab.session.ts` (batas 10 mnt / auto-off), `voice-lab.devices.ts` (cek browser & mikrofon) | Pengukuran & ekspor: `stats`, `metrics*`, `export`, `answer-audio`, `v1b-settle` |
| Logika angka: `voice-lab.numbers.ts` (dipakai ulang oleh **pemformat angka lisan** baru) | Pencocokan UI: `voice-lab-verify.tsx`, `voice-lab.verify.ts`, `voice-lab.terms.ts` (dipindah ke produksi baru di S2 bila metrik produksi disetujui) |
| | Halaman & pengaturan uji (`voice-lab-page`, `-settings`, `-controls`, `-device-test`), pilihan model bebas dari daftar |

Lokasi baru (perkiraan): server `src/api/assistant/voice/*` + `routes/voice.route.ts`; klien `src/components/assistant/voice/*`
(hook `use-voice-session`, `voice-controls`, `voice-consent-banner`, `voice-spoken-numbers.ts`). Voice-lab lalu **mengimpor**
modul produksi (satu sumber, tanpa salinan). Setiap file mengikuti batas global (route ≤150, service ≤300 baris).

### 9.4 Izin
`use-ai-voice` ditambah ke `FEATURES` + `DEFAULT_PERMISSIONS` (admin & user) di `src/utils/permission.ts`;
`resolveAllowedFeatures` sudah menjatuhkan fitur baru ke default.

---

## 10. `/wall` (layar NOC) — **TERBUKA (no. 5)**, masuk S3

Echo speaker TV jauh + obrolan ruangan tidak diselesaikan oleh AEC browser maupun GPT-Live.

| Opsi | Isi |
|---|---|
| **W1** | Suara dua arah penuh di `/wall` (risiko echo tertinggi) |
| **W2** | Hanya mendengar: jawaban teks + penunjuk, tidak dibacakan (di V1-B: audio GPT-Live dibisukan permanen) |
| **W3** *(saran)* | W2 secara default + setelan admin "bacakan di wall", dinyalakan setelah uji echo nyata |

**Info perangkat NOC yang dibutuhkan:** jenis perangkat, mikrofon/webcam, peramban, speaker lewat HDMI TV atau terpisah,
tingkat bising ruangan, dan apakah jaringan NOC mengizinkan WebRTC. MVP **tidak** bergantung pada ini.

---

## 11. Test, kriteria selesai, uji manual (S1 MVP)

### 11.1 Test otomatis (bun:test, tanpa panggilan OpenAI asli — `fetch` dimock)
- `tests/api/assistant/voice-session.test.ts`: 401 tanpa login, 403 tanpa `use-ai-voice`, 409 slot Suara kosong,
  429 menit habis, start gagal → `startup_failed` & 0 detik, heartbeat/close menghitung detik dari jam server, kiosk pakai batas kiosk.
- `tests/api/assistant/voice-spoken-numbers.test.ts`: tabel contoh pemformat (miliar/juta/rupiah/persen/tahun/RT).
- `tests/api/assistant/chat-stream-voice.test.ts`: `modality: "voice"` disimpan, prompt varian suara dipakai, 1 pesan kuota terpotong.
- Logika klien yang dipindah dari S0 tetap tercakup test S0 yang ada (`voice-lab-logic`, `voice-lab-send`, `voice-lab-verify`).
- `tests/db/` untuk perhitungan menit harian WITA & persetujuan (DB test sungguhan).
- Gerbang: `bun run verify` 0 gagal, `bun run test:db` 0 gagal, lint 0 error.

### 11.2 Kriteria selesai S1
1. User biasa dengan izin bisa On → bertanya dengan suara → mendengar & membaca jawaban Claude → Off, di panel nyata.
2. Penunjuk berjalan dari perintah suara.
3. Riwayat menampilkan giliran suara dengan penanda.
4. Menit & kuota teks terpotong sesuai aturan; start gagal tidak memotong.
5. Banner muncul sekali; tanpa izin / browser lain → tombol nonaktif dengan alasan.
6. Voice-lab tetap jalan memakai modul produksi.

### 11.3 Uji manual (`test/uji-manual-s1-suara.md`, dibuat saat S1)
On/Off, banner pertama kali, tanya data berangka besar (dengar "miliar", lihat angka lengkap di teks), minta penunjuk,
sela di tengah jawaban, bisukan jawaban/mikrofon, diam 2 menit (auto-off), sesi 10 menit + perpanjang, kuota menit habis,
tolak mikrofon, akun tanpa izin, Safari/Firefox, cabut jaringan di tengah sesi.

---

## 12. Risiko & pertanyaan terbuka

| # | Hal | Penanganan |
|---|---|---|
| 1 | **Harga per menit GPT-Live** (ditagih per detik menurut docs) belum dicek | Cek halaman harga resmi sebelum produksi; hitung biaya 60 mnt/hari × jumlah user |
| 2 | **Batas parafrase** (§4) | USULAN, butuh persetujuan user |
| 3 | **Uji jaringan & perangkat NOC** | Menyusul (S3); bukan penghalang MVP |
| 4 | **No. 5** `/wall` W1/W2/W3 | Keputusan user; S3 menunggu |
| 5 | Aturan pemformat angka lisan (§3.3) | USULAN, butuh persetujuan |
| 6 | Dua tab sebelum S2 | Kuota menit menahan; opsi tarik penolakan sederhana ke S1 (§5.2) |
| 7 | Branch S0 belum di `join` | Merge S0 ke `join` sebelum S1 (perintah user) |
| 8 | Nama model / endpoint OpenAI bisa berubah | Nama = setelan admin; voice-lab untuk diagnosa cepat |
| 9 | Belum terbukti: Safari, sesi 10 menit nyata, percakapan panjang | Dibatasi Chrome/Edge; uji manual S1 |

---

## 13. Verifikasi model & endpoint OpenAI

Singkatan URL: `P` = `https://platform.openai.com/docs/guides/`, `R` = `https://platform.openai.com/docs/api-reference/`,
`D` = `https://developers.openai.com/api/docs/guides/`. Tanpa panggilan API dari dokumen ini; **harga tidak ditulis**.

### 13.1 Jalur utama V1-B (dicek ulang 2026-10-03 + dipakai S0)
| Item | Nama / endpoint | Sumber | Status |
|---|---|---|---|
| Model GPT-Live | `gpt-live-1` | `D`live, `D`live-delegation | terverifikasi (docs + S0) |
| Buat sesi (WebRTC) | server meneruskan SDP browser ke `POST {baseUrl}/live/sessions` dengan `session: { model, delegation:{type:"client"}, instructions }`, `transport: { type:"webrtc", sdp }` → balasan `session.id` + `transport.sdp`. Docs: "server creates the session and exchanges the browser's connection offer"; kunci tetap di server | `D`live; kode S0 `voice-lab.service.ts` | dipakai & berhasil di S0; path persis di quickstart `D`voice-webrtc?api=live **perlu dikonfirmasi** ulang |
| Event transkrip | `session.input_transcript.delta`, `session.output_transcript.delta` (berisi `delta`, `start_ms`, `end_ms`) | `D`live-delegation | terverifikasi |
| Delegasi klien | `session.delegation.created` (`delegation.id`, `target:"client"`, `offset_ms`; **tanpa teks pertanyaan**) | `D`live-delegation | terverifikasi |
| Kirim jawaban | `session.commentary.append` (`event_id`, `delegation_id`, `content`); boleh beberapa kali per delegasi; ack `session.commentary.appended` (hanya tanda masuk konteks, bukan selesai bicara) | `D`live-delegation | terverifikasi |
| Fakta tanpa diucapkan | `session.thinking.append` | `D`live-delegation | terverifikasi |
| Parafrase | "it is trained to paraphrase the text"; tidak ada mode verbatim | `D`live-delegation | terverifikasi → §4 |
| Menyela | menyela percakapan **tidak** menghentikan pekerjaan backend | `D`live-delegation | terverifikasi → §3.2 |
| Peristiwa lain (S0) | `session.started`, `session.closed`, `error`; data channel `oai-events` | kode S0 `voice-lab.v1b.ts` | dipakai S0; nama channel **perlu dikonfirmasi** di docs |
| Penagihan | sesi GPT-Live ditagih **per detik durasi**; model backend ditagih terpisah; tutup sesi untuk mengambil pemakaian akhir | `D`live | terverifikasi; **tarif perlu dicek** |
| Instruksi tambahan | `session.instructions.append` (maks 500 token) | `P`voice-server-controls | terverifikasi (2026-10-02) |
| Identitas pengguna | header `OpenAI-Safety-Identifier: <hash id>` | `P`voice-webrtc | terverifikasi (2026-10-02) |

### 13.2 Jalur cadangan V2 (tetap di voice-lab; dicek 2026-10-02)
| Item | Nama / endpoint | Sumber | Status |
|---|---|---|---|
| Transkripsi | `gpt-live-transcribe` (`session.type:"transcription"`, PCM 24 kHz), `turn_detection` harus kosong (tanpa VAD) | `P`realtime-transcription | terverifikasi |
| Alternatif | `gpt-transcribe` (WebSocket + `input_audio_buffer.commit`) | `P`realtime-transcription | terverifikasi |
| Token sementara | `POST /v1/realtime/client_secrets` → `value` (`ek_…`) + `expires_at`; SDP ke `/v1/realtime/calls` | `R`realtime-sessions; `P`voice-webrtc | terverifikasi; untuk sesi transkripsi **perlu dikonfirmasi** (S0 menyediakan mode Token & Relay-server) |
| TTS | `POST /v1/audio/speech`, `gpt-4o-mini-tts`, 11 suara, streaming; Indonesia didukung (dioptimalkan Inggris) | `P`text-to-speech; `R`audio/createSpeech | terverifikasi |
| Pengungkapan suara AI | wajib memberi tahu pengguna suara dibuat AI | `P`text-to-speech | terverifikasi → banner §6 |

Nama model di atas hanya **nilai saat ini**; di produksi disimpan sebagai setelan admin, jadi bisa diganti tanpa deploy.
