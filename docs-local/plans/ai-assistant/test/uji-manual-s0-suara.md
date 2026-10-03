# Uji manual — S0 halaman uji suara (`/admin/ai-assistant/voice-lab`)

> Branch `feature/ai-voice-s0` (`d6b8235`, `8cee1b6`, `8140b7b`, `4ca50d0`) di worktree
> `~/orca/workspaces/dashboard-desa-plus/dashboard-desa-plus-voice-s0`. Bisa diuji **sebelum** merge:
> hentikan `bun run dev` di checkout utama, lalu jalankan `bun run dev` di worktree S0 (DB & `.env` sama).
> Hanya **Chrome/Edge desktop**. Setiap giliran memakai **kuota chat sungguhan** (Claude) + biaya OpenAI.
> Rancangan: `06-fitur-3-suara.md` §10 (S0). Isi **Hasil** dengan ✅ / ❌ dan salin JSON pengukuran ke §E.

## 0. Persiapan

| # | Langkah | Hasil |
|---|---|---|
| 0.1 | `/admin/ai-assistant` → slot **Suara**: Base URL `https://api.openai.com/v1` (harus berakhiran `/v1`), isi API key OpenAI **di form ini saja** (jangan kirim lewat chat/dokumen). Model slot boleh apa saja — S0 memilih model di halaman uji | |
| 0.2 | Klik tautan halaman uji suara (atau buka `/admin/ai-assistant/voice-lab`) | |
| 0.3 | Akun non-admin membuka URL yang sama → ditolak | |

## A. Tes perangkat

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| A1 | Klik **Tes perangkat**, izinkan mikrofon | Level meter bergerak saat bicara | |
| A2 | Tolak izin mikrofon | Pesan jelas, tidak crash | |
| A3 | Buka di Safari/Firefox | Peringatan "gunakan Chrome/Edge" | |

## B. Jalur V2 (utama: OpenAI telinga + mulut, Claude otak)

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| B1 | Mode token **Token**; **On**, ucapkan *"berapa total APBDes tahun ini?"* | Teks ucapan tampil langsung; status Mendengarkan → Menjawab | |
| B2 | Setelah Anda diam | Jawaban Claude tampil sebagai teks lalu **dibacakan** | |
| B3 | Bicara saat jawaban dibacakan | Pemutaran berhenti (barge-in) | |
| B4 | Tombol **bisukan** | Jawaban hanya teks | |
| B5 | Bila B1 gagal di mode Token → ganti ke **Relay-server**, ulangi | Catat mode mana yang jalan (temuan: token sementara untuk transkripsi belum terverifikasi) | |
| B6 | Coba 2 metode deteksi akhir ucapan (VAD browser dengan beberapa ambang/durasi diam, dan tombol manual) | Catat mana yang paling pas (keputusan no. 8) | |
| B7 | Ucapkan nama tempat/istilah: *Darmasaba, Banjar, APBDes, Posyandu* | Catat ketepatan transkrip bahasa Indonesia | |
| B8 | Pakai speaker (bukan headset) | Catat apakah suara Jenna ikut tertranskrip (gema) | |

## C. Jalur V1-B (pembanding: GPT-Live + delegasi ke Claude)

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| C1 | Pilih V1-B, On, tanyakan hal yang sama dengan B1 | Teks **asli Claude** tampil berdampingan dengan ucapan GPT-Live | |
| C2 | Bandingkan kedua teks | Catat apakah GPT-Live **mengubah kalimat** (syarat V1-B: tidak boleh) | |
| C3 | Rasakan jeda dibanding V2 | Catatan: V1-B mengirim jawaban Claude utuh sekali; "audio pertama" bisa terpicu suara pengisi GPT-Live | |

## D. Batas sesi

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| D1 | Diam 2 menit | Auto-off | |
| D2 | Biarkan sesi berjalan 10 menit | Berhenti di batas sesi | |
| D3 | Off manual | Mikrofon mati, ikon hilang | |

## E. Hasil pengukuran (tempel JSON dari tombol salin/unduh)

