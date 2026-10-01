# Diskusi temuan — AI Assistant

> Dibahas satu per satu. Tiap temuan: **fakta** (sudah dicek di kode) → **opsi** → **rekomendasi** →
>
> **keputusan user**. Status: ✅ diputuskan · ⏳ menunggu keputusan.


| #   | Temuan                                                                  | Menyentuh pondasi?    | Status                 |
| --- | ----------------------------------------------------------------------- | --------------------- | ---------------------- |
| 1   | Sumber data AI dari builder `wall-snapshot`                             | Ya                    | ✅                      |
| 2   | Fitur izin baru tidak muncul untuk role `user`                          | Ya                    | ✅ |
| 3   | Data sensitif yang harus disaring sebelum ke AI                         | Ya                    | ✅                      |
| 4   | Izin `view-*` tidak dicek di API                                        | Tidak (di luar scope) | ✅                      |
| 5   | `.env.staging` ter-commit                                               | Tidak (di luar scope) | ✅                      |
| 6   | Temuan kecil lainnya                                                    | Sebagian              | ✅ |
| 7   | **Verifikasi admin (`emailVerified`) tidak dicek di API** — temuan baru | Ya                    | ✅ |
| 8   | **Role dibaca dari cookie cache sesi (basi ≤30 hari)** — temuan P3 | Tidak (di luar scope AI) | ⏳ |


---

## Temuan 1 — Sumber data AI dari builder `wall-snapshot` ✅

**Fakta.** `src/api/wall-snapshot/build-*.ts` menyediakan data per modul yang sama dengan dashboard

dan video wall: server-side, ber-cache, bertipe (`src/types/wall.ts`), sengaja bebas PII.

Cache: pengaduan 15 menit (`TTL.DASHBOARD`), APBDes 1 jam (`TTL.APBDES`), demografi 6 jam (`TTL.DEMOGRAFI`).

**Keputusan user (2026-09-30):**

1. Data AI **mengikuti cache yang ada** — AI tahu persis sebanyak yang tampil di dashboard.
2. **Butuh parameter tahun.**

**Dampak ke desain (hasil cek kode):**

- Keuangan: sumbernya **sudah multi-tahun**. `fetchApbdesEntriesRaw()` (`src/api/sources/apbdes.ts`)

  mengambil semua entri APBDes, `mapKeuanganList()` (`src/api/transforms/keuangan-apbdes.ts`) mengubahnya

  jadi daftar per tahun (terbaru dulu), dan `GET /api/keuangan` sudah mengembalikan `years`.

  `buildKeuangan()` hanya mengambil `years[0]`. Jadi tool keuangan **tidak perlu mengubah builder**:

  tool memakai sumber + transform yang sama lalu memilih tahun. Rencana tool:
  - `ringkasan_keuangan({ tahun? })` — tanpa `tahun` = tahun terbaru; tahun tak tersedia → jawab
  
    "data tahun X tidak ada, yang tersedia: …".
  - `daftar_tahun_anggaran()` atau cukup disisipkan di hasil tool di atas (daftar tahun tersedia),
  
    agar AI bisa membandingkan dua tahun dengan dua kali panggil.
- Modul lain: pengaduan (tren 7 bulan dari API Jenna), demografi (Desa API), dst. **belum** terbukti

  punya data multi-tahun di sumbernya → dicek per tool saat pembahasan fitur 1, bukan dijanjikan sekarang.

---

## Temuan 2 — Fitur izin baru tidak muncul untuk role `user` ✅

**Fakta.**

- `GET /api/my-permissions` (`src/api/my-permissions.ts`): bila role sudah punya baris di

  `role_permission`, yang dikembalikan **hanya** baris `allowed=true`. Fitur baru tanpa baris → tidak ada

  di daftar → dianggap tidak diizinkan.
- Baris untuk fitur baru baru dibuat saat admin membuka `/admin/roles` (`seedDefaultPermissions()`

  dipanggil di `GET /api/admin/roles/permissions`).
