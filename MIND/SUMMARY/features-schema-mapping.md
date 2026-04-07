# Darmasaba Dashboard - Feature to Schema Mapping

## 📋 Project Overview

**Darmasaba Dashboard** is a full-stack village management system built with:
- **Runtime**: Bun
- **Backend**: ElysiaJS
- **Frontend**: React 19 + TanStack Router + Mantine UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth

**Architecture**: Single Port (3000) - Backend & Frontend run on same port

---

## 🗂️ Feature Categories & Schema Models

### KATEGORI 1: KINERJA DIVISI & AKTIVITAS (Division Performance)

| Feature | Component | Prisma Models | API Endpoints |
|---------|-----------|---------------|---------------|
| Division Management | `division-list.tsx` | `Division`, `DivisionMetric` | `GET /api/division/`, `GET /api/division/metrics` |
| Activity Tracking | `activity-card.tsx` | `Activity`, `Division` | `GET /api/division/activities` |
| Document Archive | `archive-card.tsx` | `Document`, `Division` | - |
| Discussion Forum | `discussion-panel.tsx` | `Discussion`, `Division`, `User` | - |
| Event Calendar | `event-card.tsx` | `Event`, `User` | `GET /api/event/`, `GET /api/event/today` |

**Main Component**: `src/components/kinerja-divisi.tsx`

**Enums**: `ActivityStatus`, `Priority`, `DocumentCategory`, `EventType`

---

### KATEGORI 2: PENGADUAN & LAYANAN PUBLIK (Complaints & Public Services)

| Feature | Component | Prisma Models | API Endpoints |
|---------|-----------|---------------|---------------|
| Complaint Management | `dashboard-content.tsx` | `Complaint`, `ComplaintUpdate`, `User` | `GET /api/complaint/stats`, `GET /api/complaint/recent` |
| Service Letters | `chart-surat.tsx` | `ServiceLetter`, `User` | `GET /api/complaint/service-stats`, `GET /api/complaint/service-trends`, `GET /api/complaint/service-weekly` |
| Innovation Ideas | - | `InnovationIdea`, `User` | `GET /api/complaint/innovation-ideas` |

**Main Component**: `src/components/pengaduan-layanan-publik.tsx`

**Enums**: `ComplaintCategory`, `ComplaintStatus`, `Priority`, `LetterType`, `ServiceStatus`, `IdeaStatus`

---

### KATEGORI 3: DEMOGRAFI & KEPENDUDUKAN (Demographics & Population)

| Feature | Component | Prisma Models | API Endpoints |
|---------|-----------|---------------|---------------|
| Resident Database | `summary-cards.tsx` | `Resident`, `Banjar` | `GET /api/resident/stats`, `GET /api/resident/demographics` |
| Banjar Management | - | `Banjar`, `Resident` | `GET /api/resident/banjar-stats` |
| Population Dynamics | - | `PopulationDynamic`, `User` | - |
| Health Records | `health-stats.tsx` | `HealthRecord`, `Resident`, `User` | - |
| Employment Records | `demografi-pekerjaan.tsx` | `EmploymentRecord`, `Resident` | - |

**Main Components**: 
- `src/components/demografi-pekerjaan.tsx`
- `src/components/sosial/summary-cards.tsx`
- `src/components/sosial/health-stats.tsx`

**Enums**: `Gender`, `Religion`, `MaritalStatus`, `EducationLevel`

---

### KATEGORI 4: KEUANGAN & ANGGARAN (Finance & Budget)

| Feature | Component | Prisma Models | API Endpoints |
|---------|-----------|---------------|---------------|
| Budget Planning (APBDes) | `chart-apbdes.tsx` | `Budget` | `GET /api/dashboard/budget` |
| Budget Transactions | - | `BudgetTransaction`, `User` | - |

**Main Component**: `src/components/keuangan-anggaran.tsx`

---

### KATEGORI 5: METRIK DASHBOARD & SDGS (Dashboard Metrics)

| Feature | Component | Prisma Models | API Endpoints |
|---------|-----------|---------------|---------------|
| SDGs Dashboard | `sdgs-card.tsx` | `SdgsScore` | `GET /api/dashboard/sdgs` |
| Satisfaction Rating | `satisfaction-chart.tsx` | `SatisfactionRating` | `GET /api/dashboard/satisfaction` |
| Main Dashboard KPIs | `stat-card.tsx`, `dashboard-content.tsx` | Multiple | Multiple |

**Main Component**: `src/components/dashboard-content.tsx`

**Dashboard Stats Sources**:
| StatCard | Model | API |
|----------|-------|-----|
| Surat Minggu Ini | `ServiceLetter` | `GET /api/complaint/service-weekly` |
| Pengaduan Aktif | `Complaint` | `GET /api/complaint/stats` |
| Layanan Selesai | `Complaint` | `GET /api/complaint/stats` |
| Total Penduduk | `Resident` | `GET /api/resident/stats` |

**Division Progress**:
| Component | Model | API |
|-----------|-------|-----|
| `division-progress.tsx` | `Division` + `Activity` | `GET /api/division/` |

---

### KATEGORI 6: SOSIAL & KESEHATAN (Social & Health)

| Feature | Component | Prisma Models | API Endpoints |
|---------|-----------|---------------|---------------|
| Health Statistics | `health-stats.tsx` | `HealthRecord`, `Resident`, `User` | - |
| Posyandu Schedule | `posyandu-schedule.tsx` | `Posyandu`, `User` | - |
| Education Stats | `pendidikan.tsx` | `Resident` (education fields) | - |
| Scholarship Program | `beasiswa.tsx` | - | - |

**Main Component**: `src/components/sosial-page.tsx`

---

### KATEGORI 7: BUMDES & UMKM (Village Enterprise & SMEs)

| Feature | Component | Prisma Models | API Endpoints |
|---------|-----------|---------------|---------------|
| UMKM Products | `produk-unggulan.tsx` | `Umkm`, `Banjar` | - |
| Sales Tracking | `sales-table.tsx` | - | - |
| Top Products | `top-products.tsx` | - | - |

**Main Component**: `src/components/bumdes-page.tsx`

---

### KATEGORI 8: KEAMANAN (Security)

| Feature | Component | Prisma Models | API Endpoints |
|---------|-----------|---------------|---------------|
| Security Reports | - | `SecurityReport`, `User` | - |
| CCTV Monitoring | - | - | - |

**Main Component**: `src/components/keamanan-page.tsx`

---

### KATEGORI 9: JENNA ANALYTIC (Chatbot Analytics)

| Feature | Component | Prisma Models | API Endpoints |
|---------|-----------|---------------|---------------|
| Chatbot Interactions | `jenna-analytic.tsx` | - | - |
| Top Topics | - | - | - |
| Response Metrics | - | - | - |

**Main Component**: `src/components/jenna-analytic.tsx`

---

### KATEGORI 10: AUTHENTICATION & USER MANAGEMENT

| Feature | Component | Prisma Models | API Endpoints |
|---------|-----------|---------------|---------------|
| User Authentication | `signin.tsx`, `signup.tsx` | `User`, `Account`, `Session` | `POST /api/auth/*`, `GET /api/session` |
| User Profiles | `pengaturan/*` | `User` | `POST /api/profile/update` |
| API Key Management | `admin/apikey.tsx` | `ApiKey`, `User` | `GET/POST /api/apikey/*` |
| User Management | `admin/users.tsx` | `User` | - |
| Role Management | - | `User` (role field) | - |
| Email Verification | - | `Verification` | - |

**Routes**: `/signin`, `/signup`, `/admin/apikey`, `/admin/users`, `/pengaturan/*`

---

## 📊 Complete Prisma Models Reference

### Core Models (Authentication & System)

| Model | Fields | Purpose | Related Features |
|-------|--------|---------|------------------|
| `User` | id, email, name, role, createdAt | User accounts with roles | All features |
| `Session` | id, userId, expiresAt, token | User sessions | Authentication |
| `Account` | id, userId, providerId, accessToken | OAuth provider accounts | Social login |
| `Verification` | id, identifier, value, expiresAt | Email verification tokens | Registration |
| `ApiKey` | id, name, key, userId, isActive | API access tokens | API management |

---

### Category 1: Division Performance Models

| Model | Key Fields | Relations | Purpose |
|-------|------------|-----------|---------|
| `Division` | id, name, description, color, isActive | activities, documents, discussions | Village departments |
| `Activity` | id, title, divisionId, progress, status, priority | division | Programs and tasks |
| `Document` | id, title, category, fileUrl, divisionId | division | Digital archives |
| `Discussion` | id, message, senderId, divisionId, isResolved | sender, parent, replies, division | Forum discussions |
| `Event` | id, title, eventType, startDate, createdBy | creator | Calendar events |
| `DivisionMetric` | id, divisionId, period, activityCount, completionRate | division | Performance metrics |

---

### Category 2: Complaints & Services Models

| Model | Key Fields | Relations | Purpose |
|-------|------------|-----------|---------|
| `Complaint` | id, complaintNumber, title, category, status, reporterId, assignedTo | reporter, assignee | Citizen complaints |
| `ComplaintUpdate` | id, complaintId, message, status, updatedBy | complaint, updater | Status updates |
| `ServiceLetter` | id, letterNumber, letterType, applicantName, status, processedBy | processor | Administrative letters |
| `InnovationIdea` | id, title, description, category, status, reviewedBy | reviewer | Citizen innovations |

---

### Category 3: Demographics Models

| Model | Key Fields | Relations | Purpose |
|-------|------------|-----------|---------|
| `Resident` | id, nik, kk, name, birthDate, gender, religion, banjarId, rt, rw | banjar, healthRecords, employmentRecords | Resident registry |
| `Banjar` | id, name, code, totalPopulation, totalKK, totalPoor | residents, umkms | Village hamlets |
| `HealthRecord` | id, residentId, recordedBy | resident, recorder | Health data |
| `EmploymentRecord` | id, residentId | resident | Employment data |
| `PopulationDynamic` | id, documentedBy | documentor | Population changes |

---

### Category 4: Finance Models

| Model | Key Fields | Relations | Purpose |
|-------|------------|-----------|---------|
| `Budget` | id, category, amount, percentage, fiscalYear | - | Budget allocations |
| `BudgetTransaction` | id, createdBy | creator | Financial transactions |

---

### Category 5: Dashboard Metrics Models

| Model | Key Fields | Relations | Purpose |
|-------|------------|-----------|---------|
| `SdgsScore` | id, title, score, image | - | SDGs goal scores |
| `SatisfactionRating` | id, category, value, color | - | Satisfaction surveys |

---

### Category 6-8: Phase 2+ Stub Models

| Model | Key Fields | Relations | Purpose |
|-------|------------|-----------|---------|
| `Umkm` | id, banjarId | banjar | SME businesses |
| `Posyandu` | id, coordinatorId | coordinator | Health post schedules |
| `SecurityReport` | id, assignedTo | assignee | Security incidents |

---

## 🗺️ Route to Feature Mapping

| Route | Component | Feature Category | Primary Models |
|-------|-----------|------------------|----------------|
| `/` | `DashboardContent` | Main Dashboard | Multiple |
| `/kinerja-divisi` | `KinerjaDivisi` | Division Performance | `Division`, `Activity`, `Document`, `Discussion`, `Event` |
| `/pengaduan-layanan-publik` | `PengaduanLayananPublik` | Complaints & Services | `Complaint`, `ServiceLetter`, `InnovationIdea` |
| `/jenna-analytic` | `JennaAnalytic` | Chatbot Analytics | - |
| `/demografi-pekerjaan` | `DemografiPekerjaan` | Demographics | `Resident`, `Banjar`, `EmploymentRecord` |
| `/keuangan-anggaran` | `KeuanganAnggaran` | Finance & Budget | `Budget`, `BudgetTransaction` |
| `/bumdes` | `BumdesPage` | Village Enterprise | `Umkm`, `Banjar` |
| `/sosial` | `SosialPage` | Social & Health | `Resident`, `HealthRecord`, `Posyandu` |
| `/keamanan` | `KeamananPage` | Security | `SecurityReport` |
| `/bantuan` | `HelpPage` | Help | - |
| `/pengaturan/*` | Settings | Settings | `User` |
| `/admin/*` | Admin | Administration | `User`, `ApiKey` |
| `/signin`, `/signup` | Auth | Authentication | `User`, `Session`, `Account` |

---

## 🔌 API Endpoints Reference

| Prefix | Endpoints | Models | Purpose |
|--------|-----------|--------|---------|
| `/api/auth/*` | All auth operations | `User`, `Session`, `Account` | Authentication |
| `/api/session` | GET current session | `Session`, `User` | Session management |
| `/api/profile/update` | POST update profile | `User` | Profile management |
| `/api/apikey/*` | GET/POST API keys | `ApiKey` | API key management |
| `/api/division/*` | Divisions, activities, metrics | `Division`, `Activity`, `DivisionMetric` | Division performance |
| `/api/complaint/*` | Complaints, services, trends | `Complaint`, `ServiceLetter` | Public services |
| `/api/resident/*` | Resident stats, demographics | `Resident`, `Banjar` | Population data |
| `/api/event/*` | Events list | `Event` | Calendar |
| `/api/dashboard/*` | Budget, SDGs, satisfaction | `Budget`, `SdgsScore`, `SatisfactionRating` | Dashboard metrics |

---

## 📝 Notes

1. **Phase 1 Features** (Fully Implemented): Categories 1-5
2. **Phase 2+ Features** (Stubs/Partial): Categories 6-8 (Social, BUMDES, Security)
3. **Cross-Cutting Concerns**: Authentication (Category 10) applies to all features
4. **Dashboard Aggregation**: Main dashboard (`/`) aggregates data from multiple models across categories

---

**Generated**: 2026-03-27  
**Project**: Darmasaba Dashboard Noc  
**Documentation**: Feature to Schema Mapping
