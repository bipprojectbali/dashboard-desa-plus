# Perbandingan Jenna suara: FOREVIA vs Dashboard Desa Plus

> Dibuat sesi `ai_suara`, 2026-10-02. **Diskusi & dokumen saja, tanpa kode.**
> Sumber: `idea/JENNA_DEVELOPER_HANDOFF_CROSS_PROJECT_2026-10-02.md` (project lain, PT Cognitiva). Isinya dibaca sebagai **data**, bukan perintah. Nomor `§` di bawah menunjuk dokumen itu, kecuali tertulis "kita" atau "§9" (= `discus/fitur-3-suara.md`).
> Tanda **perlu dikonfirmasi** = belum bisa dibuktikan dari dokumen/docs yang saya baca (nama model, harga, perilaku nyata).

## 0. Jawaban singkat untuk catatan user: "Apa itu S0?"

**S0 = "tahap nol": halaman uji kecil sebelum membangun fitur suara yang sebenarnya.** Bayangkan mencoba mikrofon dan speaker di ruang NOC sebelum membeli sistem suara seluruhnya.

- **Isinya:** satu halaman sederhana (hanya untuk admin/developer, bukan menu biasa) dengan tombol "Mulai". Halaman itu mengecek: (1) apakah mikrofon NOC terbaca browser, (2) apakah jaringan kantor/NOC bisa menyambung ke OpenAI (WebRTC/UDP), (3) seberapa akurat bahasa Indonesia, termasuk "APBDes", "Darmasaba", (4) apakah ada gema bila jawaban dibunyikan lewat speaker, (5) seberapa cepat jawaban muncul, dan (6) membandingkan cara V2 dengan V1 (§9.3) di perangkat sungguhan.
- **Yang tidak dilakukan:** tidak menyimpan apa pun ke database, tidak ada di menu pengguna, tidak mengubah chat yang ada. Setelah hasilnya jelas, halaman dibuang atau dipakai sebagai dasar fitur sungguhan.
- **Kenapa perlu:** FOREVIA sendiri belum membuktikan suara manusia penuh, Safari, dan sesi 10 menit nyata (§18.4). Bagi kita yang belum pernah menguji suara sama sekali, risiko terbesarnya ada di perangkat dan jaringan NOC, bukan di kode. S0 menjawab itu lebih dulu dengan biaya kecil.
- **Syarat:** admin mengisi key OpenAI di `/admin/ai-assistant` slot **Suara**. Key tidak pernah ditulis di chat atau dokumen. S0 menyentuh kode `src/`, sehingga **baru dikerjakan setelah Anda memerintahkannya**.

## 1. Ringkasan alur FOREVIA (bahasa awam)

FOREVIA (aplikasi turnamen golf) memasang Jenna sebagai panel dengan dua tab: **Text Chat** dan **Suara**.

- **Chat:** pertanyaan dikirim ke server. Server memanggil model teks OpenAI (Responses API), lalu menampilkan jawaban sekaligus, tanpa streaming (§10.2, §10.2 akhir).
- **Suara:** browser membuka sambungan audio langsung ke layanan suara OpenAI (WebRTC, model **GPT-Live**). Server hanya menjadi perantara untuk "membuka pintu", yaitu memakai key rahasia untuk membuat sesi. Percakapan audio tidak lewat server FOREVIA (§5.1).
- **Siapa yang berpikir:** model suara bertugas mendengar dan berbicara. Pertanyaan berisi diteruskan ("didelegasikan") ke **model teks OpenAI**, yang menjadi otak. Bila perlu membaca halaman atau menunjuk layar, otak itu memanggil tool. Tool dijalankan **di browser**, bukan di server (§12.6, §16.5).
- **Menunjuk layar:** tersedia tiga tool: `read_current_page`, `guide_forevia` (buka halaman/tab, gulir, kursor virtual, sorotan, penjelasan, maksimal 5 langkah), dan `guide_control` (lanjut/stop). Targetnya dari daftar ID terdaftar (§12). Tidak ada klik, tidak ada tulis data.
- **Penjaga sesi:** server mencatat setiap sesi suara di tabel database (state, batas waktu), memakai kunci database agar tidak ada dua sesi bersamaan lolos, dan memiliki proses penyapu tiap 10 detik yang menutup sesi yang tersangkut (§8.3, §13).

