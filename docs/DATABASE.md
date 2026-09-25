# Database

**Engine:** PostgreSQL
**ORM:** Prisma v6 dengan adapter `@prisma/adapter-pg`
**Schema:** `prisma/schema.prisma`

---

## Koneksi

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Staging: `postgresql://bip:...@localhost:5433/dashboard-desa-darmasaba-noc-v0.0.1`

---

## Models

### Auth & User

#### `User`
Pengguna aplikasi. Field `role` menentukan akses (`"admin"` / `"user"`).
```
id, email, name, emailVerified, image, role, createdAt, updatedAt
```

#### `Session`
Sesi login Better Auth.
```
id, userId, token, expiresAt, ipAddress, userAgent, createdAt, updatedAt
```

#### `Account`
OAuth provider accounts (GitHub, Google).
```
id, userId, accountId, providerId, accessToken, refreshToken, password, idToken,
accessTokenExpiresAt, refreshTokenExpiresAt, scope, createdAt, updatedAt
```

#### `Verification`
Token verifikasi Better Auth (email verification, reset password, dll).
```
id, identifier, value, expiresAt, createdAt, updatedAt
```

#### `ApiKey`
API keys untuk integrasi eksternal.
```
id, name, key, userId, isActive, expiresAt, createdAt, updatedAt
```

#### `Invitation`
Undangan user baru (admin mengundang via email + role, token dipakai saat signup).
```
id, token, email, role, invitedById, expiresAt, usedAt, createdAt
```

---

### Preferences & Settings

Empat model 1-ke-1 dengan `User` (`@unique userId`) — backing store untuk halaman `/pengaturan/*`.

#### `NotificationPreference`
Preferensi notifikasi (`/pengaturan/notifikasi`).
```
id, userId, laporanHarian, alertSistem, updateKeamanan, newsletterBulan,
alertKritis, aktivitasTim, komentarMention, bunyiNotifikasi,
tresholdMemori, tresholdCpu, tresholdDisk, createdAt, updatedAt
```

#### `UmumPreference`
Preferensi umum (`/pengaturan/umum`) — bahasa, zona waktu, format tanggal, refresh dashboard.
```
id, userId, bahasa, zonaWaktu, formatTanggal, refreshOtomatis,
intervalRefresh, tampilkanGrid, animasiTransisi, createdAt, updatedAt
```

#### `KeamananPreference`
Preferensi keamanan akun (`/pengaturan/keamanan`) — 2FA, biometrik, IP whitelist toggle, log aktivitas.
```
id, userId, twoFactorAuth, biometrikLogin, ipWhitelist, logAktivitas,
createdAt, updatedAt
```

#### `AksesPreference`
Preferensi akses & tim (`/pengaturan/akses-dan-tim`).
```
id, userId, izinExportData, requireApprovalPerubahan, createdAt, updatedAt
```

---

### Keamanan & Audit

#### `IpWhitelistEntry`
Daftar IP yang diizinkan per user (dipakai jika `KeamananPreference.ipWhitelist = true`).
```
id, userId, ip, label, createdAt
```

#### `ActivityLog`
Log aktivitas user (login, aksi CRUD, dll) — dicatat via Better Auth `databaseHooks` dan middleware.
```
id, userId, action, detail, ipAddress, userAgent, createdAt
```

#### `RolePermission`
Matrix permission per role x feature (dipakai halaman admin Role & Permission).
```
id, role, feature, allowed, createdAt, updatedAt
```
`@@unique([role, feature])`

---

### Kinerja Divisi

#### `Division`
Unit/divisi desa. `externalId` & `villageId` untuk sinkronisasi dengan NOC.
```
id, externalId, villageId, name, description, color, isActive,
externalActivityCount, lastSyncedAt, createdAt, updatedAt
```

#### `Activity`
Kegiatan dalam divisi. Status: `BERJALAN | SELESAI | DITUNDA | DIBATALKAN`.
```
id, externalId, villageId, title, description, divisionId,
startDate, endDate, dueDate, progress (0-100), status, priority,
assignedTo, completedAt, createdAt, updatedAt
```

#### `Document`
Dokumen/file. Category: `LAPORAN | FOTO | VIDEO | LAINNYA`.
```
id, externalId, villageId, title, category, type, fileUrl, fileSize,
divisionId, uploadedBy, createdAt, updatedAt
```

#### `DocumentStat`
Statistik dokumen per village (snapshot untuk chart).
```
id, villageId, label, value, color, createdAt, updatedAt
```

#### `Discussion`
Diskusi/komentar dalam divisi. Mendukung threaded replies via `parentId`.
```
id, externalId, villageId, message, senderId, parentId, divisionId,
isResolved, createdAt, updatedAt
```

#### `Event`
Jadwal kegiatan/acara. Type: `MEETING | TRAINING | CEREMONY | OTHER | dll`.
```
id, externalId, villageId, title, description, eventType,
startDate, endDate, location, isAllDay, isRecurring, createdBy, createdAt, updatedAt
```

#### `DivisionMetric`
Metrik performa divisi per periode.
```
id, divisionId, period, activityCount, completionRate, avgProgress,
createdAt, updatedAt
```

---

### Layanan Publik