- `checkPermission()` (`src/utils/permission.ts`) justru sudah benar: tanpa baris → jatuh ke default.

  Jadi ada **dua logika berbeda** untuk hal yang sama.
- Dampak ke AI: `use-ai-assistant` tidak akan muncul untuk role `user` di staging/produksi sampai admin

  kebetulan membuka `/admin/roles` → tombol FAB tidak tampil.

**Opsi.**


| Opsi | Isi                                                                                                                                          | Kelebihan                                                    | Kekurangan                                                                                                        |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| A    | Migrasi menyisipkan baris `use-ai-assistant` saja                                                                                            | Kecil                                                        | Masalah terulang tiap ada fitur izin baru                                                                         |
| B    | Satu fungsi murni `resolveAllowedFeatures(role, records)`: baris DB menang, fitur tanpa baris → default. Dipakai `my-permissions` **dan** AI | Memperbaiki akar masalah, satu sumber kebenaran, mudah dites | Perilaku `my-permissions` berubah untuk fitur tanpa baris (sekarang ikut default, sama seperti `checkPermission`) |
| C    | A + B                                                                                                                                        | Data DB lengkap **dan** logika benar                         | Paling banyak (tetap kecil)                                                                                       |


**Rekomendasi:** C.

**Perlu diputuskan:**

1. Setuju opsi C? Setuju
2. Default izin `use-ai-assistant`: aktif untuk `admin` **dan** `user` (seperti dokumen pondasi), atau `admin` saja dulu lalu dibuka manual? Lebih ke izin di berikan pada pengguna yang sudah terverfifikasi 

**Keputusan (dirangkum agent, 2026-09-30):**

- Opsi **C** disetujui.
- Asisten hanya untuk **user yang sudah diverifikasi admin**. Di project ini verifikasi = kolom

  `User.emailVerified` yang diubah admin lewat `/admin/users` (lihat temuan 7). Jadi syarat pakai asisten:

  sesi browser **+** `emailVerified === true` (dicek di server) **+** izin `use-ai-assistant`.
- Default `use-ai-assistant` tetap aktif untuk role `admin` dan `user` — karena syarat verifikasi sudah

  menyaring user yang belum terverifikasi, dan admin tetap bisa mematikannya per role.
- ✅ Dikonfirmasi user: rangkuman di atas sesuai ("Ikut t…" hanya salah ketik).

---

## Temuan 3 — Data sensitif yang harus disaring sebelum ke AI ✅

**Fakta.** Builder umumnya sudah bebas PII (ada komentar eksplisit di `src/types/wall.ts`), kecuali:


| Data                                   | Lokasi                                 | Kenapa sensitif                                                                                                    |
| -------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `musrenbang[].namaPengusul`            | `WallPengaduan` (`build-pengaduan.ts`) | Nama warga                                                                                                         |
| `cctv[].latitude/longitude` (+ `kode`) | `WallKeamanan` (`build-keamanan.ts`)   | Lokasi persis kamera keamanan                                                                                      |
| Cuplikan deskripsi pengaduan           | `search.ts` (`LEFT(description,150)`)  | Teks tulisan warga: bisa berisi nama/NIK/nomor HP, dan bisa berisi "perintah" terselubung ke AI (prompt injection) |
| `laporanPublik[].judul/lokasi`         | `WallKeamanan`                         | Teks laporan, mungkin menyebut orang                                                                               |


Catatan: sebagian data ini **tampil di dashboard** untuk user yang login. Pertanyaannya bukan "boleh dilihat

atau tidak", tapi "boleh dikirim ke layanan AI pihak ketiga (proxy) dan diulang AI dalam jawaban atau tidak".

**Opsi kebijakan.**


| Opsi | Isi                                                                                                                                                       |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A    | AI **tidak pernah** menerima nama orang, koordinat, atau teks bebas tulisan warga — hanya angka agregat, kategori, status, judul yang bukan tulisan warga |
| B    | Sama seperti dashboard: apa yang tampil di layar boleh dibaca AI                                                                                          |
| C    | Campuran: nama &amp; koordinat dibuang; teks warga boleh tapi dipotong pendek dan dibungkus penanda "data, bukan perintah"                                |


