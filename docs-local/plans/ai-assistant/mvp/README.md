# MVP Jenna — status & daftar lanjutan setelah deploy

> Ditetapkan user 2026-10-03: **S1 suara = MVP (beta)**. Dicatat sesi induk agar setelah versi ini di-deploy kita bisa
> lanjut membahasnya. Urutan di bawah = saran prioritas, bukan keputusan.

## 1. Isi versi MVP (semua di `join`)

| Bagian | Isi | Rujukan |
|---|---|---|
| Pondasi | P-1 verifikasi API, data/izin/enkripsi kredensial, otak AI, endpoint admin & status, UI `/admin/ai-assistant` | `03-pondasi.md` |
| Fitur 1 — chat | Panel Jenna, jawaban mengalir (SSE), riwayat di DB, Markdown, panel tidak menutupi halaman | `04-fitur-1-chat-panel.md` |
| Fitur 2 — penunjuk | 9 menu + `/wall`, panduan bertahap, pembatalan penunjuk, sidebar rel ikon | `05-fitur-2-pointer.md`, `discus/fitur-2-panduan-bertahap.md` |
| Fitur 3 — suara S0 | Halaman uji `/admin/ai-assistant/voice-lab` (alat diagnosa admin) | `06-fitur-3-suara.md` v3 |
| Fitur 3 — suara S1 (MVP) | Suara di panel Jenna (V1-B: GPT-Live telinga+mulut, Claude otak), persetujuan, izin `use-ai-voice`, kuota menit, 1 sesi/user, identitas Jenna | `06-fitur-3-suara.md` v3, #53–#55 |
| Perbaikan & keamanan | Bug uji 2.1/4.1, role dari DB (temuan 8), status slot Suara, upgrade better-auth 1.7.7 (celah OAuth tertutup), TanStack Router, Elysia/Vite, refactor file besar | `checklist-progress.md` |

## 2. Lanjutan yang sudah dicatat (dibahas setelah deploy)

### A. Suara
1. **Latensi suara S1** — user: "berhasil tapi terkesan lambat". Belum diketahui bagian mana (menghubungkan / jeda sampai Jenna mulai / jeda antar kalimat). Usul: ukur per tahap (delegasi → tool data selesai → token pertama Claude → kalimat pertama), kalimat pengisi "Sebentar, saya cek datanya…", prompt mode suara lebih ringkas, cache data tool singkat, opsi model Claude lebih cepat khusus suara.
2. **Dua `console.warn` di klien suara** (audio diblokir browser, penutupan sesi gagal) → ganti status error di UI.
3. **Setelan admin "bacakan persis" kini hanya 35 karakter** (sisa ruang instruksi GPT-Live ≤500 setelah persona; nama asisten di instruksi suara dipotong 30 karakter). Tinjau apakah perlu instruksi tambahan lewat `session.instructions.append` (opsi B).
4. **S2** — `06b-fitur-3-s2.md` (disetujui #57): batas total 3 sesi, state machine + sweeper, perpanjangan, diagnostik admin, metrik kepatuhan M1–M4 (#56). Pecah `conversation.repo.ts` (253 baris > 250).
5. **S3** — suara di `/wall` + uji jaringan/perangkat NOC; menunggu **no. 5** (W1/W2/W3) dan info perangkat NOC.
6. **Biaya**: `gpt-live-1` $0,05/menit, diam & mute tetap ditagih; kuota kiosk tetap 60 menit (#57). Konfirmasi: tagihan 15 dtk saat start gagal, harga TTS per menit, batas durasi sesi saat create, kurs untuk anggaran.

### B. Keamanan & dependency
7. **Temuan 4 — izin `view-*` di API** belum ditegakkan (route data hanya butuh login). Analisa & usulan guard bersama: `discus/analisa-izin-api-dan-dependency.md` — menunggu jawaban (Q1–Q2) + lokasi.
8. **Sisa upgrade**: `overrides` rollup/esbuild (dev-only), hapus `@tanstack/router-cli` (tidak dipakai), sisa critical `vitest`/`drizzle-orm` (peer opsional basi di lock) & `shell-quote` (dev). Audit sekarang 102 (2 critical/57 high).
9. **Temuan lama `src/utils/auth.ts`**: catch kosong di `session.create.after`, opsi `advanced.trustProxy` tidak dikenal (yang valid `trustedProxyHeaders`), fallback hardcode `"CLIENT_ID_MISSING"`.

### C. Kualitas kode & proses
10. **FAQ halaman Bantuan** gagal dimuat → tampil kosong tanpa pesan (perilaku lama; `src/components/help/use-faq-items.ts`). Usul: pesan error + coba lagi.
11. File masih besar: `src/locales/id.ts` (±926 baris, dipecah per domain), `src/locales/voice-lab.ts` (±365).
12. ±70 error `tsc` lama (mis. `src/routes/users/index.tsx`).
13. **DB test bersama** (`dashboard_noc_test`) membuat `test:db` flaky saat beberapa sesi jalan bersamaan; pernah terhapus karena dipakai sebagai shadow DB `prisma migrate dev`. Usul: DB test per worktree / shadow DB terpisah; jangan pakai DB test sebagai shadow.
14. Port HMR 24678 bentrok bila dua dev server jalan bersamaan.

### D. Uji manual yang belum diisi hasilnya (`test/`)
F2 (sebagian), F2-d, F2-e, F2-f, wall, panel+Markdown, panduan+sidebar, fix batch 1, sidebar minimize, refactor file besar, upgrade dependency, S0, S1 (lisan: "berhasil, terkesan lambat").

### E. Sebelum deploy (aturan global)
- Checklist pre-deploy (test, type check, lint, build, migrasi tanpa gap, secret leak, CHANGELOG, rollback plan).
- **CHANGELOG.md** belum memuat versi ini.
- Migrasi baru sejak deploy terakhir: `add_assistant_guide_auto_advance`, `add_assistant_voice_s1` (+ migrasi pondasi AI bila belum di staging) — semuanya idempoten.
- Slot **Suara** di staging diisi admin lewat `/admin/ai-assistant` (kunci tidak pernah lewat chat/dokumen).
