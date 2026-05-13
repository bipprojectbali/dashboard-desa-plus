# Plan: Fungsionalkan Halaman Pengaturan Notifikasi

## Analisa Kondisi Saat Ini

### Yang Sudah Berfungsi ✅
- UI semua switch sudah tampil dan bisa di-toggle
- `GET /api/notification-preferences` — load prefs dari DB per user
- `PUT /api/notification-preferences` — simpan prefs ke DB
- Skeleton loading, toast sukses/error, tombol Batal sudah bekerja
- Schema Prisma `NotificationPreference` lengkap 11 field

### Yang TIDAK Berfungsi ❌

Semua 11 switch hanya **menyimpan nilai ke database** tapi tidak ada implementasi nyata di baliknya. Setting disimpan tapi tidak dipakai di mana pun:

| Switch | Kategori | Masalah |
|---|---|---|
| `laporanHarian` | Email | Tidak ada email service, tidak ada scheduler |
| `alertSistem` | Email | Tidak ada email service |
| `updateKeamanan` | Email | Tidak ada email service |
| `newsletterBulan` | Email | Tidak ada email service |
| `alertKritis` | Browser Push | Tidak ada Web Push API implementation |
| `aktivitasTim` | Browser Push | Tidak ada Web Push API implementation |
| `komentarMention` | Browser Push | Tidak ada Web Push API implementation |
| `bunyiNotifikasi` | Browser Audio | Audio tidak pernah diputar saat ada notifikasi masuk |
| `tresholdMemori` | Server Monitor | Tidak ada monitoring loop, tidak ada alert trigger |
| `tresholdCpu` | Server Monitor | Tidak ada monitoring loop, tidak ada alert trigger |
| `tresholdDisk` | Server Monitor | Tidak ada monitoring loop, tidak ada alert trigger |

---

## Scope Implementasi (Realistis untuk Dashboard Desa)

Prioritaskan yang bisa diimplementasikan **tanpa dependency eksternal baru**:

### Priority 1 — Browser Notification (Web Push API bawaan browser)
Untuk `alertKritis`, `aktivitasTim`, `komentarMention`:
- Minta permission `Notification` dari browser saat switch diaktifkan
- Simpan preference di `i18nStore` / localStorage agar tersedia di seluruh app
- Trigger `new Notification(...)` dari event sistem yang sudah ada (misal: saat fetch data baru atau ada perubahan status)

### Priority 2 — Bunyi Notifikasi
Untuk `bunyiNotifikasi`:
- Putar audio pendek (`AudioContext` atau `<audio>`) saat browser notification tampil
- Respek setting `bunyiNotifikasi` dari store

### Priority 3 — Threshold Alert (Server Resource Monitor)
Untuk `tresholdMemori`, `tresholdCpu`, `tresholdDisk`:
- Buat endpoint `GET /api/system/stats` yang return CPU/RAM/disk usage via Bun API
- Di frontend, polling tiap 60 detik, bandingkan dengan threshold (80% RAM, 90% CPU, 10% disk sisa)
- Trigger browser notification jika threshold terlampaui dan setting aktif

### Priority 4 — Email Notifikasi (Opsional, butuh setup SMTP)
Untuk `laporanHarian`, `alertSistem`, `updateKeamanan`, `newsletterBulan`:
- Perlu dependency `nodemailer` atau service Resend/Mailgun
- Di luar scope MVP — tandai sebagai "coming soon" di UI atau skip dulu

---

## Arsitektur Implementasi

```
src/
├── hooks/
│   └── useNotification.ts        # Hook: request permission, trigger notif, play sound
├── api/
│   └── system-stats.ts           # GET /api/system/stats (CPU/RAM/disk)
└── components/
    └── pengaturan/
        └── notifikasi.tsx        # Tambah: permission request button + status indicator
```

### Store Extension
Tambah `notifikasiPrefs` ke `i18nStore` (atau store terpisah) agar preference bisa diakses dari hook manapun tanpa fetch ulang.

---

## Task Breakdown

1. **Buat `useNotification` hook** — enkapsulasi Web Push permission, `new Notification()`, dan audio playback
2. **Sync prefs ke store** — setelah load/save, sync ke Valtio store agar hook bisa baca tanpa fetch
3. **Tambah permission UI di notifikasi.tsx** — tombol "Aktifkan Notifikasi Browser" + indikator status permission
4. **Buat `GET /api/system/stats`** — endpoint Bun untuk CPU/RAM/disk
5. **Implementasi threshold monitor** — polling di frontend, trigger notif jika melewati batas
6. **Tandai email features sebagai "Coming Soon"** — badge UI, disable switch, tooltip penjelasan
