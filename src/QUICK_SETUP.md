# 🚀 Quick Setup Guide - Direct Supabase Integration

## ✅ What's Done

1. ✅ **Complete RLS Policies** - Created in `supabase/migrations/20250101000002_complete_rls_policies.sql`
2. ✅ **Direct Supabase APIs** - Created in `utils/api-direct.ts`
3. ✅ **Supabase Client** - Created in `lib/supabase.ts`
4. ✅ **ContentManager Updated** - Now uses direct Supabase APIs (no edge function!)

## 📋 What You Need to Do

### 1. Run Database Migrations

Go to your Supabase Dashboard → SQL Editor and run these in order:

1. `supabase/migrations/20250101000000_initial_schema.sql` - Creates tables
2. `supabase/migrations/20250101000002_complete_rls_policies.sql` - Sets up all RLS policies

### 2. Create Storage Buckets

Go to Supabase Dashboard → Storage → New Bucket:

1. **Bucket: `photos`**
   - Name: `photos`
   - Public: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

2. **Bucket: `testimonial-images`** (optional, for future use)
   - Name: `testimonial-images`
   - Public: ✅ Yes

3. **Bucket: `venue-logos`** (optional, for future use)
   - Name: `venue-logos`
   - Public: ✅ Yes

**Note:** The RLS policies for storage are already in the migration file, so once you create the buckets, the policies will automatically apply!

### 3. Set Environment Variables

Make sure your `.env.local` file has:

```env
VITE_SUPABASE_URL=https://oxecaqattfrvtrqhsvtn.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Get your anon key from: Supabase Dashboard → Settings → API → anon public key

### 4. Test It!

1. Start your dev server: `npm run dev`
2. Log in to the CMS
3. Try uploading a photo - it should go directly to Supabase Storage!
4. Check Supabase Dashboard → Storage → photos bucket to see your uploads

## 🎉 That's It!

**No edge function needed!** Everything works directly from the frontend:
- ✅ Photos upload directly to Supabase Storage
- ✅ All data saves directly to PostgreSQL
- ✅ RLS policies handle security automatically
- ✅ Faster, simpler, and cheaper!

## 🔍 Troubleshooting

**"Permission denied" errors?**
- Make sure you're logged in (authenticated)
- Check that RLS policies were applied correctly
- Verify storage bucket policies in the migration file

**Photos not uploading?**
- Check browser console for errors
- Verify storage bucket exists and is public
- Make sure file is < 5MB and is JPEG/PNG/WebP

**Can't see data?**
- Check Supabase Dashboard → Table Editor to see if data is there
- Verify RLS policies allow public read access

## 📚 Files Changed

- `components/ContentManager.tsx` - Now uses direct APIs
- `utils/api-direct.ts` - New direct Supabase APIs
- `lib/supabase.ts` - Supabase client setup
- `supabase/migrations/20250101000002_complete_rls_policies.sql` - Complete RLS policies

## 🗑️ Cleanup (Optional)

Once everything works, you can delete:
- `supabase/functions/` folder (edge function no longer needed)
- `utils/api.ts` (old edge function API)

But keep them for now until you're sure everything works!