**Rekomendasi:** A untuk MVP (paling aman, cukup untuk pertanyaan ringkasan/statistik). Longgarkan

per kasus bila ada kebutuhan nyata.

**Perlu diputuskan:**

1. Opsi A, B, atau C?  Ikut rekomendasi anda Opsi A
2. Apakah ada data lain yang menurut Anda sensitif (mis. nama UMKM di BUMDes, nama posyandu)? Tidak ada, sebenarnya semua data ini memang di peruntukan bagi user yang sudah mendapat akses verifikasi

**Keputusan:** Opsi **A**. Selain empat jenis data di tabel, tidak ada data lain yang dianggap sensitif

(nama UMKM, posyandu, divisi, event, dsb. boleh dibaca AI) karena hanya user terverifikasi yang bisa memakai asisten.

---

## Temuan 4 — Izin `view-*` tidak dicek di API ✅ (di luar scope AI)

**Fakta.** `checkPermission()` tidak dipanggil di route API mana pun. Izin di `/admin/roles` hanya

menyembunyikan menu di sidebar (`src/components/sidebar.tsx`). User yang izinnya dicabut untuk,

misalnya, Keuangan masih bisa membuka `/api/keuangan` langsung (atau mengetik URL halamannya).

AI assistant tidak terpengaruh: izin ditegakkan di dalam tool.

**Opsi.**


| Opsi | Isi                                                                                                                                         |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| A    | Biarkan, cukup dicatat                                                                                                                      |
| B    | Kerjakan terpisah **setelah** pondasi AI, di branch `fix/api-permission-guard`: guard izin per route API + guard rute frontend, dengan test |
| C    | Kerjakan sekarang sebelum pondasi AI                                                                                                        |


**Rekomendasi:** B — penting, tapi bukan bagian AI; dipisah agar review tetap fokus.

**Perlu diputuskan:** A, B, atau C? Opsi B

**Keputusan:** Opsi **B** — branch terpisah `fix/api-permission-guard` setelah pondasi AI (lihat juga temuan 7).

---

## Temuan 5 — `.env.staging` ter-commit ✅ (di luar scope AI)

**Fakta (dicek, nilai tidak ditampilkan).**

- Disengaja: `.gitignore` baris 22–28 mengizinkan `.env.example` dan `.env.staging` sebagai template.
- Isi sekarang dan seluruh riwayat git-nya hanya **placeholder** (`your-…`, `change-…`, DB `localhost`).

  Tidak ada tanda secret asli pernah ter-commit.
- Tidak konsisten dengan dokumentasi: `PROJECT-STRUCTURE.md` baris 44 menulis "(tidak di-commit)".
- Catatan `MIND/SUMMARY/feat-jenna-api-integration.md` menyebut "tambah nilai aktual … token" — di git

  yang masuk ternyata placeholder, jadi aman.

**Opsi.**


| Opsi | Isi                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------- |
| A    | Tidak ada tindakan                                                                                |
| B    | Perbaiki keterangan di `PROJECT-STRUCTURE.md` saja                                                |
| C    | Ganti nama jadi `.env.staging.example` agar jelas template (sesuaikan `.gitignore` &amp; dokumen) |


**Rekomendasi:** B (kecil, menghilangkan kebingungan). Tidak perlu rotasi credential.

**Perlu diputuskan:** A, B, atau C? Opsi B

**Keputusan:** Opsi **B** — perbaiki keterangan di `PROJECT-STRUCTURE.md` (commit `docs` terpisah, bukan bagian branch AI).

---

## Temuan 6 — Temuan kecil lainnya ✅


