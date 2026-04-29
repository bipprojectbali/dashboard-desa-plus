-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('BERJALAN', 'SELESAI', 'TERTUNDA', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('RENDAH', 'SEDANG', 'TINGGI', 'DARURAT');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('SURAT_KEPUTUSAN', 'DOKUMENTASI', 'LAPORAN_KEUANGAN', 'NOTULENSI_RAPAT', 'UMUM');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('RAPAT', 'KEGIATAN', 'UPACARA', 'SOSIAL', 'BUDAYA', 'LAINNYA');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('KETERTIBAN_UMUM', 'PELAYANAN_KESEHATAN', 'INFRASTRUKTUR', 'ADMINISTRASI', 'KEAMANAN', 'LAINNYA');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('BARU', 'DIPROSES', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "LetterType" AS ENUM ('KTP', 'KK', 'DOMISILI', 'USAHA', 'KETERANGAN_TIDAK_MAMPU', 'SURAT_PENGANTAR', 'LAINNYA');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('BARU', 'DIPROSES', 'SELESAI', 'DIAMBIL');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('BARU', 'DIKAJI', 'DISETUJUI', 'DITOLAK', 'DIIMPLEMENTASI');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('HINDU', 'ISLAM', 'KRISTEN', 'KATOLIK', 'BUDDHA', 'KONGHUCU', 'LAINNYA');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('TIDAK_SEKOLAH', 'SD', 'SMP', 'SMA', 'D3', 'S1', 'S2', 'S3');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailVerified" BOOLEAN,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT DEFAULT 'user',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "division" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#1E3A5F',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "divisionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "ActivityStatus" NOT NULL DEFAULT 'BERJALAN',
    "priority" "Priority" NOT NULL DEFAULT 'SEDANG',
    "assignedTo" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "divisionId" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "parentId" TEXT,
    "divisionId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "EventType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "division_metric" (
    "id" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "activityCount" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "division_metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint" (
    "id" TEXT NOT NULL,
    "complaintNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ComplaintCategory" NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'BARU',
    "priority" "Priority" NOT NULL DEFAULT 'SEDANG',
    "reporterId" TEXT,
    "reporterPhone" TEXT,
    "reporterEmail" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "assignedTo" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "location" TEXT,
    "imageUrl" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_update" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ComplaintStatus",
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_update_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_letter" (
    "id" TEXT NOT NULL,
    "letterNumber" TEXT NOT NULL,
    "letterType" "LetterType" NOT NULL,
    "applicantName" TEXT NOT NULL,
    "applicantNik" TEXT NOT NULL,
    "applicantAddress" TEXT NOT NULL,
    "purpose" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'BARU',
    "processedBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_letter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innovation_idea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "submitterName" TEXT NOT NULL,
    "submitterContact" TEXT,
    "status" "IdeaStatus" NOT NULL DEFAULT 'BARU',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innovation_idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resident" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "kk" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "religion" "Religion" NOT NULL,
    "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'BELUM_KAWIN',
    "education" "EducationLevel",
    "occupation" TEXT,
    "banjarId" TEXT NOT NULL,
    "rt" TEXT NOT NULL,
    "rw" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isHeadOfHousehold" BOOLEAN NOT NULL DEFAULT false,
    "isPoor" BOOLEAN NOT NULL DEFAULT false,
    "isStunting" BOOLEAN NOT NULL DEFAULT false,
    "deathDate" TIMESTAMP(3),
    "moveInDate" TIMESTAMP(3),
    "moveOutDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banjar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "totalPopulation" INTEGER NOT NULL DEFAULT 0,
    "totalKK" INTEGER NOT NULL DEFAULT 0,
    "totalPoor" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banjar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthRecord" (
    "id" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "recordedBy" TEXT NOT NULL,

    CONSTRAINT "HealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentRecord" (
    "id" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,

    CONSTRAINT "EmploymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopulationDynamic" (
    "id" TEXT NOT NULL,
    "documentedBy" TEXT NOT NULL,

    CONSTRAINT "PopulationDynamic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "approvedBy" TEXT,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetTransaction" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "BudgetTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Umkm" (
    "id" TEXT NOT NULL,
    "banjarId" TEXT,

    CONSTRAINT "Umkm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posyandu" (
    "id" TEXT NOT NULL,
    "coordinatorId" TEXT,

    CONSTRAINT "Posyandu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityReport" (
    "id" TEXT NOT NULL,
    "assignedTo" TEXT,

    CONSTRAINT "SecurityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_key_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "division_name_key" ON "division"("name");

-- CreateIndex
CREATE INDEX "activity_divisionId_idx" ON "activity"("divisionId");

-- CreateIndex
CREATE INDEX "activity_status_idx" ON "activity"("status");

-- CreateIndex
CREATE INDEX "document_category_idx" ON "document"("category");

-- CreateIndex
CREATE INDEX "document_divisionId_idx" ON "document"("divisionId");

-- CreateIndex
CREATE INDEX "discussion_divisionId_idx" ON "discussion"("divisionId");

-- CreateIndex
CREATE INDEX "discussion_createdAt_idx" ON "discussion"("createdAt");

-- CreateIndex
CREATE INDEX "event_startDate_idx" ON "event"("startDate");

-- CreateIndex
CREATE INDEX "event_eventType_idx" ON "event"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "division_metric_divisionId_period_key" ON "division_metric"("divisionId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "complaint_complaintNumber_key" ON "complaint"("complaintNumber");

-- CreateIndex
CREATE INDEX "complaint_status_idx" ON "complaint"("status");

-- CreateIndex
CREATE INDEX "complaint_category_idx" ON "complaint"("category");

-- CreateIndex
CREATE INDEX "complaint_createdAt_idx" ON "complaint"("createdAt");

-- CreateIndex
CREATE INDEX "complaint_update_complaintId_idx" ON "complaint_update"("complaintId");

-- CreateIndex
CREATE UNIQUE INDEX "service_letter_letterNumber_key" ON "service_letter"("letterNumber");

-- CreateIndex
CREATE INDEX "service_letter_letterType_idx" ON "service_letter"("letterType");

-- CreateIndex
CREATE INDEX "service_letter_status_idx" ON "service_letter"("status");

-- CreateIndex
CREATE INDEX "service_letter_createdAt_idx" ON "service_letter"("createdAt");

-- CreateIndex
CREATE INDEX "innovation_idea_category_idx" ON "innovation_idea"("category");

-- CreateIndex
CREATE INDEX "innovation_idea_status_idx" ON "innovation_idea"("status");

-- CreateIndex
CREATE UNIQUE INDEX "resident_nik_key" ON "resident"("nik");

-- CreateIndex
CREATE INDEX "resident_banjarId_idx" ON "resident"("banjarId");

-- CreateIndex
CREATE INDEX "resident_religion_idx" ON "resident"("religion");

-- CreateIndex
CREATE INDEX "resident_occupation_idx" ON "resident"("occupation");

-- CreateIndex
CREATE UNIQUE INDEX "banjar_name_key" ON "banjar"("name");

-- CreateIndex
CREATE UNIQUE INDEX "banjar_code_key" ON "banjar"("code");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_key_key" ON "api_key"("key");

-- CreateIndex
CREATE INDEX "api_key_userId_idx" ON "api_key"("userId");

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "discussion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "division_metric" ADD CONSTRAINT "division_metric_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint" ADD CONSTRAINT "complaint_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint" ADD CONSTRAINT "complaint_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_update" ADD CONSTRAINT "complaint_update_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_update" ADD CONSTRAINT "complaint_update_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_letter" ADD CONSTRAINT "service_letter_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innovation_idea" ADD CONSTRAINT "innovation_idea_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident" ADD CONSTRAINT "resident_banjarId_fkey" FOREIGN KEY ("banjarId") REFERENCES "banjar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthRecord" ADD CONSTRAINT "HealthRecord_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthRecord" ADD CONSTRAINT "HealthRecord_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentRecord" ADD CONSTRAINT "EmploymentRecord_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopulationDynamic" ADD CONSTRAINT "PopulationDynamic_documentedBy_fkey" FOREIGN KEY ("documentedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetTransaction" ADD CONSTRAINT "BudgetTransaction_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Umkm" ADD CONSTRAINT "Umkm_banjarId_fkey" FOREIGN KEY ("banjarId") REFERENCES "banjar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posyandu" ADD CONSTRAINT "Posyandu_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityReport" ADD CONSTRAINT "SecurityReport_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
