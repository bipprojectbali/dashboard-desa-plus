-- CreateTable
CREATE TABLE "sync_log" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL DEFAULT 'scheduled',
    "durationMs" INTEGER,
    "recordsAffected" INTEGER,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sync_log_type_idx" ON "sync_log"("type");

-- CreateIndex
CREATE INDEX "sync_log_startedAt_idx" ON "sync_log"("startedAt");
