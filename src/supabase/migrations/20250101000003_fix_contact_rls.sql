-- Fix RLS policy for contact_submissions to ensure public inserts work
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Public can submit contact form" ON contact_submissions;

-- Recreate the policy to allow public inserts
CREATE POLICY "Anyone can submit contact form" 
ON contact_submissions 
FOR INSERT 
WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

