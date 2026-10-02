# Diskusi — Panduan bertahap & sidebar ringkas (adaptasi dari FOREVIA)

> Sumber ide: `idea/JENNA_DEVELOPER_HANDOFF_CROSS_PROJECT_2026-10-02.md` §7.1, §12 (dibaca 2026-10-02).
> Keputusan user 2026-10-02: **adopsi** panduan bertahap (#43) dan sidebar ringkas saat panel terbuka (#44);
> **cek** pembatalan panduan (§3 di bawah); **tolak** membaca layar (#45, menegaskan #16).
> Status: **DISETUJUI user 2026-10-02 — semua saran §4 diterima** (5 langkah; catatan dekat target + tercatat di chat; hanya bila diminta; `/wall` lanjut otomatis diatur admin awal 8 dtk; sidebar S-c dengan rel ikon; urutan pembatalan → sidebar → panduan). Dikerjakan worker `ai_pointer`.

## 1. Panduan bertahap ("tunjukkan 3 bagian penting keuangan")

**Di FOREVIA:** tool `guide_*` menerima 1–5 langkah `{target, explanation}`; hanya satu langkah tampil, catatan
penjelasan (≤ 500 karakter, `textContent`) muncul di dekat target, tombol **Lanjut** (bila ada langkah berikutnya) dan
**Stop**; tool `guide_control` (next/stop). Kursor & sorotan sama seperti milik kita.

**Usulan untuk kita (memakai Fitur 2 yang sudah ada, bukan menggantinya):**

| Bagian | Usulan |
|---|---|
| Tool | Tool baru `pandu_langkah` dengan `langkah[]` 1–5 berisi `{target, penjelasan}`; target dari registry yang sama dan disaring izin per user (seperti `tunjukkan_elemen`). Langkah boleh lintas halaman (navigasi otomatis antar langkah, tetap hanya ke rute terdaftar). |
| Aksi UI | Aksi baru `guide` dikirim lewat `actions` yang ada; server memvalidasi semua target sebelum dikirim, klien memvalidasi lagi (dua lapis seperti sekarang). |
| Tampilan | Kartu catatan kecil di dekat target: "Langkah 2 dari 3", teks penjelasan (teks biasa, bukan HTML/Markdown), tombol **Lanjut** / **Selesai** dan **Stop**. Kartu tidak menutupi target. |
| Batas | Hanya menunjuk. Klik/pilih tidak masuk panduan (tetap lewat `klik_elemen`/`pilih` terpisah). Tidak ada lanjut otomatis di halaman biasa. |
| `/wall` | Hanya widget `wall.*`, tanpa pindah halaman (aturan #40). Pertanyaan: lanjut otomatis tiap N detik di TV? (Q4) |
| Kuota | Satu panduan = satu jawaban AI = satu pesan; Lanjut/Stop **tidak** memanggil AI (tanpa kuota), seperti label Sumber (P3). |
| Mode perbesar | Sama dengan P6: panel ditutup sementara selama panduan, "Kembali ke chat" setelah selesai/Stop. |

## 2. Sidebar ringkas saat panel terbuka

**Di FOREVIA:** saat panel terbuka di desktop, konten menyesuaikan dan sidebar menjadi ikon; saat ditutup, keadaan
sidebar sebelumnya dikembalikan.

**Fakta kita:** sidebar (`src/components/sidebar.tsx`) **hanya teks, belum punya ikon**; yang ada hanya sembunyi penuh
(`sidebarCollapsed`). Lebar sidebar 300px + panel 440px → di laptop ±1366px konten tersisa ±626px.

| Opsi | Cara | Konten tersisa di 1366px |
|---|---|---|
| S-a Rel ikon | Tambah ikon per menu; saat panel terbuka sidebar menyempit ke ±72px berisi ikon + tooltip | ±850px |
| S-b Sembunyi penuh | Pakai collapse yang ada; dikembalikan saat panel ditutup | ±920px |
| S-c Ikuti lebar layar | S-a/S-b hanya bila layar < ±1600px; layar lebar tidak diubah | sama dengan S-a/S-b |

Dalam semua opsi: keadaan sidebar pilihan user disimpan dan **dipulihkan** saat panel ditutup; user tetap bisa membuka
sidebar manual saat panel terbuka.

## 3. Hasil cek: pembatalan penunjuk (kode `join` 2026-10-02)

| Situasi | Sekarang | Catatan |
|---|---|---|
| Stop / percakapan baru sebelum jawaban selesai | ✅ aksi tidak dijalankan (`isCurrentTurn`) | uji 8.1, 8.2 |
| Perintah tunjuk baru saat kursor masih meluncur | ✅ yang lama dihentikan (`runToken`) | `pointer-store.ts` |
| User menggulir setelah kursor tiba | ✅ kursor & sorotan **mengikuti** target | `refreshPointer` |
| Sorotan hilang sendiri | ✅ setelah waktu tahan | `scheduleHide` |
| User menggulir (wheel/sentuh) **selagi kursor meluncur** | ❌ tidak berhenti; kursor tetap meluncur dan halaman bisa digulir ulang ke target | |
| User pindah halaman sendiri selagi aksi berjalan / menunggu kartu muncul | ❌ tidak dibatalkan; berakhir dengan pesan "belum bisa menunjukkan" setelah batas tunggu | |
| Tombol Esc / menutup panel | ❌ tidak menghentikan penunjuk | |

**Usulan:** satu pengendali pembatalan yang dipakai penunjuk biasa **dan** panduan: berhenti saat wheel/sentuh/
keyboard gulir, navigasi manual (dibedakan dari navigasi oleh penunjuk), Esc, menutup panel, atau Stop. Wajib ada
sebelum panduan bertahap, karena panduan berjalan lebih lama.

## 4. Pertanyaan untuk user

1. **Jumlah langkah maksimal?** 3 / 5 (FOREVIA) / diatur admin. **Saran: 5.**
2. **Letak catatan penjelasan?** kartu kecil di dekat target / hanya di panel chat / keduanya. **Saran: kartu di dekat target**, teks yang sama juga tercatat di jawaban chat.
3. **AI boleh memulai panduan tanpa diminta?** hanya bila user meminta ("pandu saya", "tunjukkan beberapa bagian") / boleh menawarkan. **Saran: hanya bila diminta** (konsisten #30); AI boleh menawarkan lewat teks.
4. **`/wall`: lanjut otomatis?** tidak / tiap 8 detik / diatur admin. **Saran: diatur admin, awal 8 detik** (TV jarang disentuh).
5. **Sidebar:** S-a / S-b / S-c. **Saran: S-c dengan S-a** (rel ikon hanya di layar < 1600px). Bila ingin cepat: S-b dulu, ikon menyusul.
6. **Urutan kerja:** (i) pembatalan (§3) → (ii) sidebar → (iii) panduan bertahap, tiap tahap satu branch + uji manual. **Saran: urutan ini.**
