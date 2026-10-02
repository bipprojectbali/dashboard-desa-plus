-- Jeda lanjut otomatis panduan bertahap di layar kiosk /wall (keputusan user 2026-10-02, #43).
-- TV NOC jarang disentuh, jadi panduan maju sendiri; admin mengatur jedanya tanpa deploy
-- (default 8 detik, rentang 3-60 divalidasi di aplikasi).
-- Kolom NOT NULL punya DEFAULT, jadi aman bila assistant_settings sudah berisi baris.
ALTER TABLE "assistant_settings" ADD COLUMN IF NOT EXISTS "guideAutoAdvanceSec" INTEGER NOT NULL DEFAULT 8;
