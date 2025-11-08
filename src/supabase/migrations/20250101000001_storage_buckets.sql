-- Storage bucket policies will be created via Supabase Dashboard
-- This file documents the required buckets and policies

-- Required Storage Buckets:
-- 1. 'photos' - For gallery images (public read, authenticated write)
-- 2. 'testimonial-images' - For client testimonial photos (public read, authenticated write)
-- 3. 'venue-logos' - For venue partner logos (public read, authenticated write)

-- Note: Storage buckets must be created manually in Supabase Dashboard
-- Go to Storage > Create Bucket and create the buckets listed above
-- Then set policies:
--   - Public read access for all buckets
--   - Authenticated write access for all buckets



