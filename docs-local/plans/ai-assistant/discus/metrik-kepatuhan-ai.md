# Analisa — Metrik kepatuhan AI (chat & suara)

> Disusun sesi induk 2026-10-03 atas permintaan user (keputusan #55 poin 4: "hasil diperiksa"). **Untuk didiskusikan; belum ada kode.**
> Rujukan: `06-fitur-3-suara.md` v3 §4 (batas parafrase, ambang 5% dari 50 giliran, pemantauan di S2), S0 voice-lab (pencocok angka sudah ada).

## 1. Kenapa perlu metrik

Prompt (positif + larangan) **menurunkan** risiko tetapi tidak menjamin: GPT-Live dilatih memparafrase dan kadang menjawab sendiri;
Claude pun bisa keliru. Penegakan keras sudah di kode (izin, tool allowlist, saring data, tidak ada aksi tulis). Metrik menjawab
pertanyaan berikutnya: **seberapa sering aturan dilanggar dalam pemakaian nyata**, tanpa admin harus membaca percakapan satu per satu.

## 2. Usulan metrik

| # | Metrik | Kanal | Cara deteksi | Keandalan |
|---|---|---|---|---|
| M1 | **Angka berubah** — angka/nama yang diucapkan GPT-Live ≠ teks Claude (setelah pemformat angka lisan) | suara | pencocok S0 (sudah ada, pindah ke produksi di S1/S2) | tinggi untuk digit & angka baku; salah dengar bisa terhitung |
| M2 | **Identitas** — nama vendor/model muncul di ucapan GPT-Live atau jawaban Claude | suara + chat | cocokkan daftar istilah (konfigurasi, bukan hardcode bebas) | tinggi |
| M3 | **Jawab sendiri** — GPT-Live bicara substansi tanpa delegasi ke Claude pada giliran itu | suara | giliran ada ucapan asisten > N kata tetapi tanpa `session.delegation.created` | sedang (basa-basi pendek dikecualikan dengan ambang kata) |
| M4 | **Data pribadi di jawaban** — pola NIK (16 digit), nomor HP, email | suara + chat | regex pada teks keluar | sedang; idealnya **nol** karena data sudah disaring sebelum ke AI — bila muncul berarti ada kebocoran yang harus diselidiki |
| M5 | **Janji aksi tulis** — "sudah saya simpan/hapus/setujui" | suara + chat | daftar frasa | rendah (rawan salah deteksi) — usul: tahap kedua saja |
| M6 | **Mengarang angka** — angka di jawaban yang tidak ada di hasil tool giliran itu | chat (+ suara via teks Claude) | bandingkan angka jawaban dengan angka di hasil tool | sedang; perlu toleransi format & perhitungan turunan (persen, selisih) — usul: tahap kedua |

**Saran tahap pertama:** M1, M2, M3, M4 (deteksi jelas, nilai tinggi). M5 & M6 menyusul setelah melihat data.

## 3. Di mana dihitung & apa yang disimpan

- **Sumber:** teks Claude sudah ada di server (pesan asisten). Transkrip ucapan GPT-Live hanya ada di browser (WebRTC) → klien mengirim
  **transkrip ucapan asisten per giliran** ke server bersama penutupan giliran; server menghitung metrik.
- **Disimpan (usul):** hanya **penanda & angka ringkas** per giliran, tanpa teks: `{messageId, kanal, metrik, nilai (mis. cocok 3/4), istilah yang memicu (untuk M2, hanya nama vendor), waktu}`.
  Transkrip ucapan GPT-Live **tidak disimpan** (teks Claude sudah tersimpan sebagai jawaban resmi). Untuk M4 yang disimpan hanya *jenis* pola, bukan isinya.
- **Retensi:** usul 90 hari, lalu dihapus otomatis (atau diringkas jadi angka harian).
- **Privasi:** sesuai #16/#45 — tidak ada isi percakapan atau data warga di tabel metrik; tidak ada log PII.

## 4. Tampilan untuk admin

Kartu **"Kualitas jawaban"** di `/admin/ai-assistant` (hanya baca):
- 7 / 30 hari: % giliran suara dengan angka berubah (M1), jumlah pelanggaran identitas (M2), % jawab sendiri (M3), kejadian data pribadi (M4, harus 0).
- **Peringatan** (sesuai #53): bila M1 > 5% dari 50 giliran suara terakhir; M2/M4 setiap kejadian ditandai.
- Tautan ke percakapan terkait **hanya untuk admin** dan hanya bila admin memang boleh membuka riwayat itu (perlu diputuskan; lihat Q4).
- Tidak ada notifikasi otomatis (email/Telegram) di tahap pertama.

## 5. Tahap & biaya

- Masuk **S2** (sesuai 06 v3), setelah S1 MVP jalan. Pencocok angka & pemformat dari S0 dipakai ulang.
- Butuh: tabel metrik baru (migration idempotent), endpoint penutupan giliran menerima transkrip ucapan, kartu admin, job pembersihan retensi.
- Beban: satu baris per metrik per giliran (kecil); perhitungan regex/pencocok ringan, tanpa panggilan AI tambahan.

## 6. Pertanyaan untuk user

1. Metrik tahap pertama: **M1–M4** (saran) atau tambah M5/M6 sekarang?
2. Simpan **hanya penanda tanpa teks** (saran) atau juga simpan transkrip ucapan GPT-Live untuk diaudit?
3. Retensi **90 hari** (saran) atau lain?
4. Admin boleh membuka percakapan yang ditandai? (Saat ini riwayat percakapan milik masing-masing user; membuka percakapan user lain = kebijakan privasi baru.) Saran: **tidak** di tahap pertama — admin cukup melihat angka & waktu.
5. Ambang peringatan: M1 > 5% dari 50 giliran (sudah #53); M2 & M4 setiap kejadian. Setuju?
6. Dikerjakan di S2 bersama kontrol sesi lengkap (saran), atau lebih awal?
