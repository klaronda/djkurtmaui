-- Complete RLS Policies for DJ Kurt Website
-- This file sets up all Row Level Security policies for database tables and storage buckets
-- Run this in your Supabase SQL Editor after running the initial schema migration

-- ==================== DATABASE RLS POLICIES ====================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public can view featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Public can view photos" ON photos;
DROP POLICY IF EXISTS "Public can view mixes" ON mixes;
DROP POLICY IF EXISTS "Public can view testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public can view venues" ON venues;
DROP POLICY IF EXISTS "Authenticated users can manage featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Authenticated users can manage photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can manage mixes" ON mixes;
DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can manage venues" ON venues;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can delete submissions" ON contact_submissions;

-- ==================== FEATURED VIDEOS ====================

-- Public can view active videos
CREATE POLICY "Public can view featured videos" 
ON featured_videos 
FOR SELECT 
USING (is_active = true);

-- Authenticated users can insert videos
CREATE POLICY "Authenticated users can insert videos" 
ON featured_videos 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update videos
CREATE POLICY "Authenticated users can update videos" 
ON featured_videos 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Authenticated users can delete videos
CREATE POLICY "Authenticated users can delete videos" 
ON featured_videos 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ==================== PHOTOS ====================

-- Public can view all photos
CREATE POLICY "Public can view photos" 
ON photos 
FOR SELECT 
USING (true);

-- Authenticated users can insert photos
CREATE POLICY "Authenticated users can insert photos" 
ON photos 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update photos
CREATE POLICY "Authenticated users can update photos" 
ON photos 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Authenticated users can delete photos
CREATE POLICY "Authenticated users can delete photos" 
ON photos 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ==================== MIXES ====================

-- Public can view all mixes
CREATE POLICY "Public can view mixes" 
ON mixes 
FOR SELECT 
USING (true);

-- Authenticated users can insert mixes
CREATE POLICY "Authenticated users can insert mixes" 
ON mixes 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update mixes
CREATE POLICY "Authenticated users can update mixes" 
ON mixes 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Authenticated users can delete mixes
CREATE POLICY "Authenticated users can delete mixes" 
ON mixes 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ==================== TESTIMONIALS ====================

-- Public can view all testimonials
CREATE POLICY "Public can view testimonials" 
ON testimonials 
FOR SELECT 
USING (true);

-- Authenticated users can insert testimonials
CREATE POLICY "Authenticated users can insert testimonials" 
ON testimonials 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update testimonials
CREATE POLICY "Authenticated users can update testimonials" 
ON testimonials 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Authenticated users can delete testimonials
CREATE POLICY "Authenticated users can delete testimonials" 
ON testimonials 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ==================== VENUES ====================

-- Public can view all venues
CREATE POLICY "Public can view venues" 
ON venues 
FOR SELECT 
USING (true);

-- Authenticated users can insert venues
CREATE POLICY "Authenticated users can insert venues" 
ON venues 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update venues
CREATE POLICY "Authenticated users can update venues" 
ON venues 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Authenticated users can delete venues
CREATE POLICY "Authenticated users can delete venues" 
ON venues 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ==================== CONTACT SUBMISSIONS ====================

-- Anyone can submit contact form (no auth required)
CREATE POLICY "Anyone can submit contact form" 
ON contact_submissions 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated users can view submissions
CREATE POLICY "Authenticated users can view submissions" 
ON contact_submissions 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Only authenticated users can update submissions
CREATE POLICY "Authenticated users can update submissions" 
ON contact_submissions 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Only authenticated users can delete submissions
CREATE POLICY "Authenticated users can delete submissions" 
ON contact_submissions 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ==================== STORAGE BUCKET POLICIES ====================

-- Ensure storage.objects has RLS enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public read photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read testimonial-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload testimonial-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update testimonial-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete testimonial-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read venue-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload venue-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update venue-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete venue-logos" ON storage.objects;

-- ==================== PHOTOS BUCKET ====================

-- Public can read photos
CREATE POLICY "Public read photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos');

-- Authenticated users can upload photos
CREATE POLICY "Authenticated upload photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Authenticated users can update photos
CREATE POLICY "Authenticated update photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Authenticated users can delete photos
CREATE POLICY "Authenticated delete photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- ==================== TESTIMONIAL IMAGES BUCKET ====================

-- Public can read testimonial images
CREATE POLICY "Public read testimonial-images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'testimonial-images');

-- Authenticated users can upload testimonial images
CREATE POLICY "Authenticated upload testimonial-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'testimonial-images' AND auth.role() = 'authenticated');

-- Authenticated users can update testimonial images
CREATE POLICY "Authenticated update testimonial-images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'testimonial-images' AND auth.role() = 'authenticated');

-- Authenticated users can delete testimonial images
CREATE POLICY "Authenticated delete testimonial-images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'testimonial-images' AND auth.role() = 'authenticated');

-- ==================== VENUE LOGOS BUCKET ====================

-- Public can read venue logos
CREATE POLICY "Public read venue-logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'venue-logos');

-- Authenticated users can upload venue logos
CREATE POLICY "Authenticated upload venue-logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'venue-logos' AND auth.role() = 'authenticated');

-- Authenticated users can update venue logos
CREATE POLICY "Authenticated update venue-logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'venue-logos' AND auth.role() = 'authenticated');

-- Authenticated users can delete venue logos
CREATE POLICY "Authenticated delete venue-logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'venue-logos' AND auth.role() = 'authenticated');

