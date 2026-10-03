-- Fitur 3 Suara (S1): giliran suara masuk percakapan yang sama dengan chat,
-- jadi tiap pesan perlu penanda modalitas untuk ikon 🎙 di riwayat.
-- Data lama otomatis 'text' lewat DEFAULT.
ALTER TABLE "assistant_message" ADD COLUMN IF NOT EXISTS "modality" TEXT NOT NULL DEFAULT 'text';

-- Batas & model suara diatur admin tanpa deploy (06 §9.1). Default dari 06 §5.1/§9.1.
ALTER TABLE "assistant_settings" ADD COLUMN IF NOT EXISTS "voiceDailyMinutesUser" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "assistant_settings" ADD COLUMN IF NOT EXISTS "voiceDailyMinutesKiosk" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "assistant_settings" ADD COLUMN IF NOT EXISTS "voiceSessionMaxMinutes" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "assistant_settings" ADD COLUMN IF NOT EXISTS "voiceIdleOffSeconds" INTEGER NOT NULL DEFAULT 120;
ALTER TABLE "assistant_settings" ADD COLUMN IF NOT EXISTS "voiceLiveModel" TEXT NOT NULL DEFAULT 'gpt-live-1';
ALTER TABLE "assistant_settings" ADD COLUMN IF NOT EXISTS "voiceName" TEXT;
ALTER TABLE "assistant_settings" ADD COLUMN IF NOT EXISTS "voiceReadExactInstruction" TEXT;

-- Kuota menit suara dihitung server dari detik nyata per sesi (start/heartbeat/close),
-- dan dipakai untuk menolak sesi kedua per user. Audio/transkrip tidak disimpan.
CREATE TABLE IF NOT EXISTS "assistant_voice_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'starting',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastHeartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "billedSeconds" INTEGER NOT NULL DEFAULT 0,
    "extendedSeconds" INTEGER NOT NULL DEFAULT 0,
    "endReason" TEXT,

    CONSTRAINT "assistant_voice_session_pkey" PRIMARY KEY ("id")
);

-- Banner persetujuan mikrofon tampil sekali per user lintas perangkat (bukan localStorage).
CREATE TABLE IF NOT EXISTS "assistant_voice_consent" (
    "userId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assistant_voice_consent_pkey" PRIMARY KEY ("userId")
);

-- Kuota harian (userId + startedAt ≥ awal hari WITA) & cek sesi aktif (status).
CREATE INDEX IF NOT EXISTS "assistant_voice_session_userId_startedAt_idx" ON "assistant_voice_session"("userId", "startedAt");
CREATE INDEX IF NOT EXISTS "assistant_voice_session_status_idx" ON "assistant_voice_session"("status");

-- FK tidak punya IF NOT EXISTS: cek pg_constraint agar migrasi aman dijalankan ulang.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assistant_voice_session_userId_fkey') THEN
        ALTER TABLE "assistant_voice_session" ADD CONSTRAINT "assistant_voice_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assistant_voice_consent_userId_fkey') THEN
        ALTER TABLE "assistant_voice_consent" ADD CONSTRAINT "assistant_voice_consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Izin baru use-ai-voice: aktif default untuk admin & user (keputusan #48), bisa dimatikan
-- per role di /admin/roles. DO NOTHING agar pilihan admin yang sudah ada tidak ditimpa.
INSERT INTO "role_permission" ("id", "role", "feature", "allowed", "createdAt", "updatedAt")
VALUES
    (gen_random_uuid()::text, 'admin', 'use-ai-voice', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'user', 'use-ai-voice', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("role", "feature") DO NOTHING;
