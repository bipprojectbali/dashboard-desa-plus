# Diskusi Fitur 3 — AI Suara (full duplex, provider OpenAI)

> **Status: ANALISA / USULAN — belum ada keputusan, belum ada kode.** Disusun worker `ai_suara` (2026-10-02).
> Keputusan user yang menjadi dasar (2026-10-02): mode suara ala ChatGPT Voice, **full duplex** (AI tetap
> mendengar saat berbicara, boleh dipotong), ada **area teks** yang menampilkan ucapan secara langsung, dan
> (opsional) **pointer** bergerak sesuai perintah suara lewat Fitur 2. **Provider suara = OpenAI (bukan Claude)**;
> user sudah menyiapkan API key OpenAI. Dokumen ini **tidak memuat, tidak meminta, dan tidak menguji API key apa pun.**
> Menggantikan analisa lama di `06-fitur-3-suara.md` (rekomendasi lama "Web Speech dulu" tidak cocok untuk full duplex, lihat §2.4).

---

## 0. Istilah singkat


| Istilah                         | Arti sederhana                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Full duplex**                 | Dua arah sekaligus, seperti telepon: user boleh bicara saat AI sedang bicara. Lawannya *half duplex* (walkie-talkie: gantian). |
| **Barge-in**                    | User memotong AI di tengah kalimat; AI langsung diam dan mendengarkan.                                                         |
| **STT / TTS**                   | *Speech-to-Text* (suara jadi teks) / *Text-to-Speech* (teks jadi suara).                                                       |
| **Speech-to-speech (realtime)** | Satu model yang langsung menerima suara dan mengeluarkan suara, tanpa lewat teks dulu. Cepat dan natural.                      |
| **VAD**                         | *Voice Activity Detection*: deteksi kapan user mulai/selesai bicara.                                                           |
| **WebRTC**                      | Teknologi browser untuk telepon/video langsung (suara dua arah, latensi rendah). Sudah ada di Chrome/Edge.                     |
| **WebSocket / SSE**             | Saluran data terbuka antara browser dan server. WebSocket dua arah; SSE satu arah (server → browser).                          |
| **Ephemeral token**             | Kunci sekali-pakai, umur pendek, dibuat server untuk satu sesi; browser memakainya, **kunci asli tidak pernah ke browser**.    |
| **AEC**                         | *Acoustic Echo Cancellation*: peredam gema, supaya mikrofon tidak "mendengar" suara AI dari speaker.                           |
| **Tool calling**                | Model meminta server menjalankan fungsi (mis. ambil data APBDes), lalu memakai hasilnya untuk menjawab.                        |


---

## 1. Gambaran sederhana dari sisi pengguna

```
[ ✦ Jenna ]  →  tekan ikon 🎙 "AI Suara"  →  browser minta izin mikrofon (sekali)
                                            →  muncul pemberitahuan: "Suara Anda dikirim ke OpenAI. Tidak disimpan."
   ┌──────────────── panel Jenna (mode suara) ───────────────┐
   │  ● Mendengarkan…                         [ 🎙 aktif ]   │
   │                                                          │
   │  Anda  : "Berapa realisasi APBDes tahun ini?"   ← teks muncul sambil Anda bicara
   │  Jenna : "Realisasi belanja sekitar 62 persen…" ← teks muncul sambil Jenna bicara
   │                                                          │
   │  (Anda memotong: "tunjukkan di grafiknya")  → Jenna diam, langsung menanggapi
   │  → kursor bergerak ke kartu "Realisasi" (Fitur 2)       │
   │                                          [ ⏹ Selesai ]  │
   └──────────────────────────────────────────────────────────┘
```

Alur dalam enam langkah:

1. User menekan **AI Suara** → browser meminta izin mikrofon.
2. Mikrofon menyala (ada indikator jelas), AI **mendengarkan terus**.
3. Ucapan user tampil sebagai **teks langsung** (area transkrip), kata demi kata.
4. AI menjawab dengan suara + teks jawaban tampil bersamaan; riwayat disimpan sebagai pesan biasa.
5. User boleh **memotong** kapan saja (barge-in); AI berhenti dan mendengar.
6. Bila user minta "tunjukkan/buka/klik…", pointer Fitur 2 bergerak sambil AI menjelaskan.
Mode mati sendiri bila diam terlalu lama atau user menekan **Selesai**.

---

## 2. Kemungkinan arsitektur

Kerangka yang sama untuk semua opsi: **browser tidak pernah memegang kunci asli**, **izin pengguna dan tool tetap ditegakkan server**,
dan **tool/aksi UI memakai registry + `ToolContext` yang sama dengan chat teks** (tidak ada otak kedua yang melewati izin).

