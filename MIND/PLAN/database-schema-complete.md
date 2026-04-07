# Darmasaba Dashboard - Database Schema Planning

**Tanggal Analisis:** 26 Maret 2026  
**Status:** ⚠️ **KRITIS** - Aplikasi saat ini hanya memiliki 5 tabel auth, semua fitur menggunakan mock data  
**Total Tabel Dibutuhkan:** 25+ tabel baru

---

## 📊 STATUS SAAT INI

### Tabel Yang Sudah Ada (5 tabel)
```prisma
✅ User          - Authentication & user management
✅ Session       - Better Auth sessions
✅ Account       - OAuth & credential accounts
✅ Verification  - Email verification tokens
✅ ApiKey        - API key management
```

### Fitur Tanpa Database (Mock Data)
```
❌ Kinerja Divisi (6 komponen)
❌ Pengaduan & Layanan Publik
❌ Jenna Analytic (Chatbot analytics)
❌ Demografi & Kependudukan
❌ Keuangan & Anggaran
❌ Bumdes & UMKM
❌ Sosial (6 komponen)
❌ Keamanan (CCTV & laporan)
❌ Dashboard (activities, events, satisfaction)
❌ Pengaturan (all 4 sub-pages)
```

---

## 🗄️ DATABASE SCHEMA LENGKAP

### KATEGORI 1: KINERJA DIVISI & AKTIVITAS

#### 1. `Division` - Data Divisi Desa
```prisma
model Division {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  color       String   @default("#1E3A5F")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  activities       Activity[]
  documents        Document[]
  discussions      Discussion[]
  divisionMetrics  DivisionMetric[]
  
  @@map("division")
}
```

**Koneksi ke Fitur:**
- `/kinerja-divisi` → DivisionList component
- `/kinerja-divisi` → ActivityCard component
- `/kinerja-divisi` → DocumentChart component

---

#### 2. `Activity` - Program Kegiatan
```prisma
model Activity {
  id          String   @id @default(cuid())
  title       String
  description String?
  divisionId  String
  startDate   DateTime?
  endDate     DateTime?
  dueDate     DateTime?
  progress    Int      @default(0) // 0-100
  status      ActivityStatus @default("BERJALAN")
  priority    Priority @default("SEDANG")
  assignedTo  String?  // JSON array of user IDs
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  division Division @relation(fields: [divisionId], references: [id], onDelete: Cascade)
  
  @@index([divisionId])
  @@index([status])
  @@map("activity")
}

enum ActivityStatus {
  BERJALAN
  SELESAI
  TERTUNDA
  DIBATALKAN
}

enum Priority {
  RENDAH
  SEDANG
  TINGGI
  DARURAT
}
```

**Koneksi ke Fitur:**
- `/kinerja-divisi` → ActivityCard (4 cards dengan progress)
- `/` → DivisionProgress component

---

#### 3. `Document` - Arsip Digital Dokumen
```prisma
model Document {
  id          String   @id @default(cuid())
  title       String
  category    DocumentCategory
  type        String   // "Gambar", "Dokumen", "PDF", etc
  fileUrl     String
  fileSize    Int?     // in bytes
  divisionId  String?
  uploadedBy  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  division Division? @relation(fields: [divisionId], references: [id], onDelete: SetNull)
  
  @@index([category])
  @@index([divisionId])
  @@map("document")
}

enum DocumentCategory {
  SURAT_KEPUTUSAN
  DOKUMENTASI
  LAPORAN_KEUANGAN
  NOTULENSI_RAPAT
  UMUM
}
```

**Koneksi ke Fitur:**
- `/kinerja-divisi` → ArchiveCard (4 kategori arsip)
- `/kinerja-divisi` → DocumentChart (Gambar vs Dokumen)

---

#### 4. `Discussion` - Diskusi Internal
```prisma
model Discussion {
  id        String   @id @default(cuid())
  message   String
  senderId  String
  parentId  String?  // For threaded discussions
  divisionId String?
  isResolved Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  sender   User      @relation(fields: [senderId], references: [id], onDelete: Cascade)
  parent   Discussion? @relation("DiscussionThread", fields: [parentId], references: [id], onDelete: SetNull)
  replies  Discussion[] @relation("DiscussionThread")
  division Division? @relation(fields: [divisionId], references: [id], onDelete: SetNull)
  
  @@index([divisionId])
  @@index([createdAt])
  @@map("discussion")
}
```

**Koneksi ke Fitur:**
- `/kinerja-divisi` → DiscussionPanel component

---

#### 5. `Event` - Acara & Agenda
```prisma
model Event {
  id          String   @id @default(cuid())
  title       String
  description String?
  eventType   EventType
  startDate   DateTime
  endDate     DateTime?
  location    String?
  isAllDay    Boolean  @default(false)
  isRecurring Boolean  @default(false)
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  creator User @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  
  @@index([startDate])
  @@index([eventType])
  @@map("event")
}

enum EventType {
  RAPAT
  KEGIATAN
  UPACARA
  SOSIAL
  BUDAYA
  LAINNYA
}
```

**Koneksi ke Fitur:**
- `/kinerja-divisi` → EventCard (Acara Hari Ini)
- `/` → ActivityList (Kalender & Kegiatan)

---

#### 6. `DivisionMetric` - Kinerja Divisi
```prisma
model DivisionMetric {
  id         String   @id @default(cuid())
  divisionId String
  period     String   // "2025-Q1", "2025-01"
  activityCount Int   @default(0)
  completionRate Float @default(0)
  avgProgress Float  @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  division Division @relation(fields: [divisionId], references: [id], onDelete: Cascade)
  
  @@unique([divisionId, period])
  @@map("division_metric")
}
```

**Koneksi ke Fitur:**
- `/kinerja-divisi` → ProgressChart component

---

### KATEGORI 2: PENGADUAN & LAYANAN PUBLIK

#### 7. `Complaint` - Pengaduan Warga
```prisma
model Complaint {
  id          String   @id @default(cuid())
  complaintNumber String @unique // Auto-generated: COMPLAINT-YYYYMMDD-XXX
  title       String
  description String
  category    ComplaintCategory
  status      ComplaintStatus @default("BARU")
  priority    Priority @default("SEDANG")
  
  reporterName String?
  reporterPhone String?
  reporterEmail String?
  isAnonymous  Boolean @default(false)
  
  assignedTo   String?  // User ID
  resolvedBy   String?  // User ID
  resolvedAt   DateTime?
  
  location    String?
  imageUrl    String[] // Array of image URLs
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  reporter     User?    @relation(fields: [reporterName], references: [name], onDelete: SetNull)
  assignee     User?    @relation(fields: [assignedTo], references: [id], onDelete: SetNull)
  
  complaintUpdates ComplaintUpdate[]
  
  @@index([status])
  @@index([category])
  @@index([createdAt])
  @@map("complaint")
}

enum ComplaintCategory {
  KETERTIBAN_UMUM
  PELAYANAN_KESEHATAN
  INFRASTRUKTUR
  ADMINISTRASI
  KEAMANAN
  LAINNYA
}

enum ComplaintStatus {
  BARU
  DIPROSES
  SELESAI
  DITOLAK
}
```

**Koneksi ke Fitur:**
- `/pengaduan-layanan-publik` → Summary cards (Total, Baru, Diproses, Selesai)
- `/pengaduan-layanan-publik` → Pengajuan Terbaru list

---

#### 8. `ComplaintUpdate` - Update Status Pengaduan
```prisma
model ComplaintUpdate {
  id          String   @id @default(cuid())
  complaintId String
  message     String
  status      ComplaintStatus?
  updatedBy   String
  createdAt   DateTime @default(now())
  
  complaint Complaint @relation(fields: [complaintId], references: [id], onDelete: Cascade)
  updater   User      @relation(fields: [updatedBy], references: [id], onDelete: Cascade)
  
  @@index([complaintId])
  @@map("complaint_update")
}
```

---

#### 9. `ServiceLetter` - Layanan Surat
```prisma
model ServiceLetter {
  id          String   @id @default(cuid())
  letterNumber String  @unique
  letterType  LetterType
  applicantName String
  applicantNik String
  applicantAddress String
  purpose     String?
  status      ServiceStatus @default("BARU")
  
  processedBy String?
  completedAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  processor User? @relation(fields: [processedBy], references: [id], onDelete: SetNull)
  
  @@index([letterType])
  @@index([status])
  @@index([createdAt])
  @@map("service_letter")
}

enum LetterType {
  KTP
  KK
  DOMISILI
  USAHA
  KETERANGAN_TIDAK_MAMPU
  SURAT_PENGANTAR
  LAINNYA
}

enum ServiceStatus {
  BARU
  DIPROSES
  SELESAI
  DIAMBIL
}
```

**Koneksi ke Fitur:**
- `/pengaduan-layanan-publik` → Surat Terbanyak chart
- `/` → StatCard "Surat Minggu Ini"

---

#### 10. `InnovationIdea` - Ide Inovatif Warga
```prisma
model InnovationIdea {
  id          String   @id @default(cuid())
  title       String
  description String
  category    String   // "Teknologi", "Ekonomi", "Kesehatan", "Pendidikan"
  submitterName String
  submitterContact String?
  status      IdeaStatus @default("BARU")
  reviewedBy  String?
  reviewedAt  DateTime?
  notes       String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  reviewer User? @relation(fields: [reviewedBy], references: [id], onDelete: SetNull)
  
  @@index([category])
  @@index([status])
  @@map("innovation_idea")
}

enum IdeaStatus {
  BARU
  DIKAJI
  DISETUJUI
  DITOLAK
  DIIMPLEMENTASI
}
```

**Koneksi ke Fitur:**
- `/pengaduan-layanan-publik` → Ajuan Ide Inovatif section

---

### KATEGORI 3: DEMOGRAFI & KEPENDUDUKAN

#### 11. `Resident` - Data Penduduk
```prisma
model Resident {
  id          String   @id @default(cuid())
  nik         String   @unique
  kk          String
  name        String
  birthDate   DateTime
  birthPlace  String
  gender      Gender
  religion    Religion
  maritalStatus MaritalStatus @default("BELUM_KAWIN")
  education   EducationLevel?
  occupation  String?
  
  banjarId    String
  rt          String
  rw          String
  address     String
  
  isHeadOfHousehold Boolean @default(false)
  isPoor      Boolean  @default(false)
  isStunting  Boolean  @default(false)
  
  birthDate   DateTime?
  deathDate   DateTime?
  moveInDate  DateTime?
  moveOutDate DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  banjar     Banjar    @relation(fields: [banjarId], references: [id], onDelete: Cascade)
  
  healthRecords   HealthRecord[]
  employmentRecords EmploymentRecord[]
  
  @@index([banjarId])
  @@index([religion])
  @@index([occupation])
  @@map("resident")
}

enum Gender {
  LAKI_LAKI
  PEREMPUAN
}

enum Religion {
  HINDU
  ISLAM
  KRISTEN
  KATOLIK
  BUDDHA
  KONGHUCU
  LAINNYA
}

enum MaritalStatus {
  BELUM_KAWIN
  KAWIN
  CERAI_HIDUP
  CERAI_MATI
}

enum EducationLevel {
  TIDAK_SEKOLAH
  SD
  SMP
  SMA
  D3
  S1
  S2
  S3
}
```

**Koneksi ke Fitur:**
- `/demografi-pekerjaan` → Semua KPI cards
- `/demografi-pekerjaan` → Distribusi Agama
- `/demografi-pekerjaan` → Data per Banjar

---

#### 12. `Banjar` - Wilayah Banjar
```prisma
model Banjar {
  id          String   @id @default(cuid())
  name        String   @unique
  code        String   @unique
  description String?
  
  totalPopulation Int @default(0)
  totalKK        Int @default(0)
  totalPoor      Int @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  residents  Resident[]
  
  @@map("banjar")
}
```

---

#### 13. `HealthRecord` - Catatan Kesehatan
```prisma
model HealthRecord {
  id          String   @id @default(cuid())
  residentId  String
  recordType  HealthRecordType
  date        DateTime
  
  // For immunization
  immunizationType String?
  isComplete  Boolean?
  
  // For checkups
  weight      Float?   // kg
  height      Float?   // cm
  bloodType   String?
  
  // For stunting
  isStunting  Boolean  @default(false)
  stuntingCategory String? // "NORMAL", "STUNTED", "SEVERELY_STUNTED"
  
  notes       String?
  recordedBy  String
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  resident Resident @relation(fields: [residentId], references: [id], onDelete: Cascade)
  recorder User     @relation(fields: [recordedBy], references: [id], onDelete: Cascade)
  
  @@index([residentId])
  @@index([recordType])
  @@map("health_record")
}

enum HealthRecordType {
  IMUNISASI
  PEMERIKSAAN_RUTIN
  POSYANDU
  GIZI
  KELAHIRAN
  KEMATIAN
}
```

**Koneksi ke Fitur:**
- `/sosial` → HealthStats component
- `/sosial` → SummaryCards (Ibu Hamil, Balita, Stunting)

---

#### 14. `EmploymentRecord` - Data Pekerjaan
```prisma
model EmploymentRecord {
  id          String   @id @default(cuid())
  residentId  String
  occupation  String
  sector      EmploymentSector
  isPrimary   Boolean  @default(true)
  income      Float?   // monthly income
  employer    String?
  startDate   DateTime?
  endDate     DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  resident Resident @relation(fields: [residentId], references: [id], onDelete: Cascade)
  
  @@index([residentId])
  @@index([sector])
  @@map("employment_record")
}

enum EmploymentSector {
  PERTANIAN
  PERDAGANGAN
  INDUSTRI
  JASA
  PNS
  TNI_POLRI
  SWASTA
  WIRASWASTA
  LAINNYA
}
```

**Koneksi ke Fitur:**
- `/demografi-pekerjaan` → Demografi Pekerjaan chart
- `/demografi-pekerjaan` → Sektor Unggulan

---

#### 15. `PopulationDynamic` - Dinamika Penduduk
```prisma
model PopulationDynamic {
  id          String   @id @default(cuid())
  type        DynamicType
  date        DateTime
  
  residentId  String?  // If related to specific resident
  description String
  
  birthDate   DateTime?  // For birth records
  deathDate   DateTime?  // For death records
  fromLocation String?   // For move-in
  toLocation   String?   // For move-out
  
  documentedBy String
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  documentor User @relation(fields: [documentedBy], references: [id], onDelete: Cascade)
  
  @@index([type])
  @@index([date])
  @@map("population_dynamic")
}

enum DynamicType {
  KELAHIRAN
  KEMATIAN
  PINDAH_MASUK
  PINDAH_KELUAR
}
```

**Koneksi ke Fitur:**
- `/demografi-pekerjaan` → Dinamika Penduduk (4 stats)

---

### KATEGORI 4: KEUANGAN & ANGGARAN

#### 16. `Budget` - APBDes
```prisma
model Budget {
  id          String   @id @default(cuid())
  year        Int
  type        BudgetType
  category    String
  subcategory String?
  amount      Float
  realized    Float    @default(0)
  
  description String?
  status      BudgetStatus @default("DRAFT")
  
  approvedBy  String?
  approvedAt  DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  approver User? @relation(fields: [approvedBy], references: [id], onDelete: SetNull)
  
  budgetTransactions BudgetTransaction[]
  
  @@index([year])
  @@index([type])
  @@unique([year, type, category, subcategory])
  @@map("budget")
}

enum BudgetType {
  PENDAPATAN
  BELANJA
}

enum BudgetStatus {
  DRAFT
  REVIEW
  APPROVED
  EXECUTED
}
```

**Koneksi ke Fitur:**
- `/keuangan-anggaran` → KPI cards (Total APBDes, Realisasi)
- `/keuangan-anggaran` → Laporan APBDes

---

#### 17. `BudgetTransaction` - Realisasi Anggaran
```prisma
model BudgetTransaction {
  id          String   @id @default(cuid())
  budgetId    String
  type        TransactionType
  amount      Float
  date        DateTime
  description String
  reference   String?  // Receipt number, etc
  
  createdBy   String
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  budget    Budget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  creator   User   @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  
  @@index([budgetId])
  @@index([date])
  @@map("budget_transaction")
}

enum TransactionType {
  PEMASUKAN
  PENGELUARAN
}
```

**Koneksi ke Fitur:**
- `/keuangan-anggaran` → Pemasukan & Pengeluaran chart
- `/keuangan-anggaran` → Realisasi percentage

---

#### 18. `AssistanceFund` - Dana Bantuan & Hibah
```prisma
model AssistanceFund {
  id          String   @id @default(cuid())
  source      String   // "Dana Desa", "ADD", "Bagi Hasil Pajak", "Hibah"
  amount      Float
  year        Int
  status      FundStatus @default("PROSES")
  disbursementDate DateTime?
  
  description String?
  regulatedBy String?  // Regulation number
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([year])
  @@index([source])
  @@map("assistance_fund")
}

enum FundStatus {
  PROSES
  CAIR
  DITUNDA
}
```

**Koneksi ke Fitur:**
- `/keuangan-anggaran` → Dana Bantuan dan Hibah section

---

### KATEGORI 5: BUMDES & UMKM

#### 19. `Umkm` - Data UMKM
```prisma
model Umkm {
  id          String   @id @default(cuid())
  name        String
  owner       String
  ownerPhone  String?
  address     String
  banjarId    String?
  
  category    UmkmCategory
  subCategory String?
  
  establishedDate DateTime?
  employeeCount Int      @default(0)
  
  isRegistered Boolean  @default(false)
  registeredDate DateTime?
  registrationNumber String?
  
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  banjar     Banjar?   @relation(fields: [banjarId], references: [id], onDelete: SetNull)
  products   Product[]
  sales      SalesRecord[]
  
  @@index([category])
  @@index([banjarId])
  @@map("umkm")
}

enum UmkmCategory {
  KULINER
  FASHION
  KERAJINAN
  PERTANIAN
  JASA
  LAINNYA
}
```

**Koneksi ke Fitur:**
- `/bumdes` → SummaryCards (UMKM Aktif, Terdaftar)

---

#### 20. `Product` - Produk UMKM
```prisma
model Product {
  id          String   @id @default(cuid())
  umkmId      String
  name        String
  description String?
  category    String
  
  price       Float
  unit        String   // "Kg", "Liter", "Botol", "Pcs"
  
  stock       Int      @default(0)
  minStock    Int      @default(10)
  
  imageUrl    String[]
  isFeatured  Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  umkm    Umkm    @relation(fields: [umkmId], references: [id], onDelete: Cascade)
  sales   SalesRecord[]
  
  @@index([umkmId])
  @@index([category])
  @@map("product")
}
```

**Koneksi ke Fitur:**
- `/bumdes` → Produk Unggulan
- `/bumdes` → Top Products
- `/bumdes` → SalesTable

---

#### 21. `SalesRecord` - Penjualan Produk
```prisma
model SalesRecord {
  id          String   @id @default(cuid())
  productId   String
  quantity    Float
  unit        String
  price       Float    // price at time of sale
  total       Float
  
  saleDate    DateTime
  
  customerName String?
  customerPhone String?
  
  paymentMethod PaymentMethod @default("CASH")
  isPaid      Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@index([productId])
  @@index([saleDate])
  @@map("sales_record")
}

enum PaymentMethod {
  CASH
  TRANSFER
  E_WALLET
  KREDIT
}
```

**Koneksi ke Fitur:**
- `/bumdes` → SalesTable (Detail Penjualan Produk)
- `/bumdes` → SummaryCards (Omzet)

---

### KATEGORI 6: SOSIAL

#### 22. `Posyandu` - Jadwal & Kegiatan Posyandu
```prisma
model Posyandu {
  id          String   @id @default(cuid())
  name        String   // "Posyandu Mawar", "Posyandu Melati"
  location    String
  schedule    String   // "Senin, 08:00 - 11:00"
  dayOfWeek   Int      // 1=Monday, 7=Sunday
  
  isActive    Boolean  @default(true)
  coordinatorId String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  coordinator User? @relation(fields: [coordinatorId], references: [id], onDelete: SetNull)
  
  activities PosyanduActivity[]
  
  @@map("posyandu")
}
```

**Koneksi ke Fitur:**
- `/sosial` → PosyanduSchedule component

---

#### 23. `PosyanduActivity` - Kegiatan Posyandu
```prisma
model PosyanduActivity {
  id          String   @id @default(cuid())
  posyanduId  String
  date        DateTime
  attendees   Int      @default(0)
  
  ibuHamil    Int      @default(0)
  balita      Int      @default(0)
  
  notes       String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  posyandu  Posyandu @relation(fields: [posyanduId], references: [id], onDelete: Cascade)
  
  @@index([posyanduId])
  @@index([date])
  @@map("posyandu_activity")
}
```

---

#### 24. `Scholarship` - Beasiswa Desa
```prisma
model Scholarship {
  id          String   @id @default(cuid())
  name        String
  year        String   // "2025/2026"
  totalFund   Float
  allocatedFund Float  @default(0)
  
  recipientCount Int   @default(0)
  maxRecipients Int
  
  applicationOpen DateTime?
  applicationClose DateTime?
  
  isActive    Boolean  @default(true)
  description String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  recipients ScholarshipRecipient[]
  
  @@index([year])
  @@map("scholarship")
}
```

**Koneksi ke Fitur:**
- `/sosial` → Beasiswa component

---

#### 25. `ScholarshipRecipient` - Penerima Beasiswa
```prisma
model ScholarshipRecipient {
  id           String   @id @default(cuid())
  scholarshipId String
  studentName  String
  studentNik   String
  school       String
  grade        String
  amount       Float
  
  selectedAt   DateTime @default(now())
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  scholarship Scholarship @relation(fields: [scholarshipId], references: [id], onDelete: Cascade)
  
  @@unique([scholarshipId, studentNik])
  @@map("scholarship_recipient")
}
```

---

#### 26. `CulturalEvent` - Event Budaya
```prisma
model CulturalEvent {
  id          String   @id @default(cuid())
  name        String
  description String?
  eventType   String
  date        DateTime
  location    String?
  
  organizer   String?
  budget      Float?
  
  imageUrl    String[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([date])
  @@map("cultural_event")
}
```

**Koneksi ke Fitur:**
- `/sosial` → EventCalendar component

---

### KATEGORI 7: KEAMANAN

#### 27. `CctvCamera` - Kamera CCTV
```prisma
model CctvCamera {
  id          String   @id @default(cuid())
  name        String   // "CCTV-01"
  location    String   // "Balai Desa"
  
  latitude    Float?
  longitude   Float?
  
  streamUrl   String?
  isOnline    Boolean  @default(false)
  lastSeenAt  DateTime?
  
  installedAt DateTime?
  maintenanceSchedule DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([isOnline])
  @@map("cctv_camera")
}
```

**Koneksi ke Fitur:**
- `/keamanan` → Peta Keamanan CCTV
- `/keamanan` → Daftar CCTV

---

#### 28. `SecurityReport` - Laporan Keamanan
```prisma
model SecurityReport {
  id          String   @id @default(cuid())
  reportNumber String @unique
  title       String
  description String
  
  category    SecurityCategory
  severity    Severity @default("RENDAH")
  status      SecurityStatus @default("BARU")
  
  reportedAt  DateTime
  location    String
  
  reporterName String?
  reporterPhone String?
  
  assignedTo  String?
  resolvedBy  String?
  resolvedAt  DateTime?
  
  imageUrl    String[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  assignee User? @relation(fields: [assignedTo], references: [id], onDelete: SetNull)
  
  @@index([status])
  @@index([category])
  @@map("security_report")
}

enum SecurityCategory {
  PENCURIAN
  KERUSUHAN
  KEBAKARAN
  KECELAKAAN
  KEHILANGAN
  LAINNYA
}

enum Severity {
  RENDAH
  SEDANG
  TINGGI
  DARURAT
}

enum SecurityStatus {
  BARU
  DIPROSES
  SELESAI
}
```

**Koneksi ke Fitur:**
- `/keamanan` → Daftar Laporan Keamanan
- `/keamanan` → KPI "Laporan Keamanan"

---

### KATEGORI 8: DASHBOARD & ANALYTICS

#### 29. `SatisfactionSurvey` - Kepuasan Masyarakat
```prisma
model SatisfactionSurvey {
  id          String   @id @default(cuid())
  respondentName String?
  isAnonymous Boolean  @default(true)
  
  serviceType String
  rating      SatisfactionRating
  feedback    String?
  
  submittedAt DateTime @default(now())
  
  @@index([serviceType])
  @@index([rating])
  @@map("satisfaction_survey")
}

enum SatisfactionRating {
  SANGAT_PUAS
  PUAS
  CUKUP
  KURANG
  SANGAT_KURANG
}
```

**Koneksi ke Fitur:**
- `/` → SatisfactionChart
- `/` → StatCard "Kepuasan Warga"

---

#### 30. `ChatbotInteraction` - Interaksi Chatbot (Jenna)
```prisma
model ChatbotInteraction {
  id          String   @id @default(cuid())
  sessionId   String
  userId      String?
  
  question    String
  answer      String?
  topic       String?
  
  isResolved  Boolean  @default(false)
  confidence  Float?   // AI confidence score
  
  createdAt   DateTime @default(now())
  
  @@index([sessionId])
  @@index([topic])
  @@index([createdAt])
  @@map("chatbot_interaction")
}
```

**Koneksi ke Fitur:**
- `/jenna-analytic` → KPI (Interaksi, Jawaban Otomatis)
- `/jenna-analytic` → Interaksi Chatbot chart
- `/jenna-analytic` → Topik Pertanyaan Terbanyak
- `/jenna-analytic` → Jam Tersibuk

---

#### 31. `SystemSetting` - Pengaturan Sistem
```prisma
model SystemSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String   // JSON string
  category    String
  
  description String?
  
  updatedAt   DateTime @updatedAt
  
  @@index([category])
  @@map("system_setting")
}
```

**Koneksi ke Fitur:**
- `/pengaturan/umum` - Bahasa, Zona Waktu, Format Tanggal
- `/pengaturan/notifikasi` - Notification preferences
- `/pengaturan/keamanan` - Security settings
- `/pengaturan/akses-dan-tim` - Team settings

---

## 📊 RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                         USER (Auth)                         │
│  id, email, name, role, image                               │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Division     │  │    Complaint    │  │     Budget      │
│  id, name       │  │  id, title      │  │  id, year       │
│  color          │  │  status         │  │  type, amount   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Activity     │  │  ServiceLetter  │  │  BudgetTrans.   │
│  id, title      │  │  id, type       │  │  id, amount     │
│  progress       │  │  status         │  │  date           │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      RESIDENT (Core)                        │
│  id, nik, kk, name, birthDate, religion, occupation         │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Banjar      │  │  HealthRecord   │  │  EmploymentRec. │
│  id, name       │  │  type, date     │  │  occupation     │
│  population     │  │  isStunting     │  │  sector         │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    UMKM ECOSYSTEM                           │
│  Umkm → Product → SalesRecord                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 PRIORITAS IMPLEMENTASI

### Phase 1: Core Features (Week 1-2)
```
1. ✅ Division, Activity, Document - Kinerja Divisi
2. ✅ Event - Dashboard & Agenda
3. ✅ Complaint, ServiceLetter - Pengaduan & Layanan
4. ✅ Resident, Banjar - Demografi dasar
```

### Phase 2: Social & Economic (Week 3-4)
```
5. ✅ HealthRecord, Posyandu - Kesehatan
6. ✅ Umkm, Product, SalesRecord - BUMDES
7. ✅ Scholarship, CulturalEvent - Sosial Budaya
```

### Phase 3: Finance & Security (Week 5-6)
```
8. ✅ Budget, BudgetTransaction - APBDes
9. ✅ AssistanceFund - Dana Hibah
10. ✅ CctvCamera, SecurityReport - Keamanan
```

### Phase 4: Analytics & Settings (Week 7-8)
```
11. ✅ SatisfactionSurvey - Kepuasan
12. ✅ ChatbotInteraction - Jenna Analytics
13. ✅ SystemSetting - Pengaturan
14. ✅ Discussion - Forum Internal
```

---

## 📝 NEXT STEPS

1. **Review schema** dengan tim development
2. **Create Prisma migrations** untuk setiap phase
3. **Seed data** untuk testing
4. **Build API endpoints** untuk CRUD operations
5. **Connect frontend components** ke real data
6. **Testing & validation**

---

**Dibuat untuk:** Tim Pengembang Darmasaba  
**Tujuan:** Blueprint lengkap implementasi database  
**Status:** Ready for implementation
