# DJ Kurt Website - Setup Guide

This guide will help you set up the DJ Kurt website locally and prepare it for Supabase integration.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (sign up at https://supabase.com)
- Resend account (sign up at https://resend.com) with an active API key for contact notifications

## Local Setup

### 1. Install Dependencies

```bash
cd "/Users/kevoo/Cursor/dj-kurt-maui/DJ Kurt Maui Website/src"
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `src/` directory:

```env
VITE_SUPABASE_URL=https://oxecaqattfrvtrqhsvtn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94ZWNhcWF0dGZydnRycWhzdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzYwMjcsImV4cCI6MjA3Nzg1MjAyN30.woxzUJ6Xrqj8BW6fMdLotBQUwupXUBC0Ea0h6qop7eI
```

**To get your Supabase credentials:**
1. Go to https://supabase.com/dashboard
2. Create a new project or select an existing one
3. Go to **Settings** > **API**
4. Copy the **Project URL** and **anon public** key
5. Paste them into your `.env.local` file

### 3. Run Development Server

```bash
npm run dev
```

The website will be available at `http://localhost:5173`

## Supabase Setup

### 1. Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/20250101000000_initial_schema.sql`
4. Copy and paste the SQL into the SQL Editor
5. Click **Run** to execute the migration

This will create all required tables:
- `featured_videos` - Hero video configuration
- `photos` - Gallery images
- `mixes` - Sample mixes (Spotify/Mixcloud)
- `testimonials` - Client reviews
- `venues` - Trusted venue partners
- `contact_submissions` - Contact form entries

### 2. Create Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Create the following buckets:
   - **photos** - For gallery images
   - **testimonial-images** - For client testimonial photos
   - **venue-logos** - For venue partner logos

3. For each bucket, configure:
   - **Public bucket**: Yes (enables public read access)
   - **File size limit**: 5MB
   - **Allowed MIME types**: image/jpeg, image/png, image/webp

4. Set storage policies:
   - **Read**: Public (anyone can view)
   - **Write/Delete**: Authenticated users only

### 3. Configure Contact Notifications (Supabase Edge Function + Resend)

The site sends a notification email whenever someone submits the contact form. Supabase calls an Edge Function named `notify-contact`, which relays the message using the Resend API.

#### 3.1 Create the Edge Function

You can deploy the function directly from the dashboard:

1. In your Supabase project, go to **Edge Functions** → **Create a new function**.
2. Name the function `notify-contact`.
3. Copy the contents of `src/supabase/functions/notify-contact/index.ts` into the editor.
4. Click **Deploy**.

Or use the CLI:

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Authenticate and link the project
supabase login
supabase link --project-ref oxecaqattfrvtrqhsvtn

# Deploy the contact notification function
cd "DJ Kurt Maui Website/src"
supabase functions deploy notify-contact --project-ref oxecaqattfrvtrqhsvtn
```

#### 3.2 Set Edge Function Secrets

Add these secrets so the function can send email via Resend:

- `RESEND_API_KEY` – create at https://resend.com/api-keys
- `RESEND_FROM_EMAIL` – e.g. `DJ Kurt Maui <notifications@djkurtmaui.com>`
- `RESEND_TO_EMAIL` – default recipient, e.g. `djkurtmaui@gmail.com`

Dashboard path: **Edge Functions** → `notify-contact` → **Settings** → **Secrets** → **Add a new secret**.

CLI alternative:

```bash
supabase secrets set RESEND_API_KEY=your-resend-key --project-ref oxecaqattfrvtrqhsvtn
supabase secrets set RESEND_FROM_EMAIL="DJ Kurt Maui <notifications@djkurtmaui.com>" --project-ref oxecaqattfrvtrqhsvtn
supabase secrets set RESEND_TO_EMAIL=djkurtmaui@gmail.com --project-ref oxecaqattfrvtrqhsvtn
```

#### 3.3 Create a Database Webhook

1. Go to **Database** → **Webhooks** → **Create webhook**.
2. Select the `contact_submissions` table.
3. Trigger on **INSERT** events.
4. Choose **Edge Function** as the target and pick `notify-contact`.
5. Save the webhook.

That's it—every new contact submission will trigger an email via Resend.

## Create Admin Account

1. Navigate to `http://localhost:5173/#admin-signup`
2. Enter your email and password
3. Click **Sign Up**
4. You'll be automatically logged in
5. Navigate to `http://localhost:5173/#admin` to access the CMS

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Page components
├── utils/              # Utility functions
│   ├── api.ts          # API client
│   └── supabase/       # Supabase config
├── supabase/
│   ├── functions/      # Edge functions
│   │   └── server/    # Hono server
│   └── migrations/    # Database migrations
├── styles/            # Global styles
└── assets/            # Static assets
```

## Current Status

### ✅ Working
- Frontend is complete and functional
- All components render correctly
- Admin authentication ready
- CMS interface ready

### 🔄 Needs Migration
- Server endpoints currently use KV store
- Need to migrate to PostgreSQL (see MIGRATION_GUIDE.md)
- File uploads need to use Supabase Storage instead of base64

## Next Steps

1. **Test the local setup** - Make sure the dev server runs
2. **Set up Supabase** - Create tables and storage buckets
3. **Migrate server endpoints** - Follow MIGRATION_GUIDE.md
4. **Test all features** - Use the testing checklist in CURSOR_SETUP.md

## Troubleshooting

### Issue: "Failed to fetch" errors
- Check that your `.env.local` file has correct Supabase credentials
- Verify the edge function is deployed
- Check browser console for CORS errors

### Issue: Can't create admin account
- Verify Supabase Auth is enabled
- Check edge function logs: `npm run supabase:logs`
- Ensure the edge function has the correct service role key

### Issue: Images not loading
- Verify storage buckets are created and set to public
- Check storage policies allow public read access
- Ensure image URLs are correct

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Project README](README.md)
- [Migration Guide](MIGRATION_GUIDE.md)
- [Cursor Setup Guide](CURSOR_SETUP.md)