### 2.1 Opsi (a) — Realtime speech-to-speech OpenAI (WebRTC)

**Cara kerja.** Browser membuka sambungan WebRTC langsung ke OpenAI: track mikrofon dikirim, audio jawaban diterima, dan
*data channel* `oai-events` membawa event teks (transkrip, panggilan tool). Server dashboard hanya **menerbitkan sesi**:

- Varian a-i (ephemeral token): server memakai key OpenAI dari slot `voice` untuk membuat *client secret* sekali-pakai
(konfigurasi sesi — model, suara, instruksi, daftar tool — ditetapkan server saat itu). Browser memakai token itu.
- Varian a-ii (SDP lewat server, sesuai docs "browser POST SDP ke server aplikasi Anda"): browser mengirim SDP ke
`/api/assistant/voice/...`, server meneruskannya ke OpenAI dengan key asli dan mengembalikan jawaban SDP. Server
mendapat *call id* sehingga bisa memasang **sideband WebSocket** (lihat tool-calling di bawah).

**Transkrip langsung.** Event data channel/WebSocket menyediakan transkrip masukan dan keluaran bertahap
(`input_transcript.delta`, `output_transcript.delta` — nama event sesuai docs yang dibaca; verifikasi saat implementasi).
UI tinggal menambah teks ke area transkrip. Transkrip akhir disimpan ke `AssistantMessage` (hanya teks).

**Pointer (Fitur 2).** Fitur 2 sudah memutuskan: model memanggil tool `buka_halaman` / `tunjukkan_elemen` / `klik_elemen` / `pilih`,
hasilnya `actions` yang dijalankan frontend. Di mode suara, definisi tool yang sama dikirim ke sesi realtime; saat model
memanggilnya, browser meneruskan ke server, server memvalidasi (target terdaftar + izin) dan mengembalikan `actions`,
browser menjalankannya lewat executor aksi UI yang **sama** dengan chat teks.

**Tool calling → registry, izin, kuota (inti keamanan).**

- *Daftar tool yang dilihat model* dibangun server dari `getAvailableTools(ctx, ASSISTANT_TOOLS)` (sudah memfilter per izin sesi) saat sesi dibuat.
- *Eksekusi* tetap di server: endpoint baru (mis. `POST /api/assistant/voice/tool`) memeriksa sesi + `use-ai-assistant` (`authorizeAssistantUser`),
memastikan nama tool ada di daftar yang diizinkan untuk user itu, lalu menjalankan handler dengan `ToolContext.allowedFeatures` dari sesi
(bukan dari argumen model). Output dibungkus `wrapToolResult` + dibatasi 8000 karakter seperti chat. Browser meneruskan hasil ke model (`function_call_output` + minta jawaban).
- Model realtime **tidak** pernah punya kredensial tool; docs OpenAI sendiri menyarankan eksekusi tool &amp; otorisasi di backend (*server controls*).
- Varian **sideband** (server ikut mendengar event sesi lewat WebSocket keluar ke OpenAI): server melihat setiap panggilan tool, bisa mencatat audit,
memutus sesi, dan menyuntik instruksi. Bun mendukung WebSocket **keluar** secara bawaan, jadi ini **tidak** butuh server WebSocket masuk.
Aksi UI tetap harus sampai ke browser — lewat data channel/endpoint terpisah — sehingga sideband baru berguna sebagai tahap lanjut.

**Kunci &amp; keamanan.** Key OpenAI hanya di server (slot `voice`, §4). Token ephemeral berumur pendek dan terikat konfigurasi sesi.
Risiko baru: audio user keluar ke pihak ketiga (privasi, §6.5); browser (tak tepercaya) yang meneruskan panggilan tool — tidak bisa menaikkan hak karena server memeriksa ulang, tetapi bisa melaporkan "giliran" palsu (relevan untuk kuota).

**Kuota.** Pesan teks dihitung dari baris `AssistantMessage` role `user`. Untuk suara definisi "1 pesan" ambigu (1 giliran bicara? 1 sesi? per menit?).
Usulan: **kuota menit suara terpisah** (mis. X menit/hari per user, Y untuk kiosk), ditegakkan server **di saat menerbitkan sesi/token** (umur token = sisa menit; sesi putus otomatis),
sehingga tidak bergantung pada laporan browser. Pertanyaan Q6.

**Biaya &amp; latensi.** Latensi ucapan→jawaban umumnya sub-detik hingga ±1 detik (satu model langsung suara→suara, tanpa tiga langkah). Biaya dihitung per token audio / per menit; angka resmi **harus dikonfirmasi** di
halaman harga sebelum keputusan (cuplikan docs menampilkan `gpt-live-1` ≈ $0,05/menit, tetapi konteks tabelnya tidak jelas — jangan dianggap pasti). Model berubah cepat (docs menyebut `gpt-live-1` dan `gpt-realtime-2.1`).

