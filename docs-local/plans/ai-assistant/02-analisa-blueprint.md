# 02 — Analisa blueprint: apa yang diterapkan di Dashboard Desa Plus

Target: AI Assistant **di dalam** Dashboard Desa Plus. Rujukan desa-platform hanya untuk dibaca
sebagai contoh pola — kode tidak di-import lintas repo.
Revisi 2: disesuaikan dengan keputusan user (`keputusan.md`); detail implementasi ada di `03-pondasi.md`.

Legenda: **Terapkan** = ambil polanya hampir apa adanya · **Adaptasi** = ambil idenya, bentuknya
disesuaikan · **Tunda** = berguna nanti · **Tidak relevan** = khas WhatsApp/warga.

## Ringkasan per fase

| Fase blueprint | Status | Bentuk di dashboard |
|---|---|---|
| 0. AI vs MCP | Terapkan (prinsipnya) | Bangun AI assistant dulu. MCP opsional, jauh belakangan |
| 1. Provider LLM | **Adaptasi** | Satu klien OpenAI-compatible (Claude custom proxy). **Config & kunci per fitur di DB, terenkripsi** |
| 2. Sistem tool | **Terapkan penuh** | `ToolDefinition` + registry; filter lewat `requiredFeature` ← `RolePermission` |
| 3. Loop agentic | **Terapkan penuh** | `executeWithTools` maks 6 iterasi, timeout per tool, sanitasi, fallback tanpa tool |
| 4. Handler & prompt | Adaptasi | 1 handler; prompt berlapis versi pendek; nama asisten dari DB |
| 5. Router intent | Tunda | Belum perlu classifier |
| 6. Session & state | **Adaptasi (diputuskan)** | Tanpa Redis → tabel Postgres `AssistantConversation` + `AssistantMessage` |
| 7. Memory & RAG | Tunda (sebagian Adaptasi) | Tool `lookup_faq` pakai full-text Postgres, bukan pgvector |
| 8. Channel/webhook | **Diganti Lampiran A** | FAB + panel, `POST /api/assistant/chat` (HTTP → SSE) |
| 9. MCP | Tunda | — |
| 10. Trace & evaluasi | Adaptasi (ringan) | Log terstruktur + statistik dari `AssistantMessage` + set evaluasi `MockProvider` |
| 11. Keamanan | **Terapkan penuh** | Otorisasi di tool, batas pemakaian dari DB, waspada injeksi data warga |

## Detail per fase

### Fase 1 — Provider
- Keputusan user: pakai akun Claude custom proxy yang sama dengan desa-platform. Proxy itu
  **OpenAI-compatible** (`{baseUrl}/chat/completions`, Bearer) — di desa-platform dilayani
  `OllamaProvider` mode `custom`.
- Kredensial **per fitur** (slot `chat`, `pointer`, `voice`) di tabel `AiProviderConfig`, API key
  terenkripsi AES-256-GCM dengan `AI_CREDENTIALS_KEY`. Slot pointer/voice disiapkan, fallback ke chat.
- Interface cukup satu method `chat(messages, { tools })`; streaming ditambah saat tahap SSE.
- Jebakan yang sudah terjadi di desa-platform: model reasoning via proxy menolak `temperature` → field
  `temperature` nullable dan **tidak dikirim** bila kosong.
- Tier micro/fast/smart ala desa-platform: tidak diambil (satu model per slot sudah cukup).

### Fase 2 — Tool (inti paling bernilai)
- `ToolContext` versi dashboard: `{ user: { id, role }, allowedFeatures, pageRoute?, now }`.
  Tidak perlu `desaId`/`phone`/`isRegistered`/`hasKtp`.
- Alih-alih fungsi `isAvailable(ctx)` bebas, tiap tool mendeklarasikan `requiredFeature`
  (`view-keuangan`, dst.) → registry memfilter; lebih mudah dites dan diaudit.
- Izin dihitung oleh satu fungsi murni `resolveAllowedFeatures()` yang juga dipakai `my-permissions`.
- Tool tipis: panggil builder `src/api/wall-snapshot/*` / fungsi pencarian yang sudah ada, bukan HTTP
  ke endpoint dashboard sendiri.
- Catatan ketersediaan tool di prompt tetap: user tanpa izin keuangan dijawab "Anda tidak memiliki
  akses modul Keuangan", bukan "sistem error".

### Fase 3 — Loop
Ambil utuh: maks iterasi, timeout per tool, format hasil `DATA`/`ERROR`, `sanitizeResponse`, dan pesan
sistem "kamu tidak punya tool" saat daftar kosong. Tambahan: tolak nama tool di luar daftar user,
potong hasil tool agar token terkendali. Response override deterministik tidak perlu (tidak ada aksi tulis).

### Fase 4 — Handler & prompt
Satu handler. Lapisan: guardrail (kode) → identitas (nama dari DB, Desa Darmasaba, peran, waktu WITA)
→ `personaNote` admin → konteks halaman → catatan ketersediaan → aturan jawaban (bahasa UI, angka `id-ID`).
Tidak diambil: memory warga, few-shot dari DB, topik terlarang per-tenant, swarm.

### Fase 5 — Router
Tidak perlu di MVP. Bila fitur 2 membutuhkan model terpisah untuk navigasi (opsi P2 di `05`), baru
dipertimbangkan router ringan.

### Fase 6 — Session
- **Diputuskan: disimpan di DB** (seperti desa-platform: `ChatHistory`, `WebChatMessage`, `JennaChatLog`).
- Server memuat `historyWindow` pesan terakhir; klien tidak mengirim riwayat.
- Retensi `retentionDays` (default 90) lewat job harian.
- Flow deterministik (registrasi, OTP, KTP, handoff) **tidak relevan**.

### Fase 7 — Memory & RAG
`lookup_faq` pakai `to_tsvector` seperti `search.ts`. pgvector & memory per-user: tunda.

### Fase 8 — Channel
Lampiran A (lihat `04`). Tanpa signature webhook, dedup, message buffer, `@lid`, jendela 24 jam.

### Fase 10 — Observability
Log terstruktur per giliran (`userId`, tool, durasi, iterasi, token) — **tanpa isi pesan/PII**.
Statistik admin dari `AssistantMessage`. Set evaluasi kecil dengan `MockProvider` di `bun test`.

### Fase 11 — Keamanan (paling kritis)
- Otorisasi di dalam registry/tool memakai `ctx.user` dari sesi — jangan percaya argumen LLM atau `pageContext`.
- Prompt injection dari data warga: hasil tool diperlakukan sebagai data; tidak ada tool tulis.
- Batas pemakaian **dari DB** (rate/menit, pesan/hari/user, token/hari global, panjang input) — satuan
  token karena proxy tidak melaporkan biaya.
- Nama model/provider tidak ditampilkan ke **user biasa**; hanya di halaman admin.

## Tidak relevan untuk dashboard
Webhook WA/Telegram, HMAC signature, dedup message id, message buffer, format `@lid`, template
berbayar & jendela 24 jam, registrasi warga, OTP, guard KTP, handoff ke petugas, multi-tenant RLS,
custom tool buatan admin tenant, micro-agent swarm.
