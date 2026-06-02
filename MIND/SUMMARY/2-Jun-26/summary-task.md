# Summary Task — 2 Juni 2026

## Fitur: Kontak Dukungan & Shortcut Bantuan

### Deskripsi
Menambahkan section **Kontak Dukungan** di halaman `/bantuan` beserta tombol shortcut `? Bantuan` yang muncul di setiap halaman.

---

### Perubahan yang Dilakukan

#### 1. `resend` package (baru)
- Install via `bun add resend`
- Digunakan untuk pengiriman email tiket ke admin

#### 2. `src/utils/mailer.ts` (baru)
- Utility `sendSupportTicketEmail()` menggunakan Resend API
- Mendukung attachment screenshot (base64)
- Template HTML email yang informatif

#### 3. `src/config/support.ts` (diupdate)
- Tambah field `jamOperasional: "Senin – Jumat, 08.00 – 16.00 WITA"`
- Tambah field `adminEmail` dari `process.env.ADMIN_EMAIL`

#### 4. `src/api/bantuan.ts` (diupdate)
- Tambah endpoint `POST /api/bantuan/kirim-tiket`
- Validasi input: nama, email (format email), kategori (enum), deskripsi (min 10 char)
- Validasi kategori server-side dengan whitelist
- Kirim email via `sendSupportTicketEmail()`

#### 5. `src/locales/id.ts` & `src/locales/en.ts` (diupdate)
- Tambah 13 key baru untuk section Kontak Dukungan:
  - `kontakDukungan`, `formNama`, `formEmail`, `formKategori`
  - `formDeskripsi`, `formScreenshot`, `formScreenshotHint`
  - `kirimTiket`, `tiketTerkirim`, `tiketGagal`
  - `infoKontak`, `jamOperasionalLabel`, `bantuanShortcut`

#### 6. `src/components/help-page.tsx` (diupdate)
- Tambah section **Kontak Dukungan** (HelpCard, 8/12 col) berisi:
  - Info kontak desa: WhatsApp, Email, Jam Operasional, Waktu Respon
  - Form tiket: Nama, Email, Kategori (Select), Deskripsi (Textarea)
  - Upload screenshot opsional (maks 2MB, PNG/JPG) dengan FileButton
  - Alert sukses/error setelah submit
- Hapus card "Hubungi Support" lama (digabung ke Kontak Dukungan)
- Refactor card Dokumentasi ke col 4/12

#### 7. `src/components/layout/main-layout.tsx` (diupdate)
- Tambah floating button `? Bantuan` di pojok kanan bawah setiap halaman
- Link ke `/bantuan`, hover effect (lift + shadow)
- Menggunakan i18n key `t.help.bantuanShortcut`

---

### Env Variables yang Dibutuhkan
| Variable | Keterangan | Default |
|---|---|---|
| `RESEND_API_KEY` | API key Resend untuk kirim email | – (wajib di prod) |
| `MAILER_FROM` | Sender email | `Dashboard Desa <noreply@wibudev.com>` |
| `ADMIN_EMAIL` | Tujuan email tiket | `admin@darmasaba.desa.id` |

---

### Kategori Tiket yang Tersedia
- Akses & Login
- Data & Sinkronisasi
- Fitur & Navigasi
- Laporan & Ekspor
- Lainnya
