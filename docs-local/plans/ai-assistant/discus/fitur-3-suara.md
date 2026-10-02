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

---

## 9. Analisa jawaban user & usulan lanjutan

> Ditulis sesi `ai_suara` (worktree baru dari `join`), 2026-10-02. **Diskusi saja, tanpa kode.** §7 (jawaban user) tidak diubah.
> Jawaban/keputusan baru user dicatat di §9.7 (log keputusan), bukan menimpa bagian di atas.

### 9.1 Yang sudah final (dari jawaban §7)

| # | Topik | Keputusan user |
|---|---|---|
| 1 | Provider suara | **OpenAI Realtime** (key lewat `/admin/ai-assistant` slot Suara, bukan chat/env) |
| 2+3 | Peran OpenAI vs Claude | **Claude tetap otak** (menjawab, memakai tool, menggerakkan penunjuk); OpenAI sebagai penerima suara; data tersaring boleh ke OpenAI; teks ucapan harus masuk ke Claude → **menggeser rekomendasi lama O1**, lihat §9.3 |
| 4 | Bahasa | id-ID formal-ramah; nama suara dipilih admin; Inggris bila user memulai |
| 5 | Mikrofon | Tombol **On/Off** (terus mendengar saat On); auto-off setelah 2 menit diam |
| 6 | Kuota | **60 menit/hari user** (naik dari 30), kiosk 60, diatur admin, tidak mengurangi kuota teks. *Belum jelas:* apakah pertanyaan suara juga dihitung pesan chat → Q3 |
| 7 | Privasi | Audio tidak disimpan, transkrip disimpan; banner persetujuan sekali per user + ikon mikrofon permanen |
| 8 | `/wall` | **Belum final** — user bingung dengan saran lama; tombol suara ingin tetap ada → §9.5 |
| 9 | Perangkat | Wajib Chrome/Edge desktop; uji jaringan WebRTC/UDP dulu |
| 10 | Penunjuk | Hanya bila diminta |
| 11 | Riwayat | Satu riwayat dengan chat, ditandai modalitas suara |
| 12 | Batas sesi | 10 menit/sesi, bisa diperpanjang manual |
| 13 | Waktu | Dulu "paralel tanpa pointer"; **sekarang Fitur 2 sudah di `join`** → konfirmasi Q4 |
| 14 | Key | Diisi admin lewat slot Suara |

### 9.2 Koreksi atas analisa awal (kode `join`, commit `2bd0f7a`, dicek 2026-10-02)

- §3 / §2.2 menulis "`chatStream` belum ada". **Sudah ada**: `POST /api/assistant/chat/stream` (SSE: `status`, `delta`, `done`/`error`) memakai `runChatTurn` yang sama dengan `/chat` — guard, izin, batas, kuota, penyimpanan. Latensi pipeline V2 (§9.3) jadi **tidak seburuk** yang saya tulis di §2.2.
- `actions` sudah bukan `never` lagi (`AssistantUiAction = UiAction`) — penunjuk Fitur 2 nyata.
- Bug status `slots.voice` (`status.service.ts:28`, ikut `slots.chat`) **masih ada** — tetap harus diperbaiki saat implementasi.
- `runTool` di `executor.ts` masih private; di desain V1/V2 di bawah **tidak perlu diekspor**, karena suara memanggil `runChatTurn`, bukan tool satu per satu.

### 9.3 Inti permintaan: Claude sebagai otak, OpenAI sebagai "telinga" (dan mungkin "mulut")

**Cek docs OpenAI (diambil 2026-10-02) — apakah V1 dan V2 mungkin?**