**Kebutuhan server Bun/Elysia.** Varian a-i: hanya endpoint HTTP biasa (terbit token + eksekusi tool) — **tidak butuh WebSocket/SSE di server**. Varian a-ii: endpoint HTTP untuk SDP. Sideband: WebSocket keluar saja.

**Chrome/Edge desktop.** `getUserMedia` + WebRTC didukung penuh. Syarat: HTTPS (staging sudah HTTPS). UDP keluar ke OpenAI harus tidak diblokir firewall jaringan kantor/desa — **gap yang harus diuji** (WebRTC bisa gagal di jaringan ketat; fallback WebSocket tidak tersedia untuk browser tanpa proxy audio).

**Gema (AEC).** Browser menyediakan `echoCancellation`, `noiseSuppression`, `autoGainControl` pada `getUserMedia`, dan AEC bekerja baik saat audio keluaran diputar lewat elemen/stream WebRTC yang sama. Cukup baik untuk laptop/headset; untuk TV `/wall` (speaker jauh + mikrofon) gema sulit — lihat Q8.

**Kecocokan keputusan.** #1 (chat Claude) tidak dilanggar: suara memakai slot `voice` (#9). #3 baca-saja: tool sama, tetap baca-saja. #16: hasil tool sudah disaring; **catatan:** data hasil tool kini terkirim juga ke OpenAI (pihak ketiga kedua) — perlu persetujuan user (Q2). #35: giliran/sesi gagal tidak dihitung. #25/#27: kiosk memakai akun khusus + kuota sendiri.

### 2.2 Opsi (b) — Pipeline: STT streaming → otak chat → TTS streaming (dengan VAD &amp; barge-in)

**Cara kerja.** Mikrofon → STT streaming (OpenAI transcription) → teks dikirim ke **otak chat yang ada** (`executeWithTools`) → jawaban teks → TTS streaming → speaker.
VAD menentukan akhir ucapan; barge-in dibuat sendiri (saat VAD mendeteksi user bicara, hentikan pemutaran TTS dan batalkan permintaan).

