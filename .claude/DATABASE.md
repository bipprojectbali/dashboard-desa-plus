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
OAuth provider accounts (GitHub, dll).
```
id, userId, accountId, providerId, accessToken, refreshToken, password, ...
```

#### `ApiKey`
API keys untuk integrasi eksternal.
```
id, name, key, userId, isActive, expiresAt, createdAt, updatedAt
```

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

#### `InnovationIdea`
Ide inovasi yang disubmit warga. Status: `DRAFT | SUBMITTED | APPROVED | REJECTED`.
```
id, title, description, category, submitterName, submitterContact,
status, reviewedBy, reviewedAt, notes, createdAt, updatedAt
```

#### `SecurityReport`
Laporan keamanan/insiden.
```
id, reportNumber, title, description, location, reportedBy, assignedTo,
status, createdAt, updatedAt
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
