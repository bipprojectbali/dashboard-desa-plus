-- AI Assistant (pondasi). Semua tabel baru — tidak ada backfill kolom NOT NULL
-- di tabel berisi data. Guard IF NOT EXISTS supaya aman bila dijalankan ulang
-- di lingkungan yang sudah setengah termigrasi.

-- Pengaturan global (singleton). Batas pemakaian disimpan di DB agar admin
-- bisa mengubahnya tanpa deploy; `enabled` default false supaya asisten mati
-- sampai admin mengisi kredensial.
CREATE TABLE IF NOT EXISTS "assistant_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "assistantName" TEXT NOT NULL DEFAULT 'Jenna',
    "personaNote" TEXT,
    "dailyMessageLimitPerUser" INTEGER NOT NULL DEFAULT 50,
    "dailyTokenLimitGlobal" INTEGER NOT NULL DEFAULT 1000000,
    "ratePerMinutePerUser" INTEGER NOT NULL DEFAULT 6,
    "maxInputChars" INTEGER NOT NULL DEFAULT 2000,
    "historyWindow" INTEGER NOT NULL DEFAULT 20,
    "retentionDays" INTEGER NOT NULL DEFAULT 90,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "assistant_settings_pkey" PRIMARY KEY ("id")
);

-- Kredensial per fitur (chat/pointer/voice). API key disimpan terenkripsi
-- (apiKeyEnc) karena dikelola admin dari UI, bukan dari env.
CREATE TABLE IF NOT EXISTS "ai_provider_config" (
    "feature" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "providerType" TEXT NOT NULL DEFAULT 'openai-compatible',
    "baseUrl" TEXT,
    "apiKeyEnc" TEXT,
    "apiKeyHint" TEXT,
    "model" TEXT,
    "temperature" DOUBLE PRECISION,
    "maxTokens" INTEGER,
    "timeoutMs" INTEGER NOT NULL DEFAULT 60000,
    "lastTestAt" TIMESTAMP(3),
    "lastTestOk" BOOLEAN,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ai_provider_config_pkey" PRIMARY KEY ("feature")
);

CREATE TABLE IF NOT EXISTS "assistant_conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Percakapan baru',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assistant_conversation_pkey" PRIMARY KEY ("id")
);

-- userId didenormalisasi agar kuota harian per user dihitung tanpa join.
-- Tidak ada tabel usage terpisah: kuota & statistik dihitung dari tabel ini.
CREATE TABLE IF NOT EXISTS "assistant_message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolsUsed" TEXT[],
    "pageRoute" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assistant_message_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "assistant_conversation_userId_updatedAt_idx" ON "assistant_conversation"("userId", "updatedAt");

CREATE INDEX IF NOT EXISTS "assistant_message_conversationId_createdAt_idx" ON "assistant_message"("conversationId", "createdAt");

CREATE INDEX IF NOT EXISTS "assistant_message_userId_createdAt_idx" ON "assistant_message"("userId", "createdAt");

-- Dipakai job retensi harian (hapus pesan lebih tua dari retentionDays).
CREATE INDEX IF NOT EXISTS "assistant_message_createdAt_idx" ON "assistant_message"("createdAt");

-- Postgres tidak punya ADD CONSTRAINT IF NOT EXISTS — dicek manual lewat pg_constraint.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assistant_conversation_userId_fkey') THEN
        ALTER TABLE "assistant_conversation" ADD CONSTRAINT "assistant_conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assistant_message_conversationId_fkey') THEN
        ALTER TABLE "assistant_message" ADD CONSTRAINT "assistant_message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "assistant_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Izin baru `use-ai-assistant` untuk role admin & user. Disisipkan di sini
-- karena fitur baru tanpa baris RolePermission tidak terlihat di matriks
-- /admin/roles sampai admin membukanya; dengan baris ini admin langsung bisa
-- mematikannya per role. ON CONFLICT menjaga pilihan admin yang sudah ada.
INSERT INTO "role_permission" ("id", "role", "feature", "allowed", "createdAt", "updatedAt")
VALUES
    (gen_random_uuid()::text, 'admin', 'use-ai-assistant', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'user', 'use-ai-assistant', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("role", "feature") DO NOTHING;
