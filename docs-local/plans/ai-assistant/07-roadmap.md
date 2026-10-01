# 07 — Roadmap

Urutan kerja mengikuti keinginan user: **pondasi dulu**, lalu fitur **satu per satu**.
Setiap tahap: dokumen disetujui → branch `feature/ai-assistant-*` → kode + test → `bun run verify`
→ lapor → user menyetujui merge **ke branch `join`** (tidak pernah ke `main`). Tidak ada deploy tanpa perintah eksplisit.

## Keputusan arsitektur yang sudah tetap
- Otak AI dibangun **di dashboard sendiri** (versi ringan pola blueprint desa-platform).
  Alternatif "dashboard hanya channel yang memanggil AI desa-platform" tidak dipakai: dashboard
  punya data & izin sendiri, dan desa-platform hanya referensi.
- Satu pipeline teks untuk ketiga fitur; fitur 2 & 3 adalah lapisan di atasnya.

## Tahapan

| Tahap | Isi | Dokumen | Gerbang |
|---|---|---|---|
| **P-1** | `fix/api-require-verified-user`: `apiMiddleware` menolak user belum terverifikasi (+ pengecualian `/api/session`, `/api/auth/*`, profil) dengan test | discus/temuan.md #7 | Dikerjakan **sebelum** pondasi (keputusan user) |
| **P0** | Persetujuan `03-pondasi.md` + jawaban pertanyaan terbukanya | 03 | User setuju |
| **P1** | Migrasi `add_ai_assistant` (4 tabel + izin), `secret-crypto`, `resolveAllowedFeatures` + perbaikan `my-permissions` | 03 §2–4 | Migrasi lokal sukses, test hijau |
| **P2** | Provider OpenAI-compatible + mock, registry, executor, prompt berlapis, batas pemakaian | 03 §5–8 | Test hijau (tanpa jaringan) |
| **P3** | Endpoint admin + status, halaman `/admin/ai-assistant`, test koneksi ke proxy nyata | 03 §9–10 | Admin bisa mengisi slot `chat` & test sukses |
| **F1-a** | Pembahasan & persetujuan `04` | 04 | User setuju |
| **F1-b** | Tool MVP + `POST /api/assistant/chat` + endpoint percakapan | 04 §3–4 | Test hijau |
| **F1-c** | FAB + panel + riwayat + saran per halaman | 04 §1–2, 5 | Uji manual di browser (atas permintaan user) |
| **F1-d** | Migrasi halaman Bantuan (user & admin) ke komponen yang sama; hapus stub `/api/jenna/chat` | 04 §7 | Test hijau |
| **F1-e** | SSE: status "memeriksa data…" + streaming jawaban | 04 §3 | — |
| **F2** | Pembahasan `05` → anchor 1 halaman + tool `buka_halaman`/`tunjukkan_elemen` + `AssistantCursor` | 05 | Per sesi pembahasan |
| **F3** | Pembahasan `06` → tombol mikrofon tingkat 1 | 06 | Per sesi pembahasan |
| Terpisah | `fix/api-permission-guard` (temuan 4) · koreksi `PROJECT-STRUCTURE.md` (temuan 5) · keterangan `verify` di `CLAUDE.md` (temuan 6f) | discus/temuan.md | Branch & review sendiri, bukan bagian AI |
| Lanjutan | Tool tahap 2 (sosial, keamanan, BUMDes, analitik chatbot, `cari_data`), evaluasi kualitas, retensi | — | — |

## Risiko utama
- **Biaya/token tak terkendali** → batas dari DB aktif sejak P2, saklar mati default.
- **Prompt injection** dari teks warga → hasil tool = data, field nama orang dibuang, tidak ada aksi tulis.
- **Bocornya kunci API** → hanya di server, terenkripsi, tanpa `VITE_`, fail-closed tanpa `AI_CREDENTIALS_KEY`.
- **Izin fitur baru tidak muncul** untuk role `user` → migrasi sisip izin + resolver default (03 §4).
- **Menambah kode ke file yang sudah over-limit** (`help-page.tsx`, `admin/help.tsx`, `admin/settings.tsx`,
  `demografi-pekerjaan.tsx`) → komponen baru dibuat di file terpisah.