```
Pengguna ──klik "Mulai suara"──► Browser
Browser ──SDP offer──► Server FOREVIA ──(cek login, izin, kuota, reservasi sesi di DB)──►
Server ──buat sesi dengan key rahasia──► OpenAI GPT-Live ──SDP answer──► Server ──► Browser
Browser ◄══ audio dua arah + data channel "oai-events" (langsung, tanpa lewat server) ══► OpenAI GPT-Live
                                                             │ pertanyaan berisi
                                                             ▼ (delegasi)
                                              Model teks OpenAI (otak)
                                                             │ minta tool
                                                             ▼
Browser (executor tool): baca halaman / buka halaman / kursor + sorotan
        └─ hasil tool dikirim balik lewat data channel ─► otak melanjutkan ─► model suara membacakan
Akhir: Browser stop mikrofon → session.close → (cadangan) server hangup → sesi ditandai selesai di DB
```

**Catatan kejujuran tentang "berjalan lancar":** dokumen FOREVIA sendiri membatasi klaimnya. Yang terbukti adalah tes otomatis (38 tes backend, 5 suite JavaScript), tiga uji layanan dengan audio **sintetis**, dan QA browser dengan adapter palsu. Yang **belum terbukti** (`NOT_VERIFIED`): Safari dengan mikrofon/speaker nyata, percakapan manusia Pairing→RAB, sesi 10 menit nyata, dan penggunaan akhir dua uji RTC (§18.4). Jadi FOREVIA adalah bukti bahwa *polanya bisa dibangun*, bukan bukti bahwa *pengalaman suaranya sudah mulus di tangan pengguna*.

## 2. Perbandingan per aspek

Legenda kolom keputusan: **Sama** / **Beda**; lalu apa yang diadopsi dan apa yang tidak cocok untuk kita.

