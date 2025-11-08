# 🔧 Quick Fix Guide for Current Errors

## Issues Fixed in Code:
✅ Fixed `weddingReceptionImage` error in Media.tsx - now uses Supabase Storage URLs
✅ Fixed `fetchPriority` warning in Hero.tsx - already using lowercase `fetchpriority`
✅ Removed old asset imports - all images now use Supabase Storage

## ⚠️ Action Required: Fix RLS Policy

The contact form is being blocked by Row Level Security. You need to run this SQL in your Supabase dashboard:

### Steps:
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/oxecaqattfrvtrqhsvtn
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this SQL:

```sql
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
```

5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### Alternative: Use the Migration File
The same SQL is saved in: `src/supabase/migrations/20250101000003_fix_contact_rls.sql`

## 🔄 Clear Browser Cache

After fixing the RLS policy, **hard refresh your browser** to clear cached JavaScript:
- **Chrome/Edge**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- **Safari**: `Cmd+Option+R`
- **Firefox**: `Cmd+Shift+R` (Mac) or `Ctrl+F5` (Windows)

This will clear the old cached code that's causing the `getAccessToken` and `weddingReceptionImage` errors.

## ✅ Test After Fixing

1. **Contact Form**: Submit a test message - it should save to `contact_submissions` table
2. **Services Section**: Should load without errors
3. **No Console Errors**: Check browser console (F12) - should be clean

## 📝 Notes

- The 401 errors for `/auth/session` are from the old edge function - these can be ignored (or you can remove the edge function if not using it)
- All images are now loading from Supabase Storage
- The contact form will work once the RLS policy is fixed

