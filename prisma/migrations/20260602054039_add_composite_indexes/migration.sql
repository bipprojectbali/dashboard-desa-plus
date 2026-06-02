-- CreateIndex
CREATE INDEX "activity_log_userId_createdAt_idx" ON "activity_log"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "complaint_status_createdAt_idx" ON "complaint"("status", "createdAt");

-- CreateIndex
CREATE INDEX "complaint_assignedTo_idx" ON "complaint"("assignedTo");