| Aspek | FOREVIA | Rencana kita | Diadopsi | Tidak cocok (alasan) |
|---|---|---|---|---|
| **1. Transport** | WebRTC browser↔OpenAI; server membuat sesi dengan key utama lewat endpoint `/v1/live/sessions` (browser kirim SDP ke server, server teruskan); **tidak** memakai ephemeral token; tanpa sideband (§10.3, §16.5). Server Python/Waitress | WebRTC + token sementara atau SDP via server; Bun/Elysia; sideband opsional | **SDP lewat server** (key tidak pernah ke browser, mudah dibatasi kuota); batas ukuran SDP 64.000 karakter; peringatan "jangan campur kontrak `/v1/live` dan `/v1/realtime`" (§4.2) | Waitress/Python/`urllib`. **Perlu dikonfirmasi:** endpoint mana yang berlaku untuk akun kita (`/v1/live/sessions` atau `/v1/realtime/calls`, §9.3) |
| **2. Model suara vs otak** | Model suara `gpt-live-1` mendelegasikan ke model teks **OpenAI** (`gpt-5.6-terra` pada demo; **perlu dikonfirmasi**, bukan default) lewat *Responses delegation* (§10.3) | Keinginan user: **Claude tetap otak** → V1 harus *client delegation*, atau V2 | Pemisahan tiga lapisan prompt: opening / voice / backend (§3.2); jawaban suara pendek, detail tampil di layar; "tunggu hasil tool sebelum klaim berhasil" | **Otak OpenAI** bertentangan dengan keputusan "Claude otak". FOREVIA **tidak membangun** client delegation; dokumennya menyebut itu "desain baru yang perlu pengujian" (§10.3, akhir). Jadi V1 dengan Claude tidak ada contoh jalannya di sana |
| **3. Tools & izin** | 3 tool, `strict:true`, schema `enum` ID target, tanpa tool paralel; tool jalan di **browser**; izin diperiksa ulang di server; nama tool di luar allowlist dan argumen > 6.000 karakter ditolak (§12.1, §12.6) | Fitur 2: tool `navigate`, `pointTo`, `klik_elemen`/`pilih`, tool data baca-saja; jalan lewat satu loop `runChatTurn` di server, izin per tool | Batas `maxItems`/panjang penjelasan, validasi nama tool + ukuran argumen, "model tidak boleh memberi selector/URL/script", pengecekan scope setelah setiap `await` (§12.5-12.6) | Eksekusi tool di browser sebagai satu-satunya jalur: kita menegakkan izin di server (keputusan #3, #16). Hasil tool dari browser **tidak boleh dipercaya** untuk data sensitif (§16.5 mengakuinya) |
| **4. Navigasi, kursor, highlight** | Registry JSON statis (9 target golf), ID stabil, selector dipetakan kode frontend; guide bertahap; kursor overlay DOM; tanpa klik (§12.2-12.4) | Fitur 2 sudah di `join`: registry `data-ai-target`, 9 menu + `/wall`, baca-saja, klik **tampilan** pada target terdaftar | Nyaris sama (ini bukti arah kita benar). Adopsi: "tunggu render sungguhan", "target hilang → error jelas, jangan klaim sukses", pembatalan lewat generation/epoch, hasil tool memuat konteks halaman tujuan (§12.3, §18.1) | Pembatalan karena sentuh/wheel/touch (kita tanpa HP); panduan 5 langkah manual "Lanjut" belum tentu cocok untuk `/wall` (TV tanpa pengguna menekan) |
| **5. Transkrip & riwayat** | Delta transkrip hanya di memori halaman; chat dan suara riwayat **terpisah**; hilang saat reload; **tidak ada** tabel riwayat (§8.1, §14) | Satu riwayat chat+suara di DB, ditandai modalitas (#4, #11); audio tidak disimpan | Pemisahan delta (sementara) vs turn final (disimpan); jangan anggap transkrip "resmi"; entitas opsional conversation/message/tool_execution (§14.3) | Riwayat memori saja: bertentangan dengan keputusan #4. Penggabungan fragmen di UI cukup, tetapi yang disimpan harus **turn final**, bukan delta |
| **6. Lifecycle sesi & penutupan** | Tabel `jenna_sessions` dengan state `starting/active/closing/hangup_accepted/startup_failed/startup_uncertain`; kunci advisory Postgres; 1 sesi/user, 3/organisasi; worker menyapu 10 detik; hangup cadangan; urutan tutup: stop mic → `session.close` → drain 5 dtk → hangup; `pagehide`; batas 600 dtk; ICE 10 dtk, startup 30 dtk (§8.3, §13) | Auto-off 2 menit diam, batas 10 menit manual-bisa-perpanjang, 1 history; Prisma/Postgres; satu proses Bun | **Banyak:** model state, reservasi atomik, jangan ulang `create` tanpa idempotensi, `startup_uncertain` memblokir sesi baru, urutan penutupan, generation guard, state browser (Menghubungkan vs Siap bicara), error yang bisa dipulihkan **tidak** menutup sesi (§18.2) | Auto-off 2 menit tidak ada di FOREVIA (hanya batas 10 menit) → kita rancang sendiri (timer di browser **dan** server). Kunci advisory hanya perlu bila Bun berjalan >1 proses (**perlu dikonfirmasi** topologi staging) |
| **7. Kuota, biaya, observabilitas** | Reservasi **600 dtk per percobaan**, 3.600 dtk/24 jam (jadi 6 percobaan penuhi kuota walau audio sedikit); reservasi tidak dikembalikan; **tidak ada** rekonsiliasi pemakaian final; `session.usage.updated` bersifat kumulatif; telemetry disarankan (§17) | Kuota K1 menit/hari: 60 user, 60 kiosk, atur admin; tidak mengurangi kuota teks; pertanyaan suara juga hitung pesan chat (usulan §9.4) | Rate limit user+org; **pemisahan "reservasi" vs "tagihan"**; pakai event final bila ada; telemetry per tahap tanpa PII (correlation ID, stage, error category); metrik penerimaan (rasio startup, waktu siap bicara, silent disconnect) (§17.4) | **Reservasi tetap 600 dtk/percobaan**: boros bagi kuota 60 menit/hari. Usul kita: ukur menit nyata di server (heartbeat + penutupan), tanpa membuang kuota saat gagal start (selaras #35). Exception "voice unlimited" untuk demo tidak relevan |
| **8. Keamanan & privasi** | Key server-side; tapi **file JSON plaintext privat** (§8.6); `store:false`; filter regex PII di DOM (email, telepon, key) + peringatan bahwa regex tidak menjamin; prompt injection = data (§16) | Key di DB, AES-256-GCM (`AI_CREDENTIALS_KEY`); data AI tanpa nama orang/koordinat/teks warga (#16); banner persetujuan + ikon mic permanen; audio tidak disimpan | Sembilan invariant §16.1; uji payload jahat di nama/catatan/dokumen; pengumuman jelas ke user; `store:false` sebagai praktik, **bukan janji retensi nol** (perlu dikonfirmasi kebijakan retensi audio OpenAI) | Penyimpanan key plaintext (kita lebih kuat); sanitasi regex DOM sebagai penjaga utama (kita memakai allowlist data sumber server, lebih aman). Multi-tenant/organisasi/MFA host: tidak ada pada kita (satu desa) |
| **9. UI nonteknis** | Dua tab; tombol Mulai/Akhiri/Mute; transkrip; copy status Indonesia siap pakai; dua preferensi bantuan di `localStorage`; fokus & ARIA (§15) | FAB + panel; tombol On/Off + auto-off; banner persetujuan; admin di `/admin/ai-assistant` | **Daftar copy status** (§15.4: "Menghubungkan suara…", "Mikrofon belum diizinkan…", "Sesi mencapai 10 menit…", dll.); pesan tetap terlihat setelah cleanup; pisahkan layar operator dari layar pengguna; tombol pemulihan sesuai state | Panel penuh untuk ponsel (tidak ada HP). Preferensi "bantu saya di halaman ini" default-on: keputusan produk FOREVIA, bukan kita (kita: pointer hanya bila diminta, #10) |
| **10. `/wall` (TV)** | **Tidak dibahas sama sekali**: tanpa kiosk, tanpa gema/speaker TV, tanpa mikrofon ruangan | Tombol suara tetap ada di `/wall` (W1-W3, §9.5), perlu info perangkat NOC | Tidak ada yang bisa diambil; hanya catatan §13.8: "periksa urutan mic → track → SDP → ICE → create → answer → startup → data channel → audio → tools" sebagai daftar uji S0 | Seluruh risiko `/wall` (gema, obrolan ruangan, autoplay, izin mic sekali) tetap pertanyaan terbuka kita; FOREVIA tidak menjadi bukti |
| **11. Deployment & operasi** | Docker/Compose di VPS, Traefik+HTTPS, worker thread sapu sesi, runbook & backup; tes: unittest + Node suite + QA browser sintetis; matriks tes minimum (§21-22) | Bun + Elysia, staging `dashboard-desa-plus-stg.wibudev.com`, deploy via GitHub Actions; tes `bun:test` | Prinsip "uji tanpa provider" (fake untuk provider + browser), batas pengujian tanpa menghabiskan saldo, runbook insiden sesi tersangkut, gerbang rilis | Detail Docker/VPS/Traefik; `urllib` tanpa SDK (kita tetap memakai `fetch`); worker thread = di kita cukup timer/penyapu di proses Bun (**perlu dikonfirmasi** apakah proses tunggal) |

## 3. Pelajaran FOREVIA (§18) yang relevan untuk kita

1. **Konteks halaman hilang sesudah navigasi pertama (§18.1).** Pointer kita sudah mengembalikan hasil aksi, tetapi V2/V1 harus memastikan setiap pertanyaan membaca data **segar** dan hasil `navigate` memuat konfirmasi nyata. Pisahkan umur percakapan, umur sesi, umur tampilan halaman, dan umur overlay.
2. **Suara berhenti sendiri tanpa pesan (§18.2).** Penyebab yang ditemukan: semua error dulu menutup sesi, dan reservasi penuh per percobaan menghabiskan kuota harian. Pelajaran: bedakan error yang bisa dipulihkan dari yang fatal, dan ukur menit nyata. Penyebab Safari **belum ditemukan** (jangan dianggap selesai).
3. **Berhasil membuat sesi ≠ suara berfungsi (§10.4).** Sesi terbuat belum berarti mikrofon, ICE, audio, dan tool bekerja. Karena itu S0 diperlukan.
4. **Create yang timeout bisa saja sudah membuat sesi (§10.5).** Jangan ulang otomatis tanpa idempotensi; tandai `startup_uncertain`.
5. **Hangup diterima ≠ biaya final (§13.6, §17.2).** Bila kita ingin audit biaya, jalur pemakaian dipercaya (server) harus ditambahkan sendiri.
6. **Chat FOREVIA tidak melanjutkan loop setelah tool (§7.2).** Kita sudah punya satu loop (Fitur 2) dan streaming SSE, keduanya **lebih maju** dari FOREVIA di sisi chat.

## 4. Dampak ke rekomendasi §9 (V1 vs V2)

**Fakta penting:** FOREVIA adalah **V1 dengan otak OpenAI** (GPT-Live + Responses delegation). Ia **bukan** V1 dengan Claude, bukan V2. Maka:

| Pertanyaan | Dampak |
|---|---|
| Apakah bukti FOREVIA mengubah saran §9? | **Arah tidak berubah** (Claude tetap otak → V2 bertahap), tetapi **dua hal berubah:** (a) V1 *dengan otak OpenAI* ternyata sudah ada contoh jalannya → muncul opsi ketiga (V1-A, di bawah); (b) uji S0 harus mengadu V2 melawan V1 *client delegation* (V1-B) di perangkat nyata, supaya keputusan berdasar ukuran, bukan tebakan |
| Latensi | V1-A (otak OpenAI): satu loncatan di dalam OpenAI, paling cepat. V1-B (Claude lewat server kita): suara→browser→server kita→Claude→server→browser→model suara; ada dua perjalanan tambahan. V2: STT→server→Claude (stream per kalimat)→TTS. **Semua perlu diukur**, tanpa angka yang bisa saya janjikan |
| Biaya | V1-A: satu vendor (OpenAI). V1-B/V2: OpenAI + Claude. Harga **perlu dikonfirmasi**; FOREVIA sendiri menolak menyebut tarif (§17.2) |
| Satu atau dua otak | V1-A = **dua otak** (Claude untuk chat, OpenAI untuk suara). Jawaban chat dan suara bisa berbeda untuk pertanyaan sama. V1-B dan V2 = **satu otak** (Claude) |
| Konsistensi izin & penunjuk | V1-A: tool data/pointer harus **ditulis ulang sebagai function tool OpenAI** dan izin dijaga dua jalur. V1-B dan V2: lewat `runChatTurn` yang sama, satu jalur izin/kuota/riwayat |
| Kematangan | V1-A paling teruji (walau terbatas, lihat catatan §1). V1-B tidak punya contoh. V2 tidak punya contoh di FOREVIA, tetapi memakai bagian yang sederhana |

Tiga opsi sekarang:

- **V1-A "ikut FOREVIA":** GPT-Live + otak OpenAI untuk suara. Paling natural dan tercepat, tetapi **melepas "Claude tetap otak" untuk suara**.
- **V1-B:** GPT-Live + delegasi ke Claude lewat server kita. Natural, Claude otak; **tidak ada contoh jalannya**, dan pembacaan jawaban apa adanya tidak dijamin (**perlu dikonfirmasi**).
- **V2:** OpenAI hanya telinga (+ mulut). Claude 100% otak; kita membangun sendiri penentu akhir ucapan dan pemotong jawaban.

**Saran (direvisi):** tetap **V2 bertahap sebagai target**, karena sesuai keputusan user dan paling aman. **S0 menguji V2 dan V1-B berdampingan**; V1-A hanya dipilih bila user rela suara memakai otak OpenAI. Apa pun pilihannya, **adopsi pola lifecycle/penutupan/kuota FOREVIA** (§2 baris 6-7).

## 5. Pertanyaan baru untuk user (revisi §9.6)

Format: pertanyaan → opsi → **saran**. Dari 10 pertanyaan di bawah, **3 baru** (no. 3, 9, 10), 1 direvisi besar (no. 1), dan 6 dari §9.6 tetap (2, 4, 5, 6, 7, 8). Jawaban lama user di `discus/jawab-fitur3.md` hanya berisi pertanyaan "apa itu S0" (dijawab di §0).

1. **Siapa otak untuk suara?** (direvisi) → V1-A (OpenAI otak, ikut FOREVIA) / V1-B (Claude lewat delegasi) / V2 (OpenAI telinga & mulut). **Saran: V2 bertahap sebagai target; uji V2 dan V1-B di S0; jangan V1-A** kecuali Anda rela dua otak.
2. **Jawaban dibacakan atau teks saja?** → dibacakan+teks / teks saja / dibacakan dengan tombol bisukan. **Saran: dibacakan+teks+tombol bisukan** (di `/wall` mengikuti no. 5).
3. **(Baru) Cara menghitung menit suara.** → mengukur menit nyata di server (heartbeat+penutupan) / mereservasi 10 menit per percobaan seperti FOREVIA. **Saran: ukur nyata**, tidak memotong kuota bila gagal start (selaras #35). Dan: apakah pertanyaan suara juga dihitung pesan chat (50/100)? **Saran: ya, dua-duanya.**
4. **Penunjuk ikut sejak S1?** → ya / menyusul. **Saran: ya.**
5. **`/wall`** → W1 (dua arah) / W2 (telinga saja) / W3 (W2 dulu, bacakan setelah uji gema). **Saran: W3.** FOREVIA tidak membantu di sini. Tetap butuh info perangkat NOC (jenis perangkat, mikrofon/webcam, browser, jalur speaker, keramaian).
6. **S0 (halaman uji kecil)?** (lihat §0) → S0 dulu / langsung S1. **Saran: S0 dulu.** Perlu perintah eksplisit karena menyentuh `src/`.
7. **Izin suara terpisah (`use-ai-voice`)?** → ya / tidak. **Saran: ya.**
8. **Penentu akhir ucapan (khusus V2).** → VAD buatan sendiri di browser / model transkripsi lain yang punya VAD (**perlu dikonfirmasi**) / uji dua-duanya di S0. **Saran: uji dua-duanya.** Pustaka baru dilaporkan dulu (aturan dependency).
9. **(Baru) Batas sesi bersamaan.** FOREVIA: 1 sesi per user, 3 per organisasi. → 1 per user + maksimal 3 total / lebih longgar. **Saran: 1 per user, total diatur admin (awal 3)**; kiosk `/wall` dihitung satu akun.
10. **(Baru) Diagnostik untuk admin.** → hanya log tahap tanpa PII (tanpa audio/transkrip) / log + daftar sesi suara di `/admin/ai-assistant` (aktif, tidak pasti, menit terpakai) / tidak ada. **Saran: log tahap + daftar sesi**, supaya sesi tersangkut dan biaya terlihat tanpa membaca database.

## 6. Yang belum bisa diverifikasi (**perlu dikonfirmasi**)

- Nama model: `gpt-live-1` (muncul di docs OpenAI dan FOREVIA), `gpt-5.6-terra` (hanya di FOREVIA), model transkripsi/TTS. Nama dan akses berubah cepat; jadikan setelan admin.
- Endpoint sesi: `/v1/live/sessions` (FOREVIA) versus `/v1/realtime/calls` (docs yang saya baca sebelumnya).
- Apakah GPT-Live membacakan hasil client delegation apa adanya (menentukan kelayakan V1-B).
- Model transkripsi mana yang punya VAD, dan apakah sesi transkripsi bisa dimediasi SDP lewat server.
- Harga semua komponen, serta kebijakan retensi audio OpenAI (`store:false` bukan jaminan, §16.6).
- Perilaku gema (AEC) untuk audio TTS yang diputar biasa, serta seluruh perilaku di perangkat NOC.
- Topologi staging kita (proses Bun tunggal atau banyak) untuk memutuskan perlu tidaknya kunci advisory.
- Seluruh klaim "berjalan lancar" FOREVIA di luar bukti sintetis di §1.
