-- Override ukuran per widget di video wall: { [widgetId]: { w, h } }.
-- Idempotent (IF NOT EXISTS) & nullable: baris lama tanpa kolom ini tetap valid,
-- klien jatuh balik ke ukuran default preset saat `sizes` NULL.
ALTER TABLE "wall_layout" ADD COLUMN IF NOT EXISTS "sizes" JSONB;
