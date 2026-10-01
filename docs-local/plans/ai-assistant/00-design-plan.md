# 00 — Design Plan: AI Assistant "Jenna" (untuk dipaparkan ke tim)

> **Tujuan dokumen:** satu pintu masuk untuk menjelaskan rancangan AI Assistant Dashboard Desa Plus ke tim —
> apa yang dibangun, bagaimana kelihatannya, bagaimana cara kerjanya, urutan kerjanya, dan apa yang masih terbuka.
> Detail teknis ada di dokumen bernomor 01–07 (tautan di tiap bagian). Dokumen ini **ringkasan**, bukan pengganti.
>
> **Status (2026-10-01, diperbarui sesi induk):** pondasi **disetujui**; fitur 1 **disetujui**; fitur 2 sedang dibahas
> (pendekatan **B** sudah diputuskan); fitur 3 draf. P-1 selesai dan ada di branch `join`; P1 (pondasi data) sedang dikerjakan (lihat §9).

---

## 1. Ringkasan satu menit

Dashboard Desa Plus mendapat **asisten AI bernama "Jenna"** (nama bisa diubah admin) yang menjawab pertanyaan
tentang data desa langsung dari dalam dashboard. Dibangun bertahap dalam **tiga fitur** di atas **satu pondasi**:

| # | Fitur | Inti |
|---|---|---|
| 1 | **Tanya AI** | Tombol bulat melayang (FAB) kanan bawah → panel samping untuk bertanya soal data dashboard |
| 2 | **Penunjuk** | AI memindahkan kursor virtual & menyorot elemen di halaman ("lihat angkanya di sini") |
| 3 | **Suara** | Bertanya dengan suara, jawaban bisa dibacakan |

Tiga prinsip yang tidak ditawar:
1. **Baca-saja** — AI tidak pernah mengubah data desa.
2. **LLM memutuskan, kode menjaga** — izin, batas, dan data yang boleh dilihat ditegakkan di server, bukan oleh prompt.
3. **Satu otak** — fitur 2 dan 3 hanyalah lapisan di atas pipeline teks fitur 1, bukan sistem kedua.

---

## 2. Siapa pengguna & apa yang mereka dapat

| Pengguna | Akses |
|---|---|
| User login yang **sudah diverifikasi admin** + izin `use-ai-assistant` | Bisa bertanya; jawaban dibatasi modul yang izin `view-*`-nya mereka punya |
| User belum diverifikasi | Ditolak di server (403) — FAB tidak muncul |
| Admin | Seperti user, plus halaman pengaturan `/admin/ai-assistant` dan asisten di `/admin/help` |
| Integrasi dengan API key dashboard | **Ditolak** — hanya sesi browser (agar tidak jadi "API LLM gratis") |

Contoh nilai bagi pengguna: "Berapa persen realisasi APBDes tahun ini?", "Jenis surat apa paling banyak diajukan?",
"Banjar dengan penduduk terbanyak?" — dijawab dari angka nyata, dengan label sumber modul.

---

## 3. Rancangan antarmuka (acuan untuk desain di Penpot)

Acuan visual: Meta AI business assistant (tombol bulat kanan bawah → panel samping). Mantine `Drawer`, tema
terang/gelap mengikuti dashboard, id/en.

### 3.1 FAB + panel "Tanya AI"

```
┌─ Halaman dashboard ─────────────────────────┬───────────────────────────┐
│                                             │ [logo] Jenna  [Beta]  ☰ ⤢ ✕│
│   (konten halaman tetap terlihat)           ├───────────────────────────┤
│                                             │  Halo! Saya Jenna …       │
│                                             │  ┌ saran pertanyaan ────┐ │
│                                             │  │ Ringkas kondisi desa │ │
│                                             │  │ Ada berapa pengaduan │ │
│                                             │  └──────────────────────┘ │
│                                             │      ┌───────────────────┐│
│                                             │      │ pertanyaan user   ││
│                                             │      └───────────────────┘│
│                                             │  ┌───────────────────┐    │
│                                             │  │ jawaban asisten   │ ⧉  │
│                                             │  │ Sumber: Keuangan  │    │
│                                             │  └───────────────────┘    │
│                                    ( ✦ )    ├───────────────────────────┤
│                                  FAB kanan  │ [ Tulis pertanyaan…  ] ➤  │
│                                  bawah      │ Disclaimer 1 baris kecil  │
└─────────────────────────────────────────────┴───────────────────────────┘
```

Keadaan layar yang perlu didesain:

| Keadaan | Catatan |
|---|---|
| FAB tertutup / hover (tooltip nama asisten) | Di atas konten, di bawah modal Mantine |
| Panel kosong + saran pertanyaan | Saran berbeda per halaman, hanya modul yang diizinkan |
| Sedang menjawab | Indikator "memeriksa data keuangan…" |
| Jawaban + label "Sumber" + tombol salin | 👍👎 **ditunda** |
| Daftar percakapan (☰) | Berhalaman 20/halaman, "Percakapan baru", hapus |
| Mode perbesar & mobile | Perbesar = lebar penuh; mobile = layar penuh; `Esc` menutup, fokus kembali ke FAB |
| Error | 429 kuota/rate, 503 layanan AI mati, "tidak punya akses modul X" (bukan "sistem error") |

FAB dipasang di `MainLayout`, layout `/profile`, dan `WallPage`; **tidak** ada di `/admin/*`, `/signin`, `/signup`.
Di `/wall` (tetap publik) FAB hanya muncul bila kiosk login dengan akun khusus terverifikasi + izin; kuota akun kiosk 100 pesan/hari.
Rincian: [`04-fitur-1-chat-panel.md`](04-fitur-1-chat-panel.md).

### 3.2 Halaman admin `/admin/ai-assistant`

```
┌ Umum ───────────────────────────────────────────────────────────────┐
│ [●] Asisten aktif    Nama: [Jenna]     Catatan persona: [..........] │
├ Batas pemakaian ────────────────────────────────────────────────────┤
│ Rate/menit [6]  Pesan/hari/user [50]  Token/hari [1.000.000]         │
│ Panjang input [2000]  Riwayat ke LLM [20]  Retensi (hari) [..]       │
├ Kredensial ─────────────────────────────────────────────────────────┤
│ ┌ Chat ────────┐ ┌ Penunjuk ─────┐ ┌ Suara ───────┐                  │
│ │ Base URL     │ │ (kosong →     │ │ (kosong →    │   badge: DB /    │
│ │ API Key ***  │ │  pakai Chat)  │ │  pakai Chat) │   belum diisi /  │
│ │ Model, Temp. │ │               │ │              │   fallback Chat  │
│ │ [▷ Test][Simpan]                │ │              │                  │
│ └──────────────┘ └───────────────┘ └──────────────┘                  │
├ Ringkasan hari ini ─────────────────────────────────────────────────┤
│ Pesan · Token · User aktif · Error terakhir (tanpa isi pesan)        │
└─────────────────────────────────────────────────────────────────────┘
```

API key tidak pernah ditampilkan penuh (hanya hint `sk-c****dc07`). Rincian: [`03-pondasi.md`](03-pondasi.md) §3, §10.

### 3.3 Fitur 2 (keputusan tuntas): kursor penunjuk
Kursor virtual bergerak ke elemen bertanda `data-ai-target`, elemen disorot dengan ring, panel chat tetap
terbuka. Menghormati `prefers-reduced-motion`. Halaman percontohan usulan: Keuangan.
Semua keputusan P1–P7 tuntas: menunjuk hanya bila diminta (+ label "Sumber" bisa diklik), aksi `navigate` + `pointTo`,
percontohan Keuangan lalu Beranda, panel ditutup sementara di HP/mode perbesar, hormati reduced motion. Alasan pendekatan B untuk tim: [`discus/fitur-2-alasan-pendekatan-b.md`](discus/fitur-2-alasan-pendekatan-b.md).

### 3.4 Fitur 3 (draf): suara
Tombol mikrofon (tekan-untuk-bicara) di composer; jawaban bisa dibacakan. Tingkat 1 memakai Web Speech API
browser, fallback ke ketik bila tidak didukung.

> **Usulan langkah desain:** buat mockup layar di file Penpot "Dashboard Desa" untuk keadaan pada tabel §3.1
> dan halaman admin §3.2, lalu dipresentasikan bersama dokumen ini.

---

## 4. Cara kerja satu pertanyaan

```
Browser (FAB/panel)              Server (Elysia, satu proses Bun)
POST /api/assistant/chat ──────▶ 1. sesi login valid & emailVerified === true (bukan API key)
                                 2. izin use-ai-assistant, asisten aktif, slot chat siap
                                 3. batas: rate/menit, kuota harian, panjang input
                                 4. muat N pesan terakhir dari DB (klien tidak kirim riwayat)
                                 5. susun system prompt berlapis (nama dari config)
                                 6. registry → hanya tool yang diizinkan untuk user ini
                                 7. loop LLM ⇄ tool (maks 6 iterasi, ada timeout)
                                 8. simpan pesan + token + tool yang dipakai
◀────────────────────────────── { conversationId, reply, actions: [] }
```

