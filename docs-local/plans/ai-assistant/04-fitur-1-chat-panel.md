# 04 — Fitur 1: Tombol melayang (FAB) + panel "Tanya AI"

> **Status: DISETUJUI user (2026-10-01)** setelah revisi `/wall` (§1, §9 no. 7). Dibahas di sesi 59, dicatat sesi induk 0d.
> Acuan UI: Meta AI business assistant (tombol bulat kanan bawah → panel samping).
> Cakupan: **baca-saja** terhadap data dashboard. Menghapus/mengganti judul percakapan milik
> sendiri tidak termasuk "aksi tulis" (itu data chat user, bukan data desa).

## 1. Posisi & kapan tombol muncul

- Dipasang **sekali** di `src/components/layout/main-layout.tsx`, kanan bawah
  (sesuai screenshot di `keputusan.md`). Di file itu masih ada blok komentar tombol "Bantuan" melayang
  (posisi `bottom: 24, right: 24`) — kode mati ini dihapus dan digantikan FAB.
- `MainLayout` **tidak** dipakai di `/signin`, `/signup`, `/admin/*`, `/profile/*`, `/wall`
  (lihat `isPublicRoute` di `src/routes/__root.tsx`). FAB dipasang juga di layout `/profile`
  dan di `WallPage` (`/wall`) — keputusan §9. `/admin/*`, `/signin`, `/signup` tetap tanpa FAB.
- **`/wall` (kiosk NOC):** rute tetap publik tanpa login seperti sekarang. FAB hanya muncul bila browser
  kiosk **login dengan akun khusus** (mis. "NOC") yang terverifikasi admin dan punya izin
  `use-ai-assistant` — aturan pondasi #2/#11 tidak berubah. Tanpa login, wall berjalan tanpa AI.
  Kode `?key=` / `WALL_ACCESS_TOKEN` **tidak** dipakai untuk AI. Di wall, FAB memanggil
  `/api/assistant/status` hanya bila ada sesi (hindari 401 berulang di TV). Bentuk panel di wall dirancang
  saat implementasi agar tidak menutupi panel NOC; input yang paling cocok untuk TV adalah suara (Fitur 3).
- Tombol tampil hanya jika `GET /api/assistant/status` → `enabled && slots.chat` **dan** user punya
  izin `use-ai-assistant` (dari `permissionStore` yang sudah diisi `main-layout`).

## 2. Komponen

| Elemen | Komponen | Catatan |
|---|---|---|
| Tombol bulat | `AssistantFab` | `aria-label`, tooltip nama asisten, `z-index` di atas konten tapi di bawah modal Mantine |
| Panel samping | `AssistantPanel` (Mantine `Drawer` kanan) — *catatan silang Fitur 2 (05 §4, keputusan P6): saat menunjuk dalam mode layar penuh/perbesar, panel ditutup sementara dan muncul tombol "Kembali ke chat"; state percakapan harus tetap utuh (jangan di-unmount/di-reset)* | Mode perbesar = lebar penuh; mobile = layar penuh; `Esc` menutup, fokus kembali ke FAB. Dimuat **lazy** |
| Header | `AssistantHeader` | Logo, nama dari config, badge "Beta", tombol ☰ / perbesar / tutup |
| Daftar percakapan (☰) | `AssistantConversationList` | Dari DB, **berhalaman** (20 per halaman), tombol "Percakapan baru", hapus |
| Pesan | `AssistantMessageList` (`aria-live="polite"`) | Bubble user/asisten, indikator "memeriksa data…", label kecil "Sumber: Keuangan" dari `toolsUsed` |
| Saran pertanyaan | `AssistantSuggestions` | Bergantung halaman aktif (§5) |
| Input | `AssistantComposer` (`Textarea` autosize) | Enter kirim, Shift+Enter baris baru, penghitung sisa karakter (`maxInputChars`) |
| "Add file" | **Tunda** | Butuh penyimpanan & parser file |
| Tombol mikrofon | **Slot kosong** untuk fitur 3 | Tidak dirender di MVP |

State: Valtio `src/store/assistant.ts` (panel terbuka, percakapan aktif). Data server lewat
TanStack Query (pola `useApiQuery` yang sudah ada). Tema terang/gelap memakai `useIsDark`.

## 3. Endpoint percakapan