**Transkrip langsung.** Mudah: STT streaming menghasilkan teks parsial.
**Pointer.** Paling mulus: karena lewat otak chat yang sama, `actions` Fitur 2 sudah ikut keluar dari loop yang ada.
**Kunci &amp; keamanan.** Key OpenAI di slot `voice` dipakai server untuk STT/TTS (atau token ephemeral untuk STT langsung dari browser). Otak = Claude sama seperti chat teks → izin, data, kuota **identik** (paling konsisten dengan keputusan #1, #3, #16, #35).
**Kuota.** Natural: 1 ucapan final = 1 pesan (persis `AssistantMessage` yang ada), plus biaya STT/TTS terpisah.
**Biaya &amp; latensi.** Biaya STT+TTS+LLM per giliran; latensi **terburuk**: STT final + loop tool non-streaming (sampai 6 iterasi, batas giliran 60 dtk) + sintesis TTS. Tanpa streaming jawaban (`chatStream` belum ada di pondasi, `03-pondasi.md:216`; SSE baru direncanakan F1-e), jeda bisa beberapa detik — terasa bukan "ChatGPT Voice".
**Kebutuhan server.** Butuh **streaming** (SSE untuk token → TTS dini) dan, bila audio lewat server, **WebSocket masuk** (`.ws()` Elysia didukung tetapi belum dipakai di repo; perlu diuji di balik proxy Portainer). Atau STT langsung dari browser dengan token ephemeral.
**Chrome/Edge.** Aman (MediaRecorder/AudioWorklet + `getUserMedia`).
**Gema.** Tantangan terbesar: TTS diputar dari elemen audio biasa, sehingga AEC browser kurang efektif dan VAD buatan sendiri bisa memotong AI karena mendengar suaranya sendiri → perlu headset atau ambang barge-in konservatif.
**Kecocokan keputusan.** Paling cocok (otak tunggal Claude), tetapi tidak benar-benar full duplex natural, dan butuh SSE/WebSocket yang belum ada.

### 2.3 Opsi (c) — Hibrida: suara realtime OpenAI + otak data tetap lewat server

**Cara kerja.** Model realtime OpenAI mengurus **mendengar, berbicara, VAD, barge-in** (kelebihan opsi a), sementara pertanyaan data/penalaran berat didelegasikan ke
**otak chat yang sudah ada** lewat satu tool (mis. `tanya_otak_chat(pertanyaan)`): server menjalankan `executeWithTools` (Claude) dan mengembalikan teks jawaban + `actions` untuk dibacakan model suara.
Docs OpenAI sendiri menyebut pola "delegation" ke model backend pada model live.

**Transkrip, pointer, kunci, kuota.** Transkrip &amp; pointer seperti (a). Kuota: pertanyaan yang didelegasikan = 1 pesan chat (definisi sudah ada, termasuk aturan #35); suara tetap dibatasi menit.
**Biaya &amp; latensi.** Biaya suara (a) + biaya Claude per pertanyaan data; latensi pertanyaan data lebih lambat (ada loop Claude non-streaming), tetapi basa-basi, klarifikasi, dan potong-bicara tetap cepat. Bisa dibuat "tunggu sebentar, saya cek datanya" selagi menunggu.
**Server/Chrome/AEC.** Sama dengan (a) (HTTP + WebRTC); delegasi hanya endpoint HTTP.
**Kecocokan keputusan.** Paling dekat dengan prinsip "satu otak": data/izin/prompt/kuota tetap satu jalur. Ongkosnya: kompleksitas lebih tinggi + latensi data.

### 2.4 Mengapa bukan Web Speech API (tingkat 1 draf lama)

`SpeechRecognition` + `speechSynthesis` di Chrome bukan full duplex yang baik: suara TTS bocor ke pengenalan (gema), audio diproses layanan Google, tidak ada barge-in sungguhan, dan kualitas suara id-ID terbatas.
Cocok hanya sebagai **fallback ketik-bicara sederhana**; tidak memenuhi permintaan user.

### 2.5 Perbandingan ringkas


| Aspek                | (a) Realtime OpenAI                    | (b) STT→Claude→TTS                       | (c) Hibrida                   |
| -------------------- | -------------------------------------- | ---------------------------------------- | ----------------------------- |
| Rasa percakapan      | Natural, potong-bicara mulus           | Terasa gantian, jeda                     | Natural, jeda saat tanya data |
| Latensi              | Rendah                                 | Tinggi (non-streaming)                   | Rendah / sedang untuk data    |
| Otak                 | OpenAI (model kedua)                   | Claude (satu otak)                       | OpenAI suara + Claude data    |
| Tool/izin            | Registry yang sama (endpoint baru)     | Sama (loop yang ada)                     | Sama                          |
| WebSocket/SSE server | Tidak perlu (token), opsional sideband | Perlu SSE (+ WS bila audio lewat server) | Tidak perlu                   |
| Gema                 | AEC browser bekerja baik               | Sulit                                    | Baik                          |
| Kompleksitas         | Sedang                                 | Tinggi                                   | Sedang–tinggi                 |
| Kuota                | Menit (usulan)                         | Per pesan (natural)                      | Menit + per pertanyaan data   |


---

## 3. Fakta kode terverifikasi &amp; gap infrastruktur

Fakta (dibaca langsung, 2026-10-02):


| Fakta                                                                                                                                                                        | Lokasi                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Satu-satunya tipe provider yang didukung `openai-compatible`; `isSlotUsable` mensyaratkan tipe itu + baseUrl + apiKeyEnc + model                                             | `src/api/assistant/provider/resolve.ts:28`, `:31`                                  |
| `pickSlot` jatuh balik slot non-chat ke `chat` bila kosong; `getProvider` selalu membangun `OpenAICompatibleProvider`                                                        | `resolve.ts:42`                                                                    |
| **Bug status siap-suara:** `slots[slot] = cryptoConfigured && pickSlot(...) !== null` → `slots.voice` otomatis `true` bila slot chat jalan (padahal Claude tidak bisa suara) | `src/api/assistant/status/status.service.ts:28`                                    |
| Slot fitur: `PROVIDER_FEATURES` = chat/pointer/voice; `ProviderSlotDto.providerType` ada                                                                                     | `src/types/ai-assistant-admin.ts`; `prisma/schema.prisma:842` (`AiProviderConfig`) |
| Akses assistant: sesi browser saja + user terverifikasi + izin `use-ai-assistant` + role dari DB                                                                             | `src/api/assistant/http/access.ts:61` (`authorizeAssistantUser`)                   |
| Otak chat: `executeWithTools` non-streaming; maks 6 iterasi, tool 20 dtk, giliran 60 dtk, hasil maks 8000 karakter; `runTool` **private**                                    | `src/api/assistant/tools/executor.ts:18-23`, `:79`, `:113-200`                     |
| Kuota harian dihitung dari `AssistantMessage` role `user` &amp; status ≠ `error`; kiosk memakai `kioskUserId`; batas hari WITA; rate limiter in-memory (satu container)      | `limits/usage.ts`, `limits/usage.repo.ts`                                          |
| `AssistantMessage` **tanpa** kolom kanal/modalitas (suara vs teks) dan tanpa durasi                                                                                          | `prisma/schema.prisma:877`                                                         |
| Endpoint chat `POST /api/assistant/chat`; `actions: AssistantUiAction[]` saat ini bertipe `never`                                                                            | `routes/chat.route.ts`; `src/types/ai-assistant-chat.ts:34,49`                     |
| **Tidak ada WebSocket/SSE di server**; `app.listen(PORT)` tanpa `.ws()`; satu-satunya WS = HMR Vite (port 24678)                                                             | `src/index.ts:399`; `src/vite.ts:22`                                               |
| `chatStream` belum ada di provider; SSE baru direncanakan F1-e                                                                                                               | `03-pondasi.md:216`; `04-fitur-1-chat-panel.md:61`                                 |
| Tidak ada `getUserMedia`, `SpeechRecognition`, `speechSynthesis`, `Permissions-Policy`/CSP yang membatasi mikrofon                                                           | grep `src/` kosong                                                                 |
| Mikrofon butuh HTTPS; staging sudah HTTPS. Deploy lewat Portainer (`oven/bun:1.3`); `docs/DEPLOYMENT.md` tidak menyebut reverse-proxy/WebSocket                              | `docs/DEPLOYMENT.md`                                                               |
| FAB punya varian `"wall"`; tempat tombol mikrofon wajar: `AssistantComposer` / header panel                                                                                  | `src/components/assistant/assistant-fab.tsx`, `assistant-composer.tsx`             |


Gap yang harus ditutup (urut kebutuhan MVP opsi a/c):

1. **Tipe provider baru** (mis. `openai-realtime`) + resolver khusus suara; **matikan fallback ke chat** untuk audio; perbaiki status `slots.voice`; tes koneksi khusus suara (tanpa memanggil model chat).
2. **Penerbit sesi suara** (endpoint server) + **endpoint eksekusi tool** untuk suara; ekspor satu fungsi "jalankan satu tool" dari `executor.ts` (saat ini `runTool` private).
3. **Pelacakan pemakaian suara**: kolom modalitas/kanal di `AssistantMessage` (+ opsi tabel sesi suara berisi menit) lewat migrasi idempoten; pengaturan batas menit di tabel pengaturan.
4. **Prompt varian suara** (jawaban pendek, tanpa markdown, tanpa membacakan tabel panjang).
5. **UI**: tombol AI Suara, indikator mikrofon, area transkrip, status (mendengarkan/berbicara), auto-off.
6. **Uji jaringan**: UDP/WebRTC dari jaringan NOC/desa ke OpenAI.
7. (Hanya opsi b) SSE/`chatStream` dan/atau WebSocket masuk + uji di balik proxy Portainer; periksa `idleTimeout` bawaan Bun (±10 dtk) untuk koneksi panjang.

---

## 4. Key OpenAI di slot `voice`, tool calling, dan kuota

### 4.1 Penyimpanan key (tanpa menampilkan/menguji key)

- Key OpenAI diisi admin lewat halaman admin **slot Suara** — mekanisme sama dengan slot lain: terenkripsi AES-256-GCM dengan `AI_CREDENTIALS_KEY`, disimpan di `AiProviderConfig.apiKeyEnc`, **hanya dibaca server**, tanpa awalan `VITE_`, tidak pernah dikirim ke browser (browser hanya menerima token ephemeral).
- Slot `voice` diberi **`providerType` baru** (usulan `openai-realtime`; `baseUrl` default OpenAI, `model` mis. nama model realtime yang dipilih admin, field suara/bahasa opsional). Tipe `openai-compatible` **tidak** dipakai untuk suara.
- **Slot `voice` tidak boleh jatuh balik ke `chat`** (Claude tidak punya audio). Slot kosong = mode suara nonaktif + tombol disembunyikan; `AssistantStatusDto.slots.voice` harus berarti "slot suara terisi dan lolos tes", bukan "chat siap" (gap §3 no. 1).
- Tes koneksi admin untuk slot suara: pembuatan sesi percobaan tanpa audio. Dirancang saat implementasi; **tidak dijalankan di tahap analisa ini**.
- Header `OpenAI-Safety-Identifier` (ID user ter-hash) dianjurkan docs OpenAI; ID asli/email tidak dikirim.

### 4.2 Tool calling realtime ↔ registry yang sama

Urutan untuk opsi (a)/(c) varian a-i:

1. User menekan AI Suara → browser `POST /api/assistant/voice/session` (sesi browser + `use-ai-assistant`; cek kuota menit; cek rate limit).
2. Server membangun `ToolContext` + daftar tool izin → menerbitkan token ephemeral berisi instruksi suara + definisi tool **yang boleh** → mengembalikan token + batas durasi.
3. Browser membuka WebRTC ke OpenAI; mikrofon mengalir; transkrip muncul.
4. Model meminta tool → event dikirim ke browser → browser `POST /api/assistant/voice/tool` `{name, args, callId}`.
5. Server: validasi sesi, nama tool ∈ daftar izin user, jalankan handler dengan `ctx` dari sesi, `wrapToolResult`/batas karakter, kembalikan `{result, actions}`.
6. Browser menjalankan `actions` (Fitur 2) dan mengirim `function_call_output` ke model; model menjawab dengan suara.

Kesimpulan: tidak ada jalur yang melewati registry/izin; kuota ditegakkan di langkah 1 (menit) dan 5 (opsional: hitung panggilan tool). Sideband (a-ii) menambah audit server, tahap lanjut.

### 4.3 Kuota "1 pesan" untuk suara (opsi definisi)


| Opsi                                                                                                                              | Definisi                               | Catatan                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| K1                                                                                                                                | **Menit suara/hari** terpisah (usulan) | Ditegakkan server saat terbit token; paling jujur dengan biaya; tidak mengganggu kuota teks 50/100                                       |
| K2                                                                                                                                | 1 giliran ucapan = 1 pesan             | Cocok dengan model teks, tetapi giliran dilaporkan browser (dapat dimanipulasi) kecuali sideband; giliran pendek bisa menghabiskan kuota |
| K3                                                                                                                                | 1 sesi suara = 1 pesan                 | Sederhana, tetapi sesi panjang jadi murah di kuota padahal mahal di biaya                                                                |
| Aturan #35 (gagal tidak dihitung) berlaku di semua opsi: sesi gagal tersambung / terputus karena provider tidak mengurangi kuota. |                                        |                                                                                                                                          |


---

## 5. Otak: Claude (chat) + OpenAI (suara)? Atau OpenAI saja di mode suara?

Fakta: di opsi (a), model realtime OpenAI **adalah otak kedua** saat suara aktif (ia yang menalar dan memutuskan tool); Claude tidak ikut.
Prinsip "satu otak" tetap terpenuhi hanya bila **semua** tool, izin, penyaringan data, dan kuota melewati jalur server yang sama (§4.2) — model suara hanya "penutur".
Konsekuensi jujur yang harus disadari user: **gaya dan kualitas jawaban berbeda** antara teks (Claude) dan suara (OpenAI), prompt harus dibuat dua versi, dan data hasil tool yang disaring (#16) kini juga dikirim ke OpenAI.


| Opsi | Arti                                                                                                                       | Plus                                                      | Minus                                                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| O1   | Dua provider: Claude untuk chat teks, OpenAI untuk suara **dan** menalar di mode suara (opsi a)                            | Paling natural, paling cepat dibangun                     | Dua kepribadian; satu pihak ketiga tambahan menerima data |
| O2   | Dua provider + **delegasi**: OpenAI hanya suara, pertanyaan data dijawab otak Claude lewat tool `tanya_otak_chat` (opsi c) | Jawaban data konsisten dengan chat; satu jalur data/kuota | Lebih lambat untuk pertanyaan data; kompleksitas          |
| O3   | Pipeline: Claude menalar, OpenAI hanya STT/TTS (opsi b)                                                                    | Satu otak sungguhan                                       | Tidak full duplex natural; butuh streaming                |


**Rekomendasi: O1 untuk MVP, dirancang agar bisa naik ke O2** (tool delegasi ditambahkan tanpa mengubah arsitektur). Alasan: tujuan user adalah rasa percakapan ChatGPT Voice, yang hanya dicapai model suara-ke-suara; selama tool &amp; izin satu jalur, risikonya terkendali.
Bila belakangan jawaban data suara terasa tidak seragam dengan chat, aktifkan O2.

---

## 6. Rekomendasi

**Arsitektur: opsi (a) untuk MVP — Realtime OpenAI lewat WebRTC dengan token ephemeral, tool via endpoint server yang sama, kuota menit; lalu bergeser ke (c) dan sideband bila perlu.** Bukan (b), bukan Web Speech.

Alasan:

1. Satu-satunya yang benar-benar full duplex dengan barge-in &amp; transkrip langsung tanpa membangun VAD/AEC sendiri.
2. **Tidak butuh WebSocket/SSE di server Bun** (infrastruktur belum ada; menghindari risiko proxy/Portainer) — cukup dua endpoint HTTP.
3. Key tetap di server (slot `voice` terenkripsi); browser hanya memegang token umur pendek.
4. Tool, izin, kuota satu jalur dengan chat (registry yang sama); Fitur 2 tinggal memakai executor aksi UI yang sama.
5. (b) membutuhkan streaming yang belum ada dan hasilnya gantian, bukan duplex.

### MVP (S1)

- Slot `voice` + `providerType` baru + perbaiki status &amp; fallback; tes koneksi suara (admin).
- Endpoint terbit sesi + endpoint eksekusi tool (ekspor `runTool`); prompt varian suara.
- UI: tombol AI Suara, transkrip langsung, indikator mikrofon, tombol Selesai, auto-off diam N detik, batas durasi sesi.
- **Tekan-untuk-bicara + mode terus-mendengar di laptop dengan headset**; **kiosk `/wall`: dimatikan** pada MVP (Q8).
- Migrasi idempoten: kolom modalitas `AssistantMessage`; pengaturan batas menit (admin).
- Pointer: aksi Fitur 2 ikut (tool sama). Bila Fitur 2 belum selesai, S1 hanya suara + transkrip; pointer menyusul tanpa mengubah desain.
- Test: tool-guard (nama tool di luar izin ditolak), kuota menit, tanpa key/tanpa izin → 401/403, slot kosong → mode suara mati. Tanpa memanggil OpenAI sungguhan (mock).

### Tahap lanjut

- S2: delegasi ke otak chat (O2), sideband WebSocket (audit &amp; pemutusan sesi), laporan pemakaian suara di admin.
- S3: kiosk `/wall` suara (setelah uji gema/jaringan di TV sungguhan), pemilihan suara/aksen, deteksi bahasa campur (Indonesia–Bali–Inggris).
- Opsional: fallback "ketik/dengar" Web Speech bila WebRTC diblokir jaringan.

### 6.5 Risiko &amp; catatan yang harus dipegang

- **Privasi:** audio dan hasil tool dikirim ke OpenAI; tampilkan pemberitahuan sebelum mikrofon pertama kali menyala; audio **tidak disimpan** oleh dashboard; transkrip teks disimpan seperti chat. Mikrofon selalu menyala di ruang NOC bisa menangkap percakapan sekitar → indikator jelas + auto-off. Tinjau UU PDP bila desa memproses data warga lewat suara.
- **Biaya tak terduga:** sesi terbuka terus = biaya jalan terus → batas menit, batas sesi, auto-off wajib.
- **Model &amp; harga berubah cepat** → nama model dibuat setelan admin, bukan hard-code (aturan global #15).
- **Jaringan:** WebRTC/UDP bisa diblokir; uji dari jaringan target sebelum menjanjikan fitur.
- **Rate limiter in-memory** (satu container) cukup untuk saat ini; kuota menit disimpan di DB.

---

## 7. Pertanyaan untuk user

Format: pertanyaan → opsi → **saran**.

1. **Provider suara.** OpenAI Realtime (a/c) atau pipeline STT/TTS OpenAI (b)? Alternatif lain yang diteliti: Gemini Live (id didukung, token ephemeral sejenis; di luar keputusan "OpenAI").  
**Saran: OpenAI Realtime (a). Jawab:** Gunakan OpenAI Realtime
2. **Data hasil tool ke OpenAI.** Setuju data yang sudah disaring (#16: tanpa nama, koordinat, teks warga) ikut dikirim ke OpenAI saat mode suara? (Chat tetap ke Claude.)  
Opsi: ya / ya tapi hanya angka agregat / tidak (suara hanya navigasi).  **Saran: ya, data tersaring sama seperti chat. Jawab:** Ya kirim ke OpenAI tapi bagaimana agar text nya juga masuk ke Claude dan tetap menggunakan Claude sebagai sarana penunjuk dan jawab nya jadi OpenAI sebagai penerima input suara? Bagaimana menurut anda ?
3. **Otak mode suara.** O1 (OpenAI menalar di suara), O2 (delegasi ke Claude), atau O3 (pipeline)?  **Saran: O1 dulu, siapkan jalan ke O2. Jawab: Setuju ini sama seperti jawaban saya di nomor 2**
4. **Bahasa &amp; aksen.** Bahasa Indonesia saja, atau Indonesia + Inggris, atau campur Bali? Suara laki-laki/perempuan, formal/santai? Perlu uji kualitas id-ID dengan ucapan nyata (nama tempat/istilah APBDes).  
**Saran: Indonesia (id-ID) formal-ramah, nama suara dipilih admin; Inggris diizinkan bila user memulai. Jawab: Setuju**
5. **Cara mikrofon.** Selalu mendengar (terus) atau tekan-untuk-bicara? Auto-off setelah berapa menit diam?
Opsi: terus / tekan-bicara / keduanya.  **Saran: keduanya; default tekan-untuk-bicara di** `/wall`**, terus-mendengar di laptop; auto-off 2 menit diam. Jawab: Tetap gunakan metode 'On / Off' Tapi saran 2 menit diam itu tetap di jalankan agar jika lupa di Off kan AI biss auto off**
6. **Definisi kuota suara.** K1 menit/hari, K2 per giliran, K3 per sesi? Batas awal?  **Saran: K1 — mis. 30 menit/hari user, 60 menit/hari kiosk, bisa diatur admin; tidak mengurangi kuota teks 50/100. Jawab: Naik an jadi  60 menit/hari user sisa, sisanya setuju atur di bagian admin.**
7. **Privasi audio.** Audio tidak disimpan oleh dashboard dan hanya diproses OpenAI (periksa kebijakan retensi mereka); transkrip teks disimpan seperti chat. Setuju? Perlu pemberitahuan persetujuan (sekali per user / setiap sesi)?  
**Saran: transkrip disimpan, audio tidak; banner persetujuan sekali per user + ikon mikrofon permanen. Jawab: Setuju**
8. **Perilaku di `/wall` (TV).** Opsi: suara mati / hanya tekan-untuk-bicara dengan mikrofon khusus / terus-mendengar. TV punya speaker jauh → gema berat; mikrofon ruangan menangkap pembicaraan lain.
**Saran: MVP tanpa suara di** `/wall`**; S3 dengan mikrofon speakerphone/headset khusus + tekan-untuk-bicara.  Jawab: Maksud anda? Artinya perlu perangkat lain di luar device yang menampilkan tampilan wall ini ? Di bayangan saya tombol nya tetap tersedia**
9. **Perangkat.** Dipakai di laptop/desktop Chrome atau Edge dengan headset atau speaker? Boleh mewajibkan Chrome/Edge desktop? Jaringan NOC mengizinkan WebRTC (UDP) keluar?  
**Saran: wajib Chrome/Edge desktop; uji jaringan lebih dulu. Jawab: Setuju**
10. **Pointer di suara.** Pointer bergerak saat user minta "tunjukkan…" saja (konsisten #30), atau AI boleh menunjuk spontan saat menjelaskan angka?  **Saran: hanya bila diminta (sama dengan chat).  Jawab: Setuju**
11. **Transkrip &amp; riwayat.** Transkrip suara masuk riwayat percakapan yang sama dengan chat teks (diberi tanda 🎙)? Atau dipisah?  **Saran: satu riwayat, ditandai modalitas suara. Jawab: Setuju**
12. **Pembatalan sesi.** Setuju batas keras durasi per sesi (mis. 10 menit) dan jeda sebelum memulai ulang, demi biaya?  **Saran: ya, 10 menit/sesi, bisa diperpanjang manual. Jawab: Setuju**
13. **Waktu.** Fitur 3 dikerjakan setelah Fitur 2 selesai atau paralel (suara + transkrip dulu, pointer menyusul)?  **Saran: paralel S1 tanpa pointer, pointer menyusul begitu Fitur 2 merge. Jawab: Setuju**
14. **Dasar key.** Key OpenAI diisi admin lewat halaman admin slot Suara (bukan env, bukan dibagikan lewat obrolan/dokumen). Setuju?  **Saran: ya (sesuai #9). Jawab: Setuju** 

---

## 8. Sumber (diambil 2026-10-01/02; nama model, event, dan harga di docs berubah cepat — verifikasi sebelum implementasi)

- OpenAI — Realtime API overview: [https://platform.openai.com/docs/guides/realtime](https://platform.openai.com/docs/guides/realtime)
- OpenAI — Realtime dengan WebRTC (SDP, data channel, ephemeral): [https://platform.openai.com/docs/guides/voice-webrtc.md](https://platform.openai.com/docs/guides/voice-webrtc.md)
- OpenAI — Realtime dengan WebSocket (server-side, header `OpenAI-Safety-Identifier`): [https://platform.openai.com/docs/guides/voice-websockets.md](https://platform.openai.com/docs/guides/voice-websockets.md)
- OpenAI — Kontrol sisi server (sideband WebSocket, tool di backend): [https://platform.openai.com/docs/guides/voice-server-controls](https://platform.openai.com/docs/guides/voice-server-controls)
- Google — Gemini Live API (alternatif, barge-in, transkripsi, ephemeral token): [https://ai.google.dev/gemini-api/docs/live](https://ai.google.dev/gemini-api/docs/live), [https://ai.google.dev/gemini-api/docs/live-guide](https://ai.google.dev/gemini-api/docs/live-guide), [https://ai.google.dev/gemini-api/docs/ephemeral-tokens](https://ai.google.dev/gemini-api/docs/ephemeral-tokens)

Catatan keterbatasan: tidak ada panggilan API yang diuji; angka harga/latensi di atas bersifat perkiraan dan harus dikonfirmasi sebelum keputusan biaya.