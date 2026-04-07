# Database Seeders Documentation

## 📁 Seeder Structure

```
prisma/
├── seed.ts                          # Main seeder entry point
└── seeders/
    ├── seed-auth.ts                 # Authentication & Users + API Keys
    ├── seed-demographics.ts         # Banjars & Residents
    ├── seed-division-performance.ts # Divisions, Activities & Metrics
    ├── seed-public-services.ts      # Complaints, Services, Events + Updates
    ├── seed-discussions.ts          # Documents, Discussions
    ├── seed-dashboard-metrics.ts    # Budget, SDGs, Satisfaction
    ├── seed-phase2.ts               # UMKM, Posyandu, Security, etc.
    └── README.md                    # This file
```

---

## 🚀 Usage

### Run All Seeders

```bash
bun run seed
```

**Note**: If data already exists, the seeder will **skip automatically** to prevent duplicates.

This will execute all seeders in the following order:
1. **Authentication & Users** (Admin + Demo users + API Keys)
2. **Demographics & Population** (Banjars + Residents)
3. **Division Performance** (Divisions + Activities + Metrics)
4. **Public Services** (Complaints + Service Letters + Events + Innovation + Updates)
5. **Documents & Discussions** (Documents + Discussions)
6. **Dashboard Metrics** (Budget + SDGs + Satisfaction)
7. **Phase 2+ Features** (UMKM + Posyandu + Security Reports + Employment + Population + Transactions)

---

### Run Specific Seeders

#### 1. Authentication & Users
```bash
bun run seed:auth
```
**Seeds:**
- Admin user (from env or default: `admin@example.com` / `admin123`)
- Demo users:
  - `demo1@example.com` / `demo123` (role: user)
  - `demo2@example.com` / `demo123` (role: user)
  - `moderator@example.com` / `demo123` (role: moderator)
- API Keys (Development & Production keys for admin)

**Models:** `User`, `Account`, `ApiKey`

---

#### 2. Demographics & Population
```bash
bun run seed:demographics
```
**Seeds:**
- 6 Banjars: Darmasaba, Manesa, Cabe, Penenjoan, Baler Pasar, Bucu
- 2 Sample residents with complete demographic data

**Models:** `Banjar`, `Resident`

---

#### 3. Division Performance
```bash
bun run seed:divisions
```
**Seeds:**
- 4 Divisions: Pemerintahan, Pembangunan, Pemberdayaan, Kesejahteraan
- 3 Sample activities with different status and priority
- 4 Division metrics (quarterly performance data)

**Models:** `Division`, `Activity`, `DivisionMetric`

---

#### 4. Public Services
```bash
bun run seed:services
```
**Seeds:**
- 2 Complaints (BARU, DIPROSES status)
- 3 Service Letters (KTP, KK, Domisili)
- 2 Events (Rapat, Gotong Royong)
- 2 Innovation Ideas
- 2 Complaint Updates (status change history)

**Models:** `Complaint`, `ComplaintUpdate`, `ServiceLetter`, `Event`, `InnovationIdea`

---

#### 5. Documents & Discussions
```bash
bun run seed:documents
```
**Seeds:**
- 5 Documents (SK, Laporan Keuangan, Dokumentasi, Notulensi, Data)
- 4 Discussions (threaded discussions with replies)
- 4 Division Metrics (performance per division)

**Models:** `Document`, `Discussion`, `DivisionMetric`

---

#### 6. Dashboard Metrics
```bash
bun run seed:dashboard
```
**Seeds:**
- Budget allocations (APBDes) - 4 categories
- 4 SDGs scores
- Satisfaction ratings - 4 categories

**Models:** `Budget`, `SdgsScore`, `SatisfactionRating`

---

#### 7. Phase 2+ Features
```bash
bun run seed:phase2
```
**Seeds:**
- 4 UMKM (local businesses per banjar)
- 3 Posyandu (health service posts)
- 2 Security Reports
- Employment Records (for existing residents)
- Population Dynamics (births, deaths, migration)
- Budget Transactions (sample financial transactions)

**Models:** `Umkm`, `Posyandu`, `SecurityReport`, `EmploymentRecord`, `PopulationDynamic`, `BudgetTransaction`

---

## 📊 Feature to Seeder Mapping

| Feature Category | Seeder File | Models | Status |
|-----------------|-------------|--------|--------|
| Authentication | `seed-auth.ts` | `User`, `Account`, `ApiKey` | ✅ Complete |
| Demographics | `seed-demographics.ts` | `Banjar`, `Resident` | ✅ Complete |
| Division Performance | `seed-division-performance.ts` | `Division`, `Activity`, `DivisionMetric` | ✅ Complete |
| Complaints & Services | `seed-public-services.ts` | `Complaint`, `ComplaintUpdate`, `ServiceLetter`, `Event`, `InnovationIdea` | ✅ Complete |
| Documents & Discussions | `seed-discussions.ts` | `Document`, `Discussion` | ✅ Complete |
| Dashboard Metrics | `seed-dashboard-metrics.ts` | `Budget`, `SdgsScore`, `SatisfactionRating` | ✅ Complete |
| Phase 2+ Features | `seed-phase2.ts` | `Umkm`, `Posyandu`, `SecurityReport`, `EmploymentRecord`, `PopulationDynamic`, `BudgetTransaction` | ✅ Complete |

---

## 📋 Complete Model Coverage

### Total Models: 33

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Has Seeder | 27 | 82% |
| ⏭️ Auto-managed | 2 | 6% |
| 🟡 Stub (Phase 2+) | 4 | 12% |

### Models Without Dedicated Seeders

| Model | Reason |
|-------|--------|
| `Session` | Auto-managed by Better Auth at runtime |
| `Verification` | Auto-managed by Better Auth at runtime |
| `HealthRecord` | Phase 2+ stub - minimal implementation |
| `EmploymentRecord` | Included in `seed-phase2.ts` |
| `PopulationDynamic` | Included in `seed-phase2.ts` |
| `BudgetTransaction` | Included in `seed-phase2.ts` |

---

## 🔧 Environment Variables

Create or update `.env` file:

```env
# Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/darmasaba_db
```

---

## 📝 Notes

1. **Idempotent Seeders**: All seeders use `upsert` where possible to avoid duplicate data
2. **Dependencies**: Some seeders depend on others (e.g., Activities need Division IDs)
3. **Demo Users**: Only created if they don't exist (prevents duplication on re-seed)
4. **Admin User**: Will update role to "admin" if email exists with different role
5. **API Keys**: Skipped if keys already exist for admin user
6. **Phase 2+ Features**: Some models are stubs with minimal relations

---

## 🐛 Troubleshooting

### Seeder skips because data exists
```bash
# This is expected behavior if you already have data
# To force re-seed, you need to reset the database:
bun x prisma migrate reset
bun run seed
```

### Seed data already exists but want to update
```bash
# Option 1: Reset and re-seed (recommended)
bun x prisma migrate reset
bun run seed

# Option 2: Manually delete specific tables via Prisma Studio
bun x prisma studio
# Then delete data and run seed again
```

### Seeder fails with connection error
```bash
# Ensure database is running and .env file is configured
cp .env.example .env
# Fill in DATABASE_URL
```

### Reset database and re-seed
```bash
# Drop and recreate database
bun x prisma migrate reset
# Then run seed
bun run seed
```

### Check seeded data
```bash
# Connect to database and query
bun x prisma studio
```

### Run specific seeder for testing
```bash
# Only seed documents and discussions
bun run seed:documents

# Only seed phase 2 features
bun run seed:phase2
```

---

## 📊 Seed Data Summary

After running `bun run seed`, you will have:

| Category | Count |
|----------|-------|
| Users | 4 (1 admin + 3 demo) |
| API Keys | 2 |
| Banjars | 6 |
| Residents | 2 |
| Divisions | 4 |
| Activities | 3 |
| Division Metrics | 4 |
| Complaints | 2 |
| Complaint Updates | 2 |
| Service Letters | 3 |
| Events | 2 |
| Innovation Ideas | 2 |
| Documents | 5 |
| Discussions | 4+ (with replies) |
| Budget Categories | 4 |
| SDGs Scores | 4 |
| Satisfaction Ratings | 4 |
| UMKM | 4 |
| Posyandu | 3 |
| Security Reports | 2 |
| Employment Records | 2 |
| Population Dynamics | 3 |
| Budget Transactions | 2 |

---

**Last Updated**: 2026-03-27  
**Project**: Darmasaba Dashboard Noc  
**Branch**: seed-all-fitur