| Hal | Temuan di docs | Kesimpulan |
|---|---|---|
| Sesi suara realtime di browser | WebRTC dengan token sementara dari server (`POST /v1/realtime/client_secrets`, SDP ke `/v1/realtime/calls`); model contoh `gpt-live-1` / `gpt-realtime-2.1` | Mungkin |
| V1: otak sendiri | Guide "Delegation and tools in GPT-Live": ada **Responses delegation** (OpenAI memanggil model OpenAI) dan **client delegation** ("aplikasi Anda menyiapkan konteks, menjalankan agent/workflow, lalu mengirim hasilnya balik ke GPT-Live"; cocok bila hasil perlu divalidasi/disensor sebelum sampai ke GPT-Live). Browser boleh meneruskan event pemanggilan fungsi dari data channel ke backend terautentikasi untuk dieksekusi | **Mungkin** lewat *client delegation* ke Claude. Responses delegation **tidak dipakai** (itu model OpenAI, bukan Claude) |
| V1: dibacakan apa adanya | Docs tidak menjamin model membacakan hasil persis tanpa parafrase; hanya bisa diarahkan lewat instruksi sesi | **Perlu dikonfirmasi lewat uji nyata** |
| V2: telinga saja | Sesi `type: "transcription"` tersedia (WebRTC untuk browser, WebSocket untuk server); model `gpt-live-transcribe` memberi transkrip bertahap + final; mendukung `languages`, `keywords`, `prompt` (bisa memberi istilah "APBDes", "Darmasaba", dll.) | Mungkin |
| V2: akhir ucapan (VAD) | Di `gpt-live-transcribe`, **`server_vad`/`semantic_vad` tidak didukung** (`turn_detection` harus kosong); docs menyebut VAD hanya "pada model yang mendukung". Model `gpt-transcribe` justru butuh WebSocket + `input_audio_buffer.commit` | **Celah**: penentu "user sudah selesai bicara" harus dibuat sendiri di browser, atau memakai model transkripsi lain yang mendukung VAD (**perlu dikonfirmasi** model mana & apakah lewat WebRTC) |
| V2: mulut | Endpoint TTS `audio/speech` (`gpt-4o-mini-tts`, 11 suara bawaan, instruksi gaya bicara, **streaming audio**); bahasa Indonesia termasuk yang didukung (suara dioptimalkan untuk Inggris → **uji kualitas id**). Docs tidak menyebut token sementara untuk TTS → panggilan lewat **server** (stream HTTP biasa, bukan WebSocket) | Mungkin |
| Aturan wajib | Usage policy OpenAI: user harus diberi tahu jelas bahwa **suara adalah buatan AI** (berlaku bila ada TTS/suara AI) | Masuk banner persetujuan |
| Nama model & harga | Berubah cepat; halaman harga tidak dibaca rinci | **Jangan hard-code; nama model = setelan admin; biaya perlu dikonfirmasi** |

Sumber (dibaca 2026-10-02): `platform.openai.com/docs/guides/` → `realtime`, `voice-webrtc`, `voice-server-controls`, `realtime-transcription`, `realtime-vad`, `text-to-speech`; `developers.openai.com/api/docs/guides/live-delegation`.

**Penjelasan awam.** Bayangkan Jenna punya dua orang di kantor: **Claude = pakar yang paham data & izin**, **OpenAI = resepsionis yang bisa mendengar dan berbicara**. Pertanyaannya: siapa yang memegang percakapan?

- **V1 "kulit suara"**: resepsionis (OpenAI) mendengar, lalu *setiap pertanyaan berisi ia teruskan ke pakar (Claude)*, menerima jawaban, dan membacakannya. Percakapan tetap natural (bisa dipotong, jeda manusiawi). Risikonya: resepsionis *masih punya otak sendiri* — bisa menjawab sendiri, mengubah kata-kata pakar, atau lupa meneruskan. Kita hanya bisa mengarahkan lewat instruksi, bukan memaksa.
- **V2 "telinga & mulut"**: resepsionis hanya **menulis apa yang didengar** (STT), lalu dialihkan sepenuhnya ke Claude; jawaban Claude diserahkan ke "pembaca" (TTS) untuk dibacakan. OpenAI **tidak pernah memutuskan apa pun**. Ini paling sesuai kalimat user ("OpenAI sebagai penerima input suara, Claude yang menjawab & menunjuk"). Harga yang dibayar: kita yang mengatur kapan user selesai bicara dan kapan memotong jawaban (kode lebih banyak).