`actions` kosong di fitur 1; dipakai fitur 2 untuk perintah UI ber-whitelist. Streaming SSE menyusul (F1-e).

---

## 5. Keputusan arsitektur kunci

| Topik | Keputusan |
|---|---|
| LLM | Satu klien OpenAI-compatible → Claude custom proxy (akun sama dengan desa-platform). **Tanpa dependency baru** |
| Kredensial | Per fitur (slot `chat`/`pointer`/`voice`) di DB, API key terenkripsi AES-256-GCM, kunci dari env `AI_CREDENTIALS_KEY`, **fail-closed** |
| Pengaturan | Tabel singleton di DB; **semua batas bisa diubah admin tanpa deploy**; saklar default **mati** |
| Data untuk AI | Hanya lewat tool yang membungkus builder `src/api/wall-snapshot/*` (angkanya sama persis dengan dashboard, sudah ber-cache & bebas PII) |
| Data sensitif | AI **tidak pernah** menerima nama orang, koordinat, atau teks tulisan warga — hanya agregat & status |
| Izin | `use-ai-assistant` baru + fungsi `resolveAllowedFeatures` agar fitur baru langsung muncul untuk role `user` |
| Riwayat | Disimpan di DB, hanya pemilik yang bisa membaca (id milik orang lain → 404) |
| Nama | Konfigurasi, default "Jenna"; di kode memakai istilah *assistant* |
| Fitur 2 | **Diputuskan: pendekatan B** — AI hanya menunjuk target yang terdaftar di kode, satu otak dengan chat, baca-saja. page-agent tidak dipakai sekarang: ia membaca seluruh teks layar (termasuk nama warga), menjalankan otak AI kedua di browser, dan bisa memakai hingga 40 panggilan AI per pertanyaan. Disimpan sebagai opsi bila kelak AI boleh melakukan aksi tulis. Rincian: [`discus/fitur-2-alasan-pendekatan-b.md`](discus/fitur-2-alasan-pendekatan-b.md) |
| Fitur 3 | Rekomendasi tingkat 1: Web Speech API dulu |

Rincian & alasan: [`03-pondasi.md`](03-pondasi.md), [`discus/temuan.md`](discus/temuan.md), README (28 keputusan).

---

## 6. Tool awal AI (baca-saja)

| Tool | Modul | Izin |
|---|---|---|
| `ringkasan_beranda` | KPI + beranda | `view-dashboard` |
| `ringkasan_keuangan({tahun?})` | APBDes | `view-keuangan` |
| `statistik_pengaduan` | Pengaduan & surat | `view-pengaduan` |
| `statistik_demografi` | Demografi | `view-demografi` |
| `kinerja_divisi` | Divisi | `view-kinerja-divisi` |
| `lookup_faq` | FAQ terpublikasi | `use-ai-assistant` |

Tahap 2 (setelah MVP dipakai): sosial, keamanan, BUMDes, analitik chatbot, pencarian lintas modul.

---

## 7. Keamanan & risiko

| Risiko | Mitigasi |
|---|---|
| Biaya/token tak terkendali | Batas dari DB aktif sejak P2; saklar mati default; rate, kuota harian user, token global |
| Prompt injection dari teks warga | Hasil tool = data (bukan perintah), field nama/teks warga dibuang, tidak ada aksi tulis, aksi UI ber-whitelist |
| Kunci API bocor | Hanya di server, terenkripsi, tanpa `VITE_`, tak masuk log/`ActivityLog`, fail-closed |
| Izin fitur baru tak muncul | Migrasi sisip izin + resolver default |
| Akun belum diverifikasi lolos API | P-1: `apiMiddleware` menolak `emailVerified !== true` |
| File sudah over-limit membengkak | Komponen baru di file terpisah (`help-page.tsx`, `admin/help.tsx`, `demografi-pekerjaan.tsx`, dll.) |
| Log membocorkan isi percakapan | Log hanya `userId`, `conversationId`, tool, iterasi, token, latensi |

---

## 8. Roadmap & gerbang persetujuan

Aturan: dokumen disetujui → branch `feature/ai-assistant-*` → kode + test → `bun run verify` → lapor → merge
**hanya setelah user menyetujui**. Tidak ada deploy tanpa perintah eksplisit.