| #   | Temuan                                                                                                                                                                                              | Usulan                                                                                                       | Perlu keputusan?                                       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| 6a  | File melebihi batas ukuran (`help-page.tsx` 1081, `demografi-pekerjaan.tsx` 1172, `admin/preferences.tsx` 1373, `admin/settings.tsx` 738, `admin/help.tsx` 726, `pengaduan-layanan-publik.tsx` 553) | Kode AI di file baru. `help-page`/`admin/help` mengecil saat chat dipindah (fitur 1). Sisanya tidak disentuh | Tidak — kecuali Anda ingin refactor terpisah           |
| 6b  | Kode mati: tombol "Bantuan" melayang dalam komentar di `main-layout.tsx`                                                                                                                            | Dihapus saat FAB dipasang                                                                                    | Tidak                                                  |
| 6c  | Nama "Jenna" sudah dipakai chatbot desa-platform (halaman "Jenna Analytic", `/api/jenna/analytics`)                                                                                                 | Kode memakai istilah `assistant`; "Jenna" hanya nama tampilan default                                        | Tidak                                                  |
| 6d  | Env `VITE_JENNA_API_TOKEN` berprefix `VITE_` padahal hanya dipakai server                                                                                                                           | Kunci LLM baru tanpa `VITE_`. Mengganti nama env lama = di luar scope                                        | Ya, bila ingin diganti nama (butuh ubah env Portainer) |
| 6e  | `tests/api/database.test.ts` membaca **DB dev** (read-only) dan punya fallback email asli hardcoded                                                                                                 | Pindahkan ke `TEST_DATABASE_URL` saat setup test DB pondasi; ganti email dengan nilai test                   | Ya                                                     |
| 6f  | `bun run verify` menjalankan `biome check --write` (mengubah file), padahal `CLAUDE.md` menyebutnya "lint error-only"                                                                               | Samakan: ubah script atau keterangan `CLAUDE.md`                                                             | Ya                                                     |


**Status:** 6a, 6b, 6c tidak perlu keputusan (usulan berlaku). 6d, 6e, 6f dijawab di bawah.

**6d: Kenapa harus di ganti? Di biarkan saja kan tidak mengganggu? Kita menggunakan DB kan**

**6e: Jika memang alur normal nya seperti itu maka saya ikuti**  
**6f: ya**

**Keputusan (dirangkum agent):**
- **6d — dibiarkan.** Benar, tidak mengganggu: kunci AI disimpan di DB (bukan env), dan `bun build
  --env='VITE_*'` hanya menyisipkan variabel yang benar-benar dirujuk kode frontend — hari ini
  `VITE_JENNA_API_TOKEN` hanya dibaca di server. Satu-satunya aturan yang dipegang: jangan pernah
  merujuk variabel itu dari kode frontend, dan env baru untuk rahasia tidak diberi prefix `VITE_`.
- **6e — diikuti.** Saat setup `TEST_DATABASE_URL` di pondasi, `database.test.ts` dipindah ke database test
  dan fallback email asli diganti nilai test.
- **6f — disamakan.** Usulan agent: ubah **keterangan di `CLAUDE.md`** (verify = auto-fix format/lint
  + semua test), bukan mengubah script — karena mengganti ke mode read-only bisa membuat `verify` gagal
  di tempat yang sekarang diperbaiki otomatis. Dikerjakan sebagai commit `docs` kecil terpisah.
  (Bila Anda lebih suka script-nya yang diubah jadi read-only, sampaikan.)

---

## Temuan 7 — Verifikasi admin (`emailVerified`) tidak dicek di API ✅ (baru)

> Koreksi: sebelumnya agent menulis "tidak ada status verifikasi di project ini". Itu keliru — status verifikasi ada,
>
> hanya namanya `emailVerified`.

**Fakta.**

- `src/utils/auth.ts` (`databaseHooks.user.create.before`): setiap user baru selain `ADMIN_EMAIL` dibuat

  dengan `emailVerified: false` — komentar kode: *"Non-admin users require admin verification"*.
- Admin memverifikasi lewat `/admin/users` → `POST /api/admin/users/verify` (label "Terverifikasi"/"Belum").
- Frontend menahan user yang belum terverifikasi: `signin.tsx` langsung `signOut()` + modal "menunggu verifikasi";

  `authMiddleware.tsx` mengarahkan ke `/signin` bila `emailVerified === false`.
