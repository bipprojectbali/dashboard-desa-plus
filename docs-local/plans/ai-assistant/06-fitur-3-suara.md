# 06 — Fitur 3: Suara dua arah (full-duplex) — v2 (disetujui)

> **Status: DISETUJUI user 2026-10-02 (v2).** S0 dikerjakan di worktree baru atas perintah user. Menggantikan draf lama
> (tiga tingkat, Web Speech dulu, "tekan-untuk-bicara"). Disusun dari semua keputusan final
> (README #46–#49, `discus/fitur-3-suara.md` §7 & §9.7, `idea/compare-forevia-vs-dashboard-desa.md`).
> Kode baru dimulai setelah dokumen ini disetujui **dan** ada perintah + konfirmasi lokasi (worktree).
> Bagian "perubahan teknis" (§11) adalah **perkiraan**, bukan kontrak.

---

## 1. Tujuan & lingkup

**Tujuan (bahasa sederhana).** Pengguna bisa **berbicara** kepada Jenna dan **mendengar** jawabannya,
seperti telepon singkat. Jenna tetap satu otak yang sama dengan chat teks: tahu data desa, bisa
menunjuk elemen di layar, dan tunduk pada izin yang sama.

**Masuk lingkup**
- Bicara → teks (transkrip tampil langsung) → jawaban Jenna (teks) → dibacakan → bisa disela.
- Penunjuk (Fitur 2) ikut sejak S1, hanya jika diminta pengguna (#30).
- Kuota & sesi menit-suara, diagnostik admin, persetujuan privasi.
- Desktop Chrome/Edge. Layar `/wall` (kiosk NOC) — **menunggu keputusan no. 5** (§9).

**Di luar lingkup**
- Mobile/ponsel.
- Jenna **membaca layar** (#45 — itu fitur panduan, bukan suara).
- OpenAI sebagai **otak** (kecuali sebagai cadangan terakhir V1-A, §4).
- Menyimpan rekaman audio.

---

## 2. Keputusan final (ringkasan)

| # | Keputusan | Sumber |
|---|---|---|
| 1 | **V2 dulu**: otak tunggal = Claude lewat `runChatTurn` / `/chat/stream`. OpenAI hanya **telinga** (suara→teks) dan **mulut** (teks→suara). | #46 |
| 2 | V1-B (GPT-Live realtime + delegasi ke Claude lewat server kita) jadi **pilihan utama** bila S0 menunjukkan V2 tidak layak. Syarat: OpenAI **tidak mengubah** kalimat Claude. | #46, #49 |
| 3 | V1-A (otak OpenAI / dua otak, seperti FOREVIA) = cadangan **terakhir**, hanya bila V2 dan V1-B gagal dan ukuran kesamaan jawaban lolos. | #46 |
| 4 | **S0 wajib** sebelum S1: halaman uji kecil, V2 vs V1-B berdampingan. | #49 |
| 5 | Menit suara dihitung **nyata oleh server**; start gagal **tidak** memotong kuota. | #47 (3a), #35 |
| 6 | 1 sesi per orang + total 3 (admin bisa ubah); **tab kedua DITOLAK** dengan pesan, sesi lama tidak diputus. | #47 (9A) |
| 7 | Diagnostik admin: log tahapan tanpa data pribadi + daftar sesi (baca saja, tanpa tombol paksa-tutup). | #47 (10B) |
| 8 | Jawaban **dibacakan + teks + tombol "bisukan jawaban"** (di `/wall` mengikuti no. 5). | #48 |
| 9 | Penunjuk ikut sejak S1. | #48 |
| 10 | Izin baru **`use-ai-voice`** (default admin & user, bisa dimatikan per role). | #48 |
| 11 | Mode NOC: tombol **On** untuk mulai, **Off** atau auto-off untuk selesai. Ini **tidak** menghapus kebutuhan deteksi akhir ucapan di V2. | #49 |
| 12 | Provider suara OpenAI; id-ID sopan-ramah, nama suara dipilih admin; On/Off + auto-off 2 menit; 60 menit/hari untuk user & kiosk (admin bisa ubah, **tidak** mengurangi kuota teks 50/100); transkrip disimpan, audio **tidak**; banner persetujuan sekali per user + ikon mikrofon permanen; satu riwayat dengan penanda suara; 10 menit/sesi bisa diperpanjang manual; kunci diisi admin di slot Suara. Data tersaring (#16) boleh ke OpenAI. | `discus/fitur-3-suara.md` §7 |
| 13 | Nama model **tidak di-hardcode** — pengaturan admin (aturan global #15). | §13 |

**Masih terbuka:** no. 5 (`/wall`), no. 8 (cara deteksi akhir ucapan, diuji di S0), ambang cadangan (§12).

---

## 3. Arsitektur V2

### 3.1 Alur (diagram teks)

```
 MIKROFON (browser, Chrome/Edge)
    │  audio
    ▼
 [TELINGA] OpenAI transcription ──► teks transkrip (tampil langsung di panel)
    │                                 + penanda "akhir ucapan"
    ▼
 teks ──► server kita: /api/assistant/chat/stream  (runChatTurn — SAMA dengan chat teks)
            │   Claude = satu-satunya otak
            │   (prompt varian suara: jawaban singkat, tanpa markdown/tabel)
            ▼
        teks jawaban + aksi penunjuk (Fitur 2)  ──► penunjuk dijalankan di layar
            │
            ▼
 [MULUT] OpenAI TTS (dipanggil lewat server kita, stream HTTP) ──► SPEAKER
```

Prinsip: **hanya satu otak, satu riwayat, satu jalur izin/kuota teks.** Suara adalah "kulit" di
depan dan belakang `runChatTurn`; tidak ada logika bisnis baru di sisi OpenAI.

### 3.2 Potong-sela (barge-in) & bisu
- **Barge-in:** bila pengguna mulai bicara saat jawaban dibacakan → pemutaran dihentikan seketika,
  stream jawaban dibatalkan (`AbortSignal` yang sudah ada di `chat-stream`), giliran baru dimulai.
- **Bisukan jawaban:** tombol mematikan **suara jawaban** saja; teks tetap tampil. Tombol
  **bisukan mikrofon** terpisah.
- Pengenalan echo di laptop ditangani AEC browser; echo speaker TV jauh = urusan `/wall` (§9).

### 3.3 Satu riwayat, penanda suara
Giliran suara disimpan sebagai `AssistantMessage` biasa (transkrip untuk `user`, teks jawaban untuk
`assistant`) dengan penanda `modality = "voice"` + durasi. Percakapan yang sama tampil di daftar ☰;
ikon mikrofon kecil menandai pesan suara. Audio tidak disimpan.

### 3.4 Penunjuk dari S1
Aksi `tunjukkan-elemen` / `pandu-langkah` mengalir lewat jalur SSE yang sama; saat dibacakan,
jawaban singkat ("Saya tunjukkan di layar") cukup — rincian tampil sebagai teks + sorotan.

### 3.5 Pembagian S1
- **S1a:** suara → transkrip langsung → jawaban teks Claude + penunjuk.
- **S1b:** tambah pembacaan (TTS) + barge-in + bisukan.
TTS dipanggil **lewat server kita** (HTTP stream) karena server Bun tidak menyediakan WebSocket.

### 3.6 Deteksi akhir ucapan (no. 8 — masalah nyata V2)
Pada V1 (GPT-Live) deteksi giliran sudah bawaan. Pada V2 **kita yang harus memutuskan "pengguna sudah selesai bicara"**.
Pilihan yang diuji di S0: (a) VAD di browser (mungkin pustaka kecil — butuh persetujuan sesuai aturan
dependency), (b) model transkripsi lain yang punya VAD, (c) uji keduanya. Hasil S0 menentukan.
FOREVIA tidak membahas ini (memakai GPT-Live), jadi tidak bisa ditiru begitu saja.

---

## 4. Cadangan: V1-B lalu V1-A

| Versi | Cara kerja singkat | Kapan dipakai | Syarat / catatan |
|---|---|---|---|
| **V1-B** | GPT-Live (realtime WebRTC) menangani suara & giliran; ketika perlu jawaban, klien **mendelegasikan** pertanyaan ke Claude lewat server kita (`/chat/stream`) dan GPT-Live membacakan hasilnya. | **Pilihan utama** bila S0 menunjukkan V2 tidak layak: deteksi akhir ucapan tak andal **atau** jeda terlalu panjang. | **Dilarang** bila OpenAI mengubah kalimat Claude. **Temuan §13: docs menyebut model memparafrase teks delegasi, tanpa jaminan verbatim** — kemungkinan besar gugur; S0 yang memastikan. |
| **V1-A** | Otak = OpenAI (dua otak, seperti FOREVIA). | **Terakhir**: hanya bila V2 dan V1-B gagal **dan** ukuran kesamaan jawaban (compare §8.3) lolos. | Risiko: jawaban berbeda dari chat teks. |

**Ambang (ditetapkan setelah S0):** berapa detik jeda dianggap "terlalu lama", dan seberapa mirip
jawaban dianggap "cukup sama". Belum diisi — sengaja menunggu data nyata.

---

## 5. Keamanan & privasi
- **Kunci OpenAI hanya di slot `voice`** (diisi admin, terenkripsi AES-256-GCM dengan `AI_CREDENTIALS_KEY`, seperti slot lain). Tidak pernah ke browser, log, atau `ActivityLog`.
- Browser hanya menerima **token sementara (ephemeral)** berumur pendek, dibuat server per sesi untuk jalur telinga (apakah token ini berlaku untuk sesi transkripsi masih **perlu dikonfirmasi**, §13; cadangannya audio lewat server). Kunci asli tak pernah keluar. Header `OpenAI-Safety-Identifier` berisi hash ID user.
- **Audio tidak disimpan** (hanya transkrip + durasi).
- **Banner persetujuan sekali per user**: menjelaskan mikrofon aktif, data dikirim ke OpenAI, **suara jawaban dibuat AI** (syarat kebijakan OpenAI). Setelah itu **ikon mikrofon permanen** tampil saat sesi aktif.
- **Izin `use-ai-voice`** (default admin & user), **ditambah** syarat izin `use-ai-assistant`, sesi browser, dan verifikasi admin yang sudah ada di `access.ts`. Role diambil dari DB.
- Data yang tersaring tool (#16) boleh ikut ke OpenAI; data di luar itu tidak.
- Log tahapan **tanpa PII** (tanpa isi transkrip, tanpa email) — mengikuti aturan logging global.

---

## 6. Kuota & sesi

### 6.1 Menit suara
- **Menit nyata** diukur **server**: sesi mengirim *heartbeat* berkala; server menghitung dari
  waktu server (bukan klaim klien) dan menutup hitungan saat `close` atau saat sweeper menyatakan sesi mati.
- **Start gagal tidak memotong kuota** (konsisten #35).
- **60 menit/hari** untuk user dan untuk akun kiosk (admin bisa ubah; 0 = tanpa batas). Batas ini **terpisah** dari kuota teks 50/100.
- Hari dihitung WITA, seperti kuota teks.
- **Keputusan user (2026-10-02, #50):** setiap giliran suara yang dijawab Claude **juga** menghitung satu pesan pada kuota teks (50/100), selain menit suara.

### 6.2 Batas sesi
- **10 menit per sesi**; sebelum habis muncul pilihan **perpanjang manual**.
- **Auto-off setelah 2 menit hening**.
- **1 sesi per orang, total 3** (admin bisa ubah). Tab kedua milik orang yang sama **ditolak** dengan
  pesan jelas; sesi lama tidak diputus (9A).

### 6.3 Mesin status sesi (diadopsi dari FOREVIA)
```
starting ─► active ─► closing ─► (selesai)
   │           │
   │           └─► hangup_accepted
   ├─► startup_failed      (gagal jelas → kuota tidak terpotong)
   └─► startup_uncertain   (tidak tahu hasil → dibereskan sweeper)
```
- Reservasi slot **atomik** (kunci advisory DB) agar batas "1 per orang / total 3" tidak bocor saat balapan.
- *Generation guard*: callback dari sesi lama tidak boleh mengubah sesi baru.
- **Sweeper tiap ±10 detik** menutup sesi macet (tanpa heartbeat melewati tenggat).
- Galat dibedakan **recoverable** vs **fatal**; **tidak ada** `create` ulang otomatis.
- Perbedaan dari FOREVIA: FOREVIA mereservasi 600 detik dan tidak pernah mengembalikan; kita mengukur menit nyata. FOREVIA juga tidak menjangkau `/wall`.

---

## 7. Diagnostik admin (10B)
- **Log tahapan tanpa PII:** `token_issued`, `mic_ready`, `transcribing`, `chat_turn`, `tts_started`, `closed`, dengan durasi tiap tahap & kode galat. Tanpa isi ucapan.
- **Daftar sesi suara** di `/admin/ai-assistant` (**baca saja**): pengguna (ID/nama peran), mulai, durasi, status akhir, alasan tutup. **Tidak ada** tombol paksa-tutup.
- Statistik hari ini: total menit suara, sesi aktif, kegagalan start.

---

## 8. Antarmuka
- Tombol **On/Off** di panel Jenna (dinonaktifkan bila tanpa izin / slot `voice` belum siap / browser tak didukung).
- Status: **"Menghubungkan"** → **"Siap bicara"** (+ "Mendengarkan", "Menjawab").
- **Transkrip langsung** (teks muncul saat berbicara).
- Tombol **bisukan mikrofon** dan **bisukan jawaban**.
- Indikator sisa menit sesi + ajakan perpanjang.
- **Wajib Chrome/Edge desktop**; di peramban lain tampil pesan jelas. **Uji jaringan dulu** sebelum sesi (S0 menyiapkan uji ini).
- Pesan galat berbahasa Indonesia sederhana (kuota habis, sesi lain aktif, mikrofon ditolak).

---

## 9. `/wall` (layar NOC) — **TERBUKA (no. 5)**

Masalah: speaker TV yang jauh + obrolan ruangan membuat echo/salah dengar. GPT-Live memberi AEC
browser + deteksi giliran + barge-in, tetapi **tidak** menyelesaikan echo speaker jauh atau keramaian.

| Opsi | Isi | Catatan |
|---|---|---|
| **W1** | Suara dua arah penuh di `/wall`. | Risiko echo tertinggi. |
| **W2** | Hanya telinga: jawaban **teks + penunjuk**, tidak dibacakan. | Echo hilang; V2 memungkinkan. |
| **W3** *(saran)* | W2 secara default + setelan admin **"bacakan di wall"**, dinyalakan setelah uji echo nyata. | Aman dulu, bisa naik. |

**Info perangkat NOC yang dibutuhkan:** jenis perangkat, mikrofon/webcam, peramban, speaker lewat
HDMI TV atau terpisah, tingkat bising ruangan.

**S0/S1 di laptop tidak bergantung pada keputusan ini.** `/wall` baru masuk S3.

---

## 10. Rencana tahap

### S0 — Halaman uji (WAJIB, sebelum S1)
Halaman kecil sekali pakai (bukan fitur produksi). Menguji: mikrofon; jaringan WebRTC dari jaringan NOC;
kualitas id-ID; echo; **V2 vs V1-B berdampingan** (jeda diukur); **metode deteksi akhir ucapan (no. 8)**.
- **Selesai bila:** tabel hasil (jeda p50/p95, galat transkrip, echo) + rekomendasi V2 / V1-B; ambang cadangan diisi.
- **Test:** unit untuk pengukur jeda/penghitung (bila ada logika murni); sisanya manual.
- **Manual:** jalankan di laptop dan (bila ada akses) di perangkat NOC; catat hasil di dokumen.
- Butuh perintah eksplisit + konfirmasi worktree.

### S1 — V2 inti
S1a transkrip + jawaban teks + penunjuk → S1b TTS + barge-in + bisukan; banner persetujuan; izin `use-ai-voice`; satu riwayat dengan penanda suara; perbaikan bug `slots.voice`.
- **Selesai bila:** tanya-jawab suara tuntas end-to-end di laptop, riwayat tampil, penunjuk berjalan.
- **Test:** bun:test untuk endpoint token/TTS (guard 401/403, izin, slot kosong), prompt varian suara, persist modality; mock provider, **tanpa panggilan OpenAI asli**.
- **Manual:** uji bicara, sela, bisukan, tolak mikrofon, tanpa izin.

### S2 — Kuota, sesi, diagnostik penuh
Heartbeat/menit nyata, batas harian & sesi, tab kedua ditolak, mesin status + sweeper, perpanjangan, auto-off, daftar sesi admin.
- **Selesai bila:** semua batas §6 tegak; sesi macet dibereskan sweeper; admin melihat daftar sesi.
- **Test:** `tests/api` + `tests/db` (balapan reservasi, start gagal tak memotong kuota, sweeper, WITA).
- **Manual:** dua tab, cabut jaringan di tengah sesi, habiskan kuota.

### S3 — `/wall`
Menunggu no. 5 dan info perangkat NOC. Kriteria & test disusun setelah keputusan.

---

## 11. Perkiraan perubahan teknis (ESTIMASI)

**Skema (satu migrasi idempoten, `IF NOT EXISTS`, ada alasan di komentar)**
- `AssistantMessage`: kolom `modality` (default `"text"`, NOT NULL dengan DEFAULT) + `voiceDurationMs` (nullable).
- Tabel baru `AssistantVoiceSession` (id, userId, status, startedAt, lastHeartbeatAt, endedAt, billedSeconds, endReason, stageLog ringkas tanpa PII); indeks `userId`, `status`.
- `AssistantSettings`: batas menit/hari user & kiosk, menit/sesi, detik hening auto-off, sesi bersamaan per user & total, nama model (telinga/mulut), nama suara, bahasa, saklar "bacakan di wall".
- Penyimpanan persetujuan privasi per user (kolom/tabel kecil — bentuk final diputuskan di S1).
- `AiProviderConfig` slot `voice`: bentuk tipe provider OpenAI langsung (mis. `providerType` baru).

**Endpoint baru (nama perkiraan)**
- `POST /api/assistant/voice/sessions` (mulai: reservasi + token sementara) · `…/:id/heartbeat` · `…/:id/close`
- `POST /api/assistant/voice/tts` (stream audio lewat server)
- `GET /api/admin/ai-assistant/voice-sessions` (baca saja)
- `/chat/stream` menerima `modality: "voice"` → prompt varian suara.

**Perbaikan bug:** `src/api/assistant/status/status.service.ts` (sekitar baris 28) membuat `slots.voice` mengikuti `slots.chat`; slot suara harus siap **hanya** bila kunci OpenAI-nya sendiri ada (tidak boleh jatuh ke `chat`, karena proxy Claude tidak punya STT/TTS).

**Izin:** tambah `use-ai-voice` ke `FEATURES` + `DEFAULT_PERMISSIONS` (`src/utils/permission.ts`) dan baris migrasi; `resolveAllowedFeatures` sudah menjatuhkan fitur baru ke default.

**Batas file:** tiap file baru mengikuti batas global (route ≤150, service ≤300 baris); modul suara dipisah dari `chat.service.ts`.

---

## 12. Risiko & pertanyaan terbuka

| # | Risiko / pertanyaan | Penanganan |
|---|---|---|
| 1 | **No. 5** `/wall`: W1/W2/W3 + info perangkat NOC | Keputusan user; S3 menunggu. |
| 2 | **No. 8** deteksi akhir ucapan V2 | Diuji di S0 (a/b/c). |
| 3 | Ambang cadangan (jeda "terlalu lama", kesamaan "cukup sama") | Ditetapkan setelah S0. |
| 4 | Apakah OpenAI mengubah kalimat Claude pada V1-B? | Dikonfirmasi di S0 (syarat V1-B). |
| 5 | Jeda total V2 (transkrip → Claude → TTS) bisa terasa lama | S0 mengukur; TTS stream + jawaban singkat. |
| 6 | ~~Suara juga menghitung kuota teks?~~ | **Diputuskan (#50): ya**, giliran suara = 1 pesan kuota teks + menit suara. |
| 7 | Nama model/harga OpenAI berubah | Nama = setelan admin; harga tidak ditulis di sini. |
| 8 | Belum terbukti di FOREVIA: Safari, percakapan manusia nyata, sesi 10 menit nyata, penggunaan final | Dibatasi Chrome/Edge; diuji di S0/S1. |

---

## 13. Verifikasi model & endpoint OpenAI

Dicek langsung ke dokumentasi resmi OpenAI pada **2026-10-02**. Singkatan URL:
`P` = `https://platform.openai.com/docs/guides/`, `R` = `https://platform.openai.com/docs/api-reference/`,
`D` = `https://developers.openai.com/api/docs/guides/`. Tidak ada panggilan API sungguhan, tidak ada
kunci yang dipakai. **Harga tidak dicek dan tidak ditulis di dokumen ini** (perlu dikonfirmasi sebelum S1).

| Item | Nama / endpoint menurut docs | Sumber | Status |
|---|---|---|---|
| Telinga (transkripsi streaming) | model `gpt-live-transcribe`; `session.update` dengan `session.type:"transcription"`, `audio.input.transcription.model`, audio `audio/pcm` 24000 Hz; koneksi WebSocket (server) atau WebRTC (audio browser) | `P`realtime-transcription | terverifikasi |
| Opsi konteks transkripsi | `prompt`, `keywords` (petunjuk, bukan paksaan), `languages` (ISO 639-1), `delay` | `P`realtime-transcription | terverifikasi |
| Deteksi akhir ucapan | `gpt-live-transcribe`: `turn_detection` harus kosong/`null`; `server_vad` & `semantic_vad` **tidak didukung** → di V2 kita sendiri yang menentukan (no. 8) | `P`realtime-transcription | terverifikasi |
| Model alternatif | `gpt-transcribe`: hanya WebSocket + `input_audio_buffer.commit`; mengembalikan bahasa terdeteksi | `P`realtime-transcription | terverifikasi |
| Bahasa Indonesia di `gpt-live-transcribe` | hanya format kode bahasa yang disebut; daftar bahasa tak terbaca | `P`realtime-transcription | **perlu dikonfirmasi** (uji kualitas id-ID di S0) |
| Token sementara | `POST https://api.openai.com/v1/realtime/client_secrets` (Bearer = kunci dari server); respons `value` (`ek_…`) + `expires_at`; `expires_after:{anchor:"created_at",seconds:N}` | `R`realtime-sessions/create-realtime-client-secret; `P`voice-webrtc | terverifikasi |
| TTL token (nilai default & batas) | contoh 600 detik; default/min/maks tak terbaca | sama | **perlu dikonfirmasi** |
| Token sementara untuk sesi `type:"transcription"` | contoh docs hanya untuk `type:"realtime"` | `P`voice-webrtc | **perlu dikonfirmasi** (uji di S0; bila tak bisa, jalur telinga lewat server/WebSocket) |
| Kirim SDP (WebRTC) | browser `POST https://api.openai.com/v1/realtime/calls` dengan token sementara (atau lewat server dengan kunci) | `P`voice-webrtc | terverifikasi |
| Identitas pengguna | header `OpenAI-Safety-Identifier: <id ter-hash>` pada `client_secrets`, `calls`, WebSocket → kita kirim hash ID user, bukan email | `P`voice-webrtc | terverifikasi |
| Model speech-to-speech (V1-B) | contoh docs: `gpt-realtime-2.1` (`type:"realtime"`) dan `gpt-live-1` (halaman delegasi); API reference memakai `gpt-realtime` | `P`voice-webrtc; `D`live-delegation | nama terverifikasi; hubungan antar nama **perlu dikonfirmasi** |
| Delegasi klien (V1-B) | sesi `delegation:{type:"client"}`; event `session.delegation.created`; hasil dikirim balik lewat `session.commentary.append` (+ `delegation_id`, `content`) | `D`live-delegation | terverifikasi |
| **Apakah kalimat Claude dibacakan persis?** | `commentary.append` dibacakan GPT-Live, tetapi model "dilatih memparafrase". Tidak ada mode "bacakan persis" yang dijamin | `D`live-delegation | **terverifikasi: ada parafrase, tanpa jaminan verbatim** → syarat V1-B terancam; mode verbatim **perlu dikonfirmasi** (S0) |
| Delegasi via Responses (V1-A) | `response.item.create` (`function_call_output`) lalu `response.create` | `D`live-delegation | terverifikasi |
| Kontrol sisi server | `session.instructions.append` (maks 500 token) | `P`voice-server-controls | terverifikasi |
| Mulut (TTS) | `POST https://api.openai.com/v1/audio/speech`, model `gpt-4o-mini-tts`, parameter `input`, `voice`, `instructions` | `P`text-to-speech; `R`audio/createSpeech | terverifikasi |
| Streaming & format TTS | streaming didukung (`stream_format:"sse"` di contoh); keluaran mp3 (default), opus, aac, flac, wav, pcm (24 kHz 16-bit) | sama | terverifikasi |
| Suara TTS | 11 suara bawaan (contoh `alloy`, `coral`) | `P`text-to-speech | jumlah terverifikasi; **daftar nama perlu dikonfirmasi** |
| Bahasa Indonesia di TTS | Indonesia ada di daftar bahasa; docs mencatat suara dioptimalkan untuk Inggris | `P`text-to-speech | didukung; **kualitas perlu diuji** (S0) |
| Pengungkapan suara AI | usage policies mewajibkan pemberitahuan jelas bahwa suara dibuat AI → dasar banner §5 | `P`text-to-speech | terverifikasi |
| Browser langsung ke TTS dengan token sementara | tidak terdokumentasi (token sementara hanya untuk Realtime) | `P`text-to-speech | **tidak terdokumentasi** → TTS lewat server kita (§3.5) |
| Harga | tidak dicek | — | **perlu dikonfirmasi** |

**Dua temuan penting**
1. **Syarat V1-B terancam:** karena GPT-Live memparafrase teks delegasi, kalimat Claude bisa berubah. S0 harus mengukurnya; bila terbukti berubah, V1-B gugur dan V2 tetap jalur utama.
2. **V2 tidak punya deteksi akhir ucapan bawaan** (transkripsi tanpa VAD) → metode no. 8 memang harus dipilih di S0.

Semua nama model di atas hanya **contoh dari docs saat ini**; di kode disimpan sebagai setelan admin (keputusan #13), jadi bisa diganti tanpa deploy.
