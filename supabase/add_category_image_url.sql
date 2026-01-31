-- Add category photo support. Run in Supabase SQL Editor.
-- After running: create Storage bucket "category-photos" (public) in Dashboard.

alter table categories add column if not exists image_url text;
