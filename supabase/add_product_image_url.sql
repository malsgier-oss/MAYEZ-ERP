-- Add product photo URL (Supabase Storage public URL).
-- Run after schema.sql. Then create Storage bucket in Supabase Dashboard:
-- Storage → New bucket → Name: product-photos → Public bucket: ON.

ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;