| Tahap | Isi | Gerbang |
|---|---|---|
| **P-1** | API menolak user belum terverifikasi | Kode selesai; **menunggu persetujuan merge** |
| **P0** | Persetujuan pondasi | ✅ Disetujui |
| **P1** | Migrasi (4 tabel + izin), `secret-crypto`, `resolveAllowedFeatures` | Migrasi lokal & test hijau |
| **P2** | Provider + mock, registry, executor, prompt, batas pemakaian | Test hijau tanpa jaringan |
| **P3** | Endpoint admin + halaman `/admin/ai-assistant` + test koneksi proxy nyata | Slot `chat` terisi & test sukses |
| **F1-a** | Persetujuan dokumen `04` | **Menunggu user** |
| **F1-b** | Tool MVP + endpoint percakapan | Test hijau |
| **F1-c** | FAB + panel + riwayat + saran per halaman | Uji manual browser (atas permintaan) |
| **F1-d** | Halaman Bantuan memakai panel yang sama; hapus stub `/api/jenna/chat` | Test hijau |
| **F1-e** | SSE streaming + status "memeriksa data…" | — |
| **F2** | Pembahasan `05` → anchor 1 halaman + `AssistantCursor` | Sesi pembahasan |
| **F3** | Pembahasan `06` → mikrofon tingkat 1 | Sesi pembahasan |

Pekerjaan terpisah (bukan bagian AI): `fix/api-permission-guard`, koreksi `PROJECT-STRUCTURE.md`, keterangan `verify` di `CLAUDE.md`.
Detail: [`07-roadmap.md`](07-roadmap.md), [`checklist-progress.md`](checklist-progress.md).

### Usulan pembagian kerja (untuk didiskusikan tim)

| Jalur | Cakupan |
|---|---|
| Backend | P1–P3, tool & endpoint F1-b (butuh DB, enkripsi, executor) |
| Frontend | FAB, panel, halaman admin, saran per halaman (F1-c/d) — bisa mulai dari mockup Penpot |
| Desain | Mockup §3 di Penpot; kursor & sorotan fitur 2 |
| QA | Set evaluasi 10–20 pertanyaan dengan `MockProvider`; uji izin per role |

---

## 9. Status saat ini

- ✅ Keputusan pondasi, temuan 1–7, dokumen `04` (Fitur 1) disetujui — termasuk FAB di `/wall` via akun kiosk dan tool versi pertama tetap 6. README memuat 28 keputusan.
- ✅ P-1 selesai, di-merge ke branch integrasi **`join`** dan di-push ke `origin/join`. **`main` tidak pernah di-merge.** Deploy ditunda (uji lokal dulu); sebelum deploy jalankan `discus/p-1-precheck.sql`.
- 🔧 P1 (pondasi data, izin, enkripsi) sedang dikerjakan di branch `feature/ai-assistant-pondasi`.
- ✅ Fitur 2: keputusan P1–P7 tuntas (menunggu persetujuan akhir `05`). Fitur 3 belum dibahas.

## 10. Yang dibutuhkan dari tim / pemilik

| Kebutuhan | Kapan |
|---|---|
| Membuat `AI_CREDENTIALS_KEY` (64 hex) dan memasangnya di env Portainer staging & produksi (nilai harus tetap) | Sebelum deploy |
| Base URL + API key + nama model Claude proxy | P3 (uji koneksi) |
| Akun kiosk khusus untuk `/wall` (diverifikasi admin, izin `use-ai-assistant`) | Sebelum uji FAB di wall |
| Jawaban pertanyaan fitur 2 (arti slot `pointer`, kapan menunjuk, halaman percontohan, HP) | Sesi fitur 2 |
| Jawaban pertanyaan fitur 3 (browser target, bacakan otomatis, gabungan 1+2+3, privasi audio) | Sesi fitur 3 |

---

## Peta dokumen

| Butuh apa | Buka |
|---|---|
| Aset yang bisa dipakai ulang & gap | [`01-kondisi-project.md`](01-kondisi-project.md) |
| Apa yang diadopsi dari blueprint desa-platform | [`02-analisa-blueprint.md`](02-analisa-blueprint.md) |
| Model data, kredensial, izin, provider, tool, prompt, batas, endpoint, test | [`03-pondasi.md`](03-pondasi.md) |
| Fitur 1 / 2 / 3 | [`04`](04-fitur-1-chat-panel.md) · [`05`](05-fitur-2-pointer.md) · [`06`](06-fitur-3-suara.md) |
| Urutan kerja & risiko | [`07-roadmap.md`](07-roadmap.md) |
| Riwayat keputusan | [`discus/`](discus/) |
| Alasan Fitur 2 memakai pendekatan B (untuk tim) | [`discus/fitur-2-alasan-pendekatan-b.md`](discus/fitur-2-alasan-pendekatan-b.md) |
| Progres | [`checklist-progress.md`](checklist-progress.md) |