```
POST   /api/assistant/chat
       body: { conversationId?: string, message: string,
               pageContext?: { route: string, title?: string, lang?: "id" | "en" } }
       200:  { conversationId, message: { id, role: "assistant", content, toolsUsed, createdAt },
               actions: UiAction[] }            // selalu [] di MVP; dipakai fitur 2
       401 tanpa sesi · 403 tanpa use-ai-assistant · 409 asisten mati/slot chat belum siap
       422 input terlalu panjang · 429 rate/kuota · 503 layanan AI tidak tersedia

GET    /api/assistant/conversations?cursor=&limit=20      daftar milik user (berhalaman)
GET    /api/assistant/conversations/:id/messages?cursor=&limit=50
DELETE /api/assistant/conversations/:id                    hapus milik sendiri
PATCH  /api/assistant/conversations/:id  { title }         ganti judul (opsional)
```

- Riwayat **tidak** dikirim klien — server memuat `historyWindow` pesan terakhir dari DB.
- Semua query difilter `userId` dari sesi; id milik user lain → 404 (bukan 403, agar tidak bocor).
- Tahap berikut (masih fitur 1): varian SSE `POST /api/assistant/chat/stream` dengan event
  `status` ("memeriksa data keuangan…"), `delta` (teks iterasi terakhir), `done`.

## 4. Tool awal (baca-saja)

Semua tool membungkus fungsi server yang sudah ada; nama & deskripsi dalam bahasa Indonesia.
Kebijakan data mengikuti `discus/temuan.md` temuan 3 (opsi A): tanpa nama orang, koordinat, atau teks bebas tulisan warga.

| Tool | Sumber | Izin | Catatan data |
|---|---|---|---|
| `ringkasan_beranda` | `buildKpi` + `buildBeranda` | `view-dashboard` | KPI utama, divisi aktif, kalender |
| `ringkasan_keuangan({ tahun? })` | `fetchApbdesEntriesRaw` + `mapKeuanganList` (sumber yang sama dengan `buildKeuangan`) | `view-keuangan` | Tanpa `tahun` = terbaru; hasil menyertakan daftar tahun tersedia (keputusan temuan 1) |
| `statistik_pengaduan` | `buildPengaduan` | `view-pengaduan` | Angka, tren, jenis surat, status. Buang `musrenbang[].namaPengusul` & teks tulisan warga |
| `statistik_demografi` | `buildDemografi` | `view-demografi` | Agregat saja (per banjar, umur, agama, pekerjaan) |
| `kinerja_divisi` | `buildDivisi` | `view-kinerja-divisi` | |
| `lookup_faq` | tabel `Faq` (`isPublished`) full-text | `use-ai-assistant` | "RAG murah" tanpa pgvector |
| `ringkasan_sosial` | `buildSosial` | `view-sosial` | Tahap 2 |
| `ringkasan_keamanan` | `buildKeamanan` | `view-keamanan` | Tahap 2; jumlah CCTV online/offline & jumlah laporan per status. Buang koordinat/kode CCTV dan judul/lokasi laporan warga |
| `ringkasan_bumdes` | `buildBumdes` | `view-bumdes` | Tahap 2 |
| `analitik_chatbot` | `buildJenna` | `view-jenna-analytic` | Tahap 2 |
| `cari_data` | fungsi pencarian di `src/api/search.ts` (perlu di-export) | per modul: pengaduan→`view-pengaduan`, kegiatan/dokumen→`view-kinerja-divisi` | Tahap 2; hanya judul kegiatan/dokumen, modul, status, tautan. **Tanpa** cuplikan deskripsi pengaduan (teks warga) |

Parameter tahun: **keuangan sudah bisa** tanpa mengubah builder (data APBDes sudah multi-tahun, lihat
`discus/temuan.md` temuan 1). Modul lain dicek per tool apakah sumbernya punya data multi-tahun.

## 5. Konteks halaman & saran pertanyaan

`pageContext.route` dikirim klien → masuk lapisan 4 prompt (hanya petunjuk, bukan otorisasi).
Saran pertanyaan per rute disimpan di kode (dipetakan dari daftar menu `sidebar.tsx`) dan hanya
ditampilkan jika user punya izin modul tersebut:

| Rute | Contoh saran |
|---|---|
| `/` | "Ringkas kondisi desa hari ini" · "Ada berapa pengaduan aktif?" |
| `/keuangan-anggaran` | "Berapa persen realisasi APBDes tahun ini?" · "Sektor dengan alokasi terbesar?" |
| `/pengaduan-layanan-publik` | "Jenis surat apa yang paling banyak diajukan?" · "Tren pengaduan 7 bulan terakhir" |
| `/demografi-pekerjaan` | "Banjar dengan penduduk terbanyak?" · "Pekerjaan paling umum warga?" |
| `/kinerja-divisi` | "Divisi mana yang paling aktif?" |
| `/bantuan` | "Bagaimana cara mengekspor data?" (→ `lookup_faq`) |

## 6. Bahasa

UI project punya id/en (`src/locales`). Bahasa jawaban mengikuti `pageContext.lang`. Sapaan pembuka
saat ini hardcode "Halo! Saya Jenna…" di `locales/id.ts` & `admin/help.tsx` → diganti template
dengan nama dari config.

## 7. Halaman Bantuan

`/bantuan` (`help-page.tsx`, 1081 baris) dan `/admin/help` (726 baris) masing-masing punya salinan
logika chat yang memanggil stub `POST /api/jenna/chat`. Rencana:
1. Kedua halaman memakai komponen panel yang sama (mode tertanam), bukan salinan sendiri.
2. Stub `/api/jenna/chat` dan kontraknya (`history[{id,text,sender}]`) dihapus setelah keduanya pindah.
3. Efek samping baik: kedua file mengecil mendekati batas ukuran.

## 8. Definisi selesai (MVP fitur 1)

- User `user` & `admin` bisa bertanya dari semua halaman `MainLayout`; jawaban berdasarkan data nyata.
- User tanpa izin modul mendapat penjelasan "tidak punya akses", bukan angka.
- Riwayat tersimpan, bisa dibuka lagi & dihapus; daftar berhalaman.
- Batas & kuota bekerja sesuai pengaturan admin.
- Test: auth-guard 401, izin per tool, penghapusan field PII, kontrak endpoint, `MockProvider` end-to-end.
- `bun run verify` hijau.

## 9. Status pertanyaan fitur 1

| # | Pertanyaan | Status |
|---|---|---|
| 1 | FAB di `/admin` & `/profile`? (lihat juga no. 7 untuk `/wall`) | **Diputuskan:** `/profile` **ya**, hanya untuk user terverifikasi (otomatis, karena FAB membaca `/api/assistant/status`). `/admin` **tidak** diberi FAB; admin mendapat asisten lewat halaman `/admin/help` yang memakai komponen panel yang sama (tahap F1-d). `/profile` punya layout sendiri (`src/routes/profile/route.tsx`), jadi FAB dipasang juga di sana — komponennya sama |
| 2 | Tool MVP cukup? | **Diputuskan: cukup** (6 teratas di §4) |
| 3 | Tombol salin / 👍👎? | **Diputuskan:** tombol **salin ya**; 👍👎 **ditunda** (butuh kolom DB + tampilan admin) |
| 4 | Disclaimer? | **Diputuskan: ditampilkan** — satu baris kecil di bawah kotak input (teks dari `jennaDisclaimer`, nama asisten dari config) |
| 5 | Penundaan 👍👎, unggah file ("Add file"), dan tombol mikrofon | **Dikonfirmasi user** (sesi 59, 2026-10-01) |
| 6 | AI mengetahui halaman yang sedang dibuka (`pageContext`) | **Dikonfirmasi & ditegaskan user** (sesi 59, 2026-10-01) — §5 tetap |
| 7 | **Revisi user: FAB juga di `/wall`** (tampilan NOC sungguhan) | **Diputuskan (opsi a):** `/wall` tetap publik; FAB hanya bila kiosk login akun khusus terverifikasi + izin (lihat §1). Pondasi tidak berubah |
| 8 | Kenapa tool versi pertama 6, padahal menu 9 | **Diputuskan: tetap 6.** Sosial, Keamanan, BUMDes, Jenna Analytic ada di tahap 2: data keamanan/sosial memuat nama, lokasi, koordinat, dan teks laporan warga yang harus disaring dulu (`build-keamanan.ts`, `build-sosial.ts`); BUMDes & Jenna Analytic dari API luar yang bisa kosong |
