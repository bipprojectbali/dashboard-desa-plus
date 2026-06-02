-- CreateTable
CREATE TABLE "jenna_usage_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responseTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jenna_usage_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jenna_usage_log_userId_idx" ON "jenna_usage_log"("userId");

-- CreateIndex
CREATE INDEX "jenna_usage_log_createdAt_idx" ON "jenna_usage_log"("createdAt");

-- CreateIndex
CREATE INDEX "jenna_usage_log_userId_createdAt_idx" ON "jenna_usage_log"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "jenna_usage_log" ADD CONSTRAINT "jenna_usage_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