- **Tetapi `apiMiddleware.tsx` tidak memeriksa `emailVerified`.** Ia hanya membedakan ada/tidaknya user.

  Artinya user yang belum terverifikasi masih bisa memanggil API langsung (mis. login lewat

  `POST /api/auth/sign-in/email`, lalu memakai cookie sesi untuk `GET /api/keuangan` dst.), karena

  sesi tetap dibuat sebelum frontend memanggil `signOut()`.
- Nilai `null` (user lama sebelum hook ini ada) lolos di frontend karena cek memakai `=== false`.

**Dampak ke AI:** pondasi akan memeriksa `emailVerified === true` **di server** untuk semua

`/api/assistant/*` (sesuai keputusan temuan 2), jadi asisten aman terlepas dari celah ini.

**Opsi untuk celah di API (di luar scope AI):**


| Opsi | Isi                                                                                                                                                                                                                                  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A    | Tangani bersama temuan 4 di branch `fix/api-permission-guard` (setelah pondasi AI)                                                                                                                                                   |
| B    | Branch sendiri `fix/api-require-verified-user` **sebelum** pondasi AI — perubahannya kecil (satu cek di `apiMiddleware` + pengecualian untuk `/api/session`, `/api/auth/*`, dan halaman profil) tapi dampaknya luas, jadi butuh test |
| C    | Biarkan                                                                                                                                                                                                                              |


**Rekomendasi:** B — ini celah akses data yang nyata dan lebih serius dari temuan 4 (user yang belum

diverifikasi sama sekali vs. user terverifikasi yang melihat modul di luar izinnya).

**Perlu diputuskan:**

1. A, B, atau C? Opsi B
2. User lama dengan `emailVerified = null`: dianggap **belum** terverifikasi (ketat, saran) atau sudah?

**Keputusan:** Opsi **B** — branch `fix/api-require-verified-user` **sebelum** pondasi AI.

**Nilai `null` — diputuskan (user setuju usulan agent):** `null` dianggap **belum terverifikasi**
(cek server memakai `emailVerified === true`). Data pendukung: DB dev lokal berisi 5 user, semuanya
`true`. Pengaman wajib sebelum fix di-merge/deploy: jalankan query hitung (read-only) di staging/produksi;
bila ada user `null`, admin memverifikasi mereka dulu di `/admin/users` agar tidak ada yang tiba-tiba terkunci.

---

## Temuan 8 — Role (dan izin) user dibaca dari cookie cache sesi, bisa basi hingga 30 hari ⏳ (baru, ditemukan sesi 59 saat P3)

**Fakta (dicek sesi 59 dengan test, dikonfirmasi sesi induk di kode).**
- `src/utils/auth.ts:101-104`: Better Auth `cookieCache` aktif dengan `maxAge` **30 hari**.
- `apiMiddleware` mengambil `role` dari `session.user.role` (isi cookie cache), bukan dari DB. Test sesi 59
  membuktikan role yang diubah di DB tidak terlihat lewat sesi lama.
- Akibatnya, di luar AI assistant (`admin.ts`, `my-permissions`, guard `role === "admin"` lain), **penurunan role
  oleh admin baru berlaku setelah cookie cache kedaluwarsa** (maks 30 hari) atau user login ulang.
- P-1 sudah membaca `emailVerified` dari DB (pencabutan verifikasi langsung berlaku). P3 membaca role dari DB
  khusus untuk endpoint asisten (`src/api/assistant/http/access.ts`).

**Usulan:** `apiMiddleware` memakai `role` dari query `findUnique` yang sudah ada (±1 baris, tanpa query tambahan),
digabung ke branch `fix/api-permission-guard` (temuan 4) karena sama-sama soal penegakan izin.

**Perlu diputuskan:** digabung ke `fix/api-permission-guard`, dikerjakan terpisah lebih cepat, atau dibiarkan?