```
V1 (kulit suara)
 Mikrofon ─► [OpenAI Realtime: dengar + giliran bicara]
                │ pertanyaan berisi → panggil tool "tanya_jenna"
                ▼
        [Server: izin + kuota → Claude + tool + penunjuk]
                │ teks jawaban + actions
                ▼
 Speaker ◄─ [OpenAI membacakan jawaban]        actions ─► browser gerakkan penunjuk

V2 (telinga & mulut)
 Mikrofon ─► [OpenAI: suara→teks saja] ─► teks final ─► browser
 browser ─► POST /api/assistant/chat/stream (Claude, jalur chat yang sama)
 Claude delta teks ─► tampil di layar  +  dipotong per kalimat ─► [server → OpenAI TTS] ─► Speaker
 actions (penunjuk) ikut keluar dari stream yang sama
 Memotong (barge-in): browser mendeteksi user bicara → hentikan pemutaran + batalkan permintaan Claude
```

| Aspek | V1 kulit suara | V2 telinga & mulut |
|---|---|---|
| Siapa otak | Claude untuk isi; OpenAI ikut mengatur alur bicara | **100% Claude** |
| Kesesuaian dengan kalimat user | Sebagian | **Penuh** |
| Teks ucapan masuk ke Claude | Ya, lewat parameter tool (parafrase mungkin) | Ya, **persis transkrip** |
| Risiko jawaban "diubah/dikarang" oleh OpenAI | Ada (hanya bisa diredam instruksi) | **Tidak ada** |
| Rasa natural & barge-in | Terbaik (dikelola OpenAI) | Cukup; dibuat sendiri, perlu disetel |
| Latensi | Claude selesai dulu → baru dibacakan; ada dua model | Claude streaming per kalimat → TTS; kira-kira sebanding atau lebih baik, **perlu diukur** |
| Gema (AEC) | Audio lewat WebRTC → peredam gema browser bekerja baik | Audio TTS diputar biasa → peredam kurang pasti, **perlu diuji** |
| Mulut bisa dimatikan (mis. di `/wall`) | Sulit | **Mudah** (jawaban hanya teks) |
| Izin/kuota/riwayat | Lewat `runChatTurn` (tool `tanya_jenna`) | Lewat `/chat/stream` apa adanya |
| Kode baru | Sesi Realtime + tool + prompt kulit | Sesi transkripsi + penentu akhir ucapan + TTS server + pemotong |
| Biaya (perkiraan, belum dihitung) | Audio realtime + Claude | STT + TTS + Claude; suara cenderung lebih murah — **perlu konfirmasi harga** |
| Server Bun | Endpoint HTTP biasa (token + callback) | Endpoint HTTP + stream audio TTS (tanpa WebSocket) |

**Rekomendasi: V2, bertahap**, karena paling jujur dengan keinginan user dan paling aman (otak tunggal Claude, tidak ada jalur lain yang melewati izin/kuota):

1. **S1a — telinga saja**: user bicara → transkrip tampil langsung → masuk chat Claude yang ada → jawaban tampil sebagai teks + penunjuk bergerak. Sudah menjawab hampir semua kebutuhan dan murah.
2. **S1b — tambah mulut (TTS)** + memotong jawaban (barge-in).
3. V1 disimpan sebagai **rencana cadangan** bila setelah diuji suara V2 terasa terlalu kaku/lambat.

Peringatan jujur: V2 **belum seluwes ChatGPT Voice** (itu ciri V1/speech-to-speech murni). Bila rasa natural lebih penting daripada "Claude 100%", V1 lebih tepat — itu pilihan user (Q1).

### 9.4 Dampak ke bagian lain