#### `Complaint`
Pengaduan masyarakat. Status: `BARU | SEDANG_DIPROSES | SELESAI | DITOLAK`.
```
id, complaintNumber, title, description, category, status, priority,
reporterId, reporterPhone, reporterEmail, isAnonymous,
assignedTo, resolvedBy, resolvedAt, location, imageUrl[], createdAt, updatedAt
```

#### `ComplaintUpdate`
Riwayat perubahan status pengaduan.
```
id, complaintId, message, status, updatedBy, createdAt
```

#### `ServiceLetter`
Surat layanan desa. Type: `KETERANGAN_DOMISILI | KETERANGAN_USAHA | dll`.
```
id, letterNumber, letterType, applicantName, applicantNik, applicantAddress,
purpose, status, processedBy, completedAt, createdAt, updatedAt
```

> **Catatan Fase 2:** Data pengaduan & surat "live" (dari sistem eksternal) diambil via `platformExternalClient` (`PLATFORM_API_URL`) — lihat `src/api/complaint-platform.ts` untuk helper transform, bukan tabel database terpisah.

#### `InnovationIdea`
Ide inovasi yang disubmit warga. Status: `DRAFT | SUBMITTED | APPROVED | REJECTED`.
```
id, title, description, category, submitterName, submitterContact,
status, reviewedBy, reviewedAt, notes, createdAt, updatedAt
```

---

### Demografi

#### `Resident`
Data penduduk (KTP). Linked ke `Banjar`.
```
id, nik, kk, name, birthDate, birthPlace, gender, religion,
maritalStatus, education, occupation, banjarId, rt, rw, address,
isHeadOfHousehold, isPoor, isStunting, deathDate, moveInDate, moveOutDate,
createdAt, updatedAt
```

#### `Banjar`
Subdivisi administratif desa.
```
id, name, code, description, totalPopulation, totalKK, totalPoor,
createdAt, updatedAt
```

#### `HealthRecord`
Catatan kesehatan penduduk.
```
id, residentId, recordedBy, type, notes, createdAt
```

#### `EmploymentRecord`
Riwayat pekerjaan penduduk.
```
id, residentId, companyName, position, startDate, endDate, isActive, createdAt
```

#### `PopulationDynamic`
Dinamika kependudukan (kelahiran, kematian, pindah).
```
id, documentedBy, type, residentName, eventDate, description, createdAt
```

#### `Posyandu`
Data posyandu.
```
id, coordinatorId, name, location, schedule, type, createdAt, updatedAt
```

---

### Keuangan & Ekonomi

#### `Budget`
Anggaran per kategori dan tahun fiskal.
```
id, category, amount, percentage, color, fiscalYear, createdAt, updatedAt
```

#### `BudgetTransaction`
Transaksi keuangan.
```
id, transactionNumber, type, category, amount, description, date,
createdBy, createdAt
```

#### `Umkm`
Data UMKM lokal. Linked ke `Banjar`.
```
id, banjarId, name, owner, productType, description, createdAt, updatedAt
```

> **Catatan:** Data UMKM detail (produk, penjualan, kategori) dikelola di Desa Website API (`/api/ekonomi/umkm/*`), bukan di database lokal ini.

---

### Video Wall

#### `WallLayout`
Konfigurasi layout kiosk `/wall` — **singleton** (id fixed `"singleton"`, bukan cuid, karena satu baris untuk seluruh instance). Di-set admin lewat drag-resize UI (`@dnd-kit`), dibaca publik oleh TV kiosk. Tidak ada relasi `User` karena bukan per-user.
```
id ("singleton"), order (String[] — urutan widget id),
sizes (Json? — override ukuran per widget: { [widgetId]: { w, h } }, nullable & partial),
updatedAt, updatedBy (userId editor terakhir, nullable)
```

---

### Lain-lain

#### `SdgsScore`
Skor SDGs (Sustainable Development Goals).
```
id, title, score, image, createdAt, updatedAt
```

#### `SatisfactionRating`
Hasil survei kepuasan layanan.
```
id, category, value, color, createdAt, updatedAt
```

#### `SecurityReport`
Laporan keamanan/insiden.
```
id, reportNumber, title, description, location, reportedBy, assignedTo,
status, createdAt, updatedAt
```

#### `SyncLog`
Riwayat sinkronisasi dari NOC system (halaman `/pengaturan/sinkronisasi`).
```
id, type, status, triggeredBy (default "scheduled"), durationMs,
recordsAffected, errorMessage, startedAt
```

#### `Faq`
Manajemen FAQ dengan drag-and-drop reorder (admin panel).
```
id, question, answer, category (default "Umum"), order, isPublished,
createdAt, updatedAt
```

---

## Migrations

```bash
# Buat migration baru setelah edit schema.prisma
bunx prisma migrate dev --name <nama-migration>

# Apply migrations tanpa generate (production)
bunx prisma migrate deploy

# Reset database (dev only!)
bunx prisma migrate reset
```

## Seeding

```bash
bun run seed           # Semua data
bun run seed:auth      # Admin user saja
bun run seed:demographics
bun run seed:divisions
bun run seed:services
bun run seed:documents
bun run seed:dashboard
bun run seed:phase2
```
