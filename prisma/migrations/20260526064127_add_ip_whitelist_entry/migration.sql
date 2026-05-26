-- CreateTable
CREATE TABLE "ip_whitelist_entry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ip_whitelist_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ip_whitelist_entry_userId_ip_key" ON "ip_whitelist_entry"("userId", "ip");

-- AddForeignKey
ALTER TABLE "ip_whitelist_entry" ADD CONSTRAINT "ip_whitelist_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