- **Kuota.** Menit suara (60/hari user & kiosk, K1) melindungi biaya **OpenAI**. Tetapi di V1/V2 tiap pertanyaan memanggil **Claude**; bila tidak dihitung sebagai pesan chat, 60 menit suara bisa memicu ratusan panggilan Claude melewati batas 50/100 → usulan: **dihitung dua-duanya** (Q3). Aturan #35 (gagal karena provider tidak dihitung) tetap berlaku. Menit diukur server dari penerbitan sesi + heartbeat/penutupan (browser bicara langsung ke OpenAI, jadi server tidak melihat audio).
- **Izin.** Pintu masuk tetap `authorizeAssistantUser` + izin `use-ai-assistant`; tool/izin/penyaringan data tetap satu jalur (`runChatTurn`). Opsi izin baru `use-ai-voice` (Q7).
- **Riwayat.** `AssistantMessage` perlu kolom modalitas (`text`/`voice`) lewat migrasi idempoten; pesan user = transkrip akhir, pesan Jenna = **teks dari Claude** (bukan transkrip ucapan model suara). Audio tidak disimpan. Perlu tabel/kolom penghitung menit per hari (WITA).
- **Penunjuk.** V2: `actions` ikut keluar dari stream chat, dijalankan executor Fitur 2 yang sama; "hanya bila diminta" (#10) cukup dijaga oleh prompt chat. Prompt varian suara: jawaban pendek, tanpa markdown/tabel, detail panjang tetap di layar.
- **Slot admin "Suara".** Tipe provider baru (usulan `openai-voice`); isian: nama model transkripsi, model TTS, nama suara, bahasa; V1 menambah model realtime. **Tanpa fallback ke slot chat untuk audio.** Otak tetap memakai slot Chat (Claude), bukan slot Suara. Slot Penunjuk tetap "belum dipakai". Status `slots.voice` harus berarti "slot suara terisi", bukan "chat siap". Tes koneksi admin khusus suara (dirancang saat implementasi; tidak dijalankan sekarang).
- **Istilah sulit.** Dengan `keywords`/`prompt` transkripsi, istilah desa ("APBDes", "BUMDes", "Darmasaba", "banjar", "posyandu") bisa diberi petunjuk supaya tidak salah dengar — daftar bisa jadi setelan admin.
- **Privasi.** Banner persetujuan menyebut: suara dikirim ke OpenAI, tidak disimpan dashboard, **dan suara jawaban dibuat AI** (kewajiban usage policy OpenAI untuk TTS).
- **Keputusan lama yang tergeser.** #38 ("provider suara OpenAI, bukan Claude") tetap benar untuk *telinga/mulut*, tetapi *otak* tetap Claude — keputusan #38 perlu diralat setelah user memilih (§9.7). Saran lama O1 (§5) dan MVP "tekan-untuk-bicara" (§6) **tidak berlaku lagi**.

### 9.5 `/wall` (TV) — penjelasan ulang dan opsi

Saran lama saya ("MVP tanpa suara di `/wall`") memang membingungkan. Maksud sebenarnya: **bukan** wajib beli perangkat lain, melainkan peringatan bahwa suara di TV punya dua masalah:

1. **Mikrofon.** Fitur suara butuh mikrofon di **perangkat yang menjalankan browser `/wall`** (PC/mini-PC/laptop yang tersambung ke TV, atau TV-box). TV biasanya tidak punya mikrofon yang bisa dipakai browser; webcam/mic USB/headset bisa. Tanpa mikrofon, tombol suara tidak berguna.
2. **Gema & obrolan ruangan.** Speaker TV berjarak jauh dan keras → suara Jenna masuk lagi ke mikrofon (gema); mikrofon juga menangkap obrolan orang lain di ruang NOC, lalu menganggapnya pertanyaan.

Mitigasi **tanpa perangkat tambahan**:

| Mitigasi | Efek |
|---|---|
| Peredam gema/derau bawaan browser (`echoCancellation`, `noiseSuppression`) | Mengurangi, tidak menghilangkan, terutama untuk speaker jauh |
| Tombol On/Off (bukan terus aktif) + auto-off 2 menit diam | Mikrofon tidak "mendengar" ruangan sepanjang hari |
| Batas sesi 10 menit | Membatasi biaya & salah dengar |
| Ambang deteksi suara (VAD) lebih ketat | Obrolan kecil jauh tidak dianggap pertanyaan |
| **V2: jawaban hanya teks + penunjuk di `/wall` (mulut dimatikan)** | **Gema hilang total** — hanya "telinga" yang aktif; pilihan ini hanya mudah di V2 |
| Tombol disembunyikan/nonaktif otomatis bila browser tak menemukan mikrofon | Tidak ada tombol yang tampak rusak |

Opsi yang menghormati keinginan user (**tombol tetap ada di `/wall`**):

- **W1** — tombol ada, suara dua arah penuh (dibacakan). Risiko gema paling besar; bagus bila ada speakerphone/headset.
- **W2** — tombol ada, **telinga saja**: user bicara → teks muncul → Jenna menjawab sebagai teks + penunjuk bergerak di TV. Tanpa gema. *Saran.*
- **W3** — W2 sebagai default, dengan setelan admin "bacakan jawaban di wall" yang diaktifkan **setelah** uji gema di TV sungguhan.

Info perangkat NOC yang dibutuhkan (Q5): perangkat apa yang menjalankan `/wall` (PC/mini-PC/TV-box?), apakah punya mikrofon/webcam, browser & sistemnya, speaker dari TV (HDMI) atau terpisah, apakah ruangan ramai.

### 9.6 Pertanyaan baru (tersisa)

Format: pertanyaan → opsi → **saran**.

1. **V1 atau V2?** (§9.3) Siapa yang memegang percakapan. Opsi: V1 kulit suara / V2 telinga & mulut / V2 bertahap (telinga dulu, mulut menyusul). **Saran: V2 bertahap**; V1 cadangan.
2. **Jawaban dibacakan atau hanya teks?** Opsi: selalu dibacakan + teks / hanya teks / dibacakan tapi ada tombol "bisukan jawaban". **Saran: dibacakan + teks + tombol bisukan** di panel; di `/wall` ikut W2/W3 (Q5). Jawaban panjang: dibacakan ringkas, detail di layar.
3. **Kuota pesan chat.** Pertanyaan suara dihitung juga sebagai pesan chat (50/100)? Opsi: dihitung dua-duanya / hanya menit suara / pesan suara punya batas sendiri (mis. 100/hari). **Saran: dihitung dua-duanya** (menjaga biaya Claude); batas bisa dinaikkan admin.
4. **Penunjuk sejak awal?** Fitur 2 sudah di `join`. Opsi: ikut di S1 / menyusul. **Saran: ikut sejak S1** (gratis dalam desain V2).
5. **`/wall`.** Opsi: W1 / W2 / W3 (§9.5). **Saran: W3.** Mohon info perangkat NOC (§9.5): jenis perangkat, mikrofon, browser, jalur speaker, keramaian ruangan.
6. **Jaringan & perangkat.** Siapa yang menguji WebRTC/UDP & mikrofon dari jaringan NOC, dan mau dibuat dulu halaman uji kecil (S0) sebelum S1? Opsi: S0 dulu / langsung S1. **Saran: S0 dulu** (tanpa key di chat; key diisi admin) — termasuk uji kualitas id-ID & gema. (S0 adalah pekerjaan kode → butuh perintah eksplisit.)
7. **Izin suara terpisah?** Opsi: tidak (ikut `use-ai-assistant`; admin atur kuota menit) / izin baru `use-ai-voice` (default admin & user, bisa dimatikan per role). **Saran: izin baru** — suara berbiaya OpenAI dan sebaiknya bisa dimatikan per role.
8. **Penentu akhir ucapan (khusus V2).** Model transkripsi `gpt-live-transcribe` tidak punya VAD server. Opsi: (a) VAD buatan sendiri di browser (mungkin butuh satu pustaka kecil → perlu izin sesuai aturan dependency) / (b) pakai model transkripsi lain yang punya VAD (perlu dikonfirmasi) / (c) uji dua-duanya di S0 lalu pilih. **Saran: (c)**; nama pustaka + lisensi dilaporkan dulu sebelum ditambah.

### 9.7 Log keputusan user (diisi saat diskusi berlanjut)

| Tanggal | Pertanyaan | Jawaban user |
|---|---|---|
| 2026-10-02 | Catatan awal di `jawab-fitur3.md` | Bertanya "Apa itu S0?" (dijawab di compare §0). Belum ada keputusan |
| 2026-10-02 | No. 1 otak suara | Bertanya apakah suara OpenAI + otak Claude mungkin (compare §7.1) lalu apakah V1-A dua otak bisa menjawab sama (compare §8). **Jawaban: V2 dulu** (Claude satu-satunya otak, OpenAI telinga + mulut). V1-A dan V1-B jadi cadangan; ambang jeda dan ukuran "cukup sama" ditetapkan setelah hasil S0. **FINAL**. Keputusan #38 diralat: OpenAI = telinga/mulut, Claude = otak (README #46) |
| 2026-10-02 | No. 3 menit suara | FOREVIA ternyata tidak mengukur menit nyata (reservasi 600 dtk/percobaan, tidak dikembalikan; handoff §17). User memilih **(a)**: ukur menit nyata dari server; gagal start tidak memotong kuota. **FINAL** (README #47) |
| 2026-10-02 | No. 9 batas sesi bersamaan | User memilih **A**: 1 sesi per orang + total 3, admin bisa ubah. Tab kedua **ditolak dengan pesan**; sesi lama tidak diputus. **FINAL** (README #47) |
| 2026-10-02 | No. 10 diagnostik admin | User memilih **B**: log tahapan tanpa data pribadi + daftar sesi di `/admin/ai-assistant`, hanya baca (tanpa tombol tutup paksa). **FINAL** (README #47) |
| — | No. 2, 4, 5 (+ info perangkat NOC), 6, 7, 8, ambang cadangan | Belum dijawab / ditetapkan setelah hasil S0 |

**Catatan analisa 2026-10-02 (bukan jawaban user): perbandingan dengan FOREVIA.** Detail di [`../idea/compare-forevia-vs-dashboard-desa.md`](../idea/compare-forevia-vs-dashboard-desa.md).

- FOREVIA = V1 dengan **otak OpenAI** (GPT-Live + *Responses delegation*). Bukan Claude, bukan V2. Client delegation (yang dibutuhkan "Claude tetap otak" lewat V1) **tidak dibangun** di sana dan disebut desain baru yang perlu uji.
- Yang terbukti di sana: WebRTC + data channel, tool runner di browser, kursor/sorotan dari registry target, lifecycle sesi di DB + penyapu. Yang **belum** terbukti: Safari nyata, percakapan manusia, sesi 10 menit nyata, rekonsiliasi pemakaian final.
- Saran §9 **arah tetap** (V2 bertahap, Claude otak), dengan dua revisi: ada opsi ketiga V1-A (ikut FOREVIA, otak OpenAI, dua otak) dan S0 menguji V2 melawan V1-B (client delegation) di perangkat nyata.
- Diadopsi dari FOREVIA: state machine sesi + reservasi atomik, generation guard, error pulih vs fatal, tanpa ulang `create` otomatis, konteks halaman segar setelah navigasi, ledger pemakaian server, urutan penutupan, copy status Indonesia.
- Pertanyaan §9.6 direvisi menjadi 10 (3 baru: cara hitung menit, batas sesi bersamaan, diagnostik admin; no. 1 direvisi). Fakta tak terverifikasi ditandai "perlu dikonfirmasi" di compare §6.