| Jalur | Mode token | Metode akhir ucapan | p50 (dtk) | p95 (dtk) | Catatan |
|---|---|---|---|---|---|
| V2 | | | | | |
| V1-B | | | | | |

## Catatan hasil uji

| Tanggal | Penguji | Langkah ❌ | Catatan / screenshot |
|---|---|---|---|
| | | | |

---

## F. Uji ulang V1-B: per kalimat + "bacakan persis" + pencocokan angka (commit `3d8fee1`)

> Keputusan #51: V1-B pilihan utama; yang diuji sekarang apakah GPT-Live mengubah isi jawaban Claude.
> Catatan dari docs OpenAI: model **dilatih memparafrase** dan **tidak ada mode resmi "bacakan persis"** — instruksi hanya
> menurunkan risiko. Pencocokan dihitung per giliran (bukan per kalimat).

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| F1 | Pengaturan V1-B: **Mode kirim = Per kalimat** (default). Tanya pertanyaan berisi angka, mis. *"berapa total dan realisasi APBDes 2026?"* | Kalimat pertama dibacakan lebih cepat dibanding sebelumnya | |
| F2 | Lihat kartu di bawah kolom Claude / GPT-Live | Lencana **"Angka cocok m/n"**; bila ada perubahan: ⚠️ **"Angka berubah"** + daftar angka hilang/tambahan + istilah hilang. "Menunggu…" sampai GPT-Live diam 1,5 dtk | |
| F3 | Tanya yang menyebut nama banjar / persen / rupiah (mis. *"banjar dengan penduduk terbanyak dan persentasenya"*) | Nama banjar & angka diperiksa | |
| F4 | Ulangi F1–F3 dengan **Mode kirim = Utuh sekaligus** | Bandingkan jeda & skor dengan per kalimat | |
| F5 | (Opsional) Edit teks instruksi "bacakan persis" di pengaturan, ulangi | Catat apakah skor membaik | |
| F6 | Potong bicara (barge-in) / Off di tengah jawaban | Giliran itu "Tidak dinilai" | |
| F7 | Unduh/salin JSON → tempel di §E | `summaryByMode` berisi V2 / V1-B utuh / V1-B per kalimat (p50/p95, % cocok, jumlah ⚠️) | |

**Keterbatasan yang perlu diingat saat membaca skor:** angka yang diucapkan tidak baku atau salah dengar bisa terhitung
"berubah"; kata "satu" yang berdiri sendiri diabaikan; kalimat yang sudah terkirim sebelum barge-in tidak bisa ditarik.

**Yang perlu diputuskan setelah uji:** berapa % kecocokan angka yang dianggap cukup (mis. 100% angka harus sama, gaya bahasa
boleh beda), dan mode kirim mana yang dipakai di S1.

## G. Angka lisan ringkas (commit `b2b8671`)

> Diagnosa kasus "940.248.688": pencocok kita sudah benar untuk frasa lengkap; yang salah memang **GPT-Live** (membaca
> "688 … ribu"). Pencocok juga diperbaiki untuk campuran digit + skala ("940 juta 248 ribu 688").
> Pemformat: angka ≥ 1 juta diringkas sebelum dikirim ke GPT-Live (juta 1 desimal; miliar/triliun 2 desimal; "Rp" → "rupiah";
> kata "sekitar" hanya bila pembulatan mengubah nilai). Teks panel tetap teks asli Claude.

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| G1 | V1-B, toggle **"Ringkas angka besar" = aktif**, tanya *"berapa total anggaran APBDes?"* | Diucapkan ringkas, mis. "sekitar 940,2 juta rupiah"; teks panel tetap angka lengkap | |
| G2 | Lihat kartu giliran | Baris **"940,2 juta ≈ Rp 940.248.688 ✓"**; lencana angka cocok | |
| G3 | Matikan toggle, ulangi G1 | Angka lengkap dikirim; catat apakah GPT-Live salah baca lagi (✗) | |
| G4 | Angka < 1 juta, tahun, persen | Tidak diringkas | |
| G5 | Tempel JSON di §E | — | |
