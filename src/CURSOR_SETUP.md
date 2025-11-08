# Cursor IDE Setup Guide for DJ Kurt Website

This guide will help you set up the DJ Kurt website project in Cursor IDE with proper SQL database integration.

## 🎯 Project Context

You're taking over a professional DJ website that was prototyped in Figma Make. The frontend is complete and functional, but the backend currently uses a simple KV (key-value) store. **Your task is to migrate to proper PostgreSQL tables in Supabase.**

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Supabase account created
- [ ] Cursor IDE installed

## 🚀 Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

Key dependencies you'll be working with:
- `@supabase/supabase-js` - Supabase client
- React, TypeScript, Tailwind CSS
- shadcn/ui components
- @dnd-kit for drag-and-drop

### 2. Set Up Supabase Project

#### Create a new Supabase project
```bash
# Initialize Supabase in your project
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref
```

#### Run the database migrations

Create a new migration file:
```bash
supabase migration new initial_schema
```

Copy the SQL schema from `README.md` (Database Schema section) into your migration file, then run:
```bash
supabase db push
```

#### Create Storage Buckets

In the Supabase Dashboard (Storage section), create these buckets:
1. **photos** - For gallery images
2. **testimonial-images** - For client photos  
3. **venue-logos** - For venue partner logos

Set policies for each bucket:
- **Read**: Public
- **Write/Delete**: Authenticated users only

### 3. Environment Configuration

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Update `/utils/supabase/info.tsx`:
```typescript
export const projectId = 'your-project-id';
export const publicAnonKey = 'your-anon-key';
```

### 4. Update Server Code for SQL

The server is currently using KV store. You need to migrate to SQL queries.

#### Example: Migrating Photos endpoint

**Current (KV store):**
```typescript
app.get("/make-server-200dbde6/cms/photos", async (c) => {
  const photos = await kv.get('photos');
  return c.json({ photos: photos || [] });
});
```

**New (SQL):**
```typescript
app.get("/make-server-200dbde6/cms/photos", async (c) => {
  const supabase = getServiceClient();
  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (error) {
    console.log('Get photos error:', error);
    return c.json({ error: 'Failed to get photos' }, 500);
  }
  
  return c.json({ photos: photos || [] });
});
```

### 5. Implement File Uploads to Supabase Storage

Replace base64 image handling with actual file uploads.

#### Frontend (ContentManager.tsx):
```typescript
const handlePhotoUpload = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be smaller than 5MB');
    return;
  }

  setUploadingPhoto(true);

  try {
    // Upload to server
    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', photoForm.alt);
    
    const result = await cmsAPI.uploadPhoto(formData);
    // Handle success
  } catch (error) {
    console.error('Upload error:', error);
    alert('Failed to upload photo');
  } finally {
    setUploadingPhoto(false);
  }
};
```

#### Backend (server/index.tsx):
```typescript
app.post("/make-server-200dbde6/cms/photos", requireAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Upload to Supabase Storage
    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const supabase = getServiceClient();
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.log('Storage upload error:', uploadError);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    // Get current max display_order
    const { data: maxOrder } = await supabase
      .from('photos')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const displayOrder = (maxOrder?.display_order || 0) + 1;

    // Insert into database
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        url: publicUrl,
        alt,
        display_order: displayOrder
      })
      .select()
      .single();

    if (dbError) {
      console.log('Database insert error:', dbError);
      return c.json({ error: 'Failed to save photo' }, 500);
    }

    return c.json({ success: true, photo });
  } catch (error) {
    console.log('Add photo error:', error);
    return c.json({ error: 'Failed to add photo' }, 500);
  }
});
```

### 6. Update All CRUD Operations

Apply similar migrations for:
- ✅ Photos (GET, POST, DELETE, reorder)
- ✅ Mixes (GET, POST, DELETE)
- ✅ Testimonials (GET, POST, PUT, DELETE)
- ✅ Venues (GET, POST, PUT, DELETE)
- ✅ Featured Video (GET, PUT)
- ✅ Contact Submissions (POST, GET)

### 7. Deploy Edge Function

```bash
# Deploy the server function to Supabase
supabase functions deploy make-server-200dbde6 --no-verify-jwt

# Set environment variables
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 8. Create Admin Account

Once the server is deployed:

1. Navigate to `http://localhost:5173/#admin-signup`
2. Create your admin account
3. Sign in at `http://localhost:5173/#admin`

## 🔍 Key Files to Update

### Priority 1: Server Migration
- `/supabase/functions/server/index.tsx` - All API routes

### Priority 2: Frontend Updates  
- `/components/ContentManager.tsx` - File upload handling
- `/utils/api.ts` - Update API calls for file uploads

### Priority 3: Contact Form
- `/components/Contact.tsx` - Connect to backend
- Add email notification integration (Resend/SendGrid)

## 🧪 Testing Checklist

- [ ] Admin signup/login works
- [ ] Photo upload to storage works
- [ ] Photo gallery displays correctly
- [ ] Photo drag-and-drop reorder persists
- [ ] Photo deletion removes from storage and database
- [ ] Mixes CRUD operations work
- [ ] Testimonials CRUD operations work
- [ ] Venues CRUD operations work
- [ ] Featured video update works
- [ ] Contact form submissions save to database
- [ ] All data persists after page reload
- [ ] Mobile responsiveness maintained

## 🐛 Common Issues & Solutions

### Issue: CORS errors when uploading files
**Solution:** Update CORS settings in Supabase Storage bucket settings

### Issue: "Failed to fetch" errors
**Solution:** Check Edge Function logs: `supabase functions logs make-server-200dbde6`

### Issue: File uploads timeout
**Solution:** Increase file size limit in edge function, or compress images client-side

### Issue: Images not loading
**Solution:** Verify storage bucket is set to public read access

## 📚 Helpful Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎯 Next Steps After Setup

1. **Seed Initial Data**: Add some sample photos, mixes, testimonials
2. **Test Contact Form**: Ensure submissions save correctly
3. **Email Integration**: Set up Resend or SendGrid for contact form emails
4. **Performance**: Optimize image sizes and implement lazy loading
5. **SEO**: Add meta tags, sitemap, robots.txt
6. **Analytics**: Integrate Google Analytics or Plausible
7. **Deploy**: Deploy frontend to Vercel/Netlify

## 💡 Pro Tips for Cursor IDE

- Use **Cursor Chat** to ask questions about specific code sections
- Use **Cmd+K** to generate code based on comments
- Use **Tab** to accept AI suggestions while coding
- Create a `.cursorrules` file with project context for better suggestions

## 🤝 Need Help?

Reference the full documentation in `README.md` for:
- Complete database schema
- Design system details
- Component architecture
- Deployment instructions

Good luck with the migration! 🚀
