# Migration Guide: KV Store → PostgreSQL

This guide walks through migrating the DJ Kurt website from KV store to proper PostgreSQL tables in Supabase.

## Overview

The current implementation uses Supabase's KV (key-value) store for data persistence. This works for prototyping but lacks the structure, querying capabilities, and scalability of a relational database.

## What Needs to Change

### 1. Database Schema (✅ SQL Provided in README.md)

Run the SQL schema to create these tables:
- `featured_videos` - Store video configuration
- `photos` - Gallery images with ordering
- `mixes` - Spotify/Mixcloud embeds
- `testimonials` - Client reviews
- `venues` - Trusted venue partners
- `contact_submissions` - Contact form entries

### 2. Storage Buckets (Manual Setup Required)

Create these buckets in Supabase Dashboard:
1. **photos** - Gallery images
2. **testimonial-images** - Client photos
3. **venue-logos** - Venue partner logos

**Bucket Settings:**
- **Allowed MIME types**: image/jpeg, image/png, image/webp
- **Max file size**: 5MB
- **Public bucket**: Yes (with RLS for write protection)

### 3. Server Code Updates

#### A. Import Supabase Client

At the top of `/supabase/functions/server/index.tsx`:

```typescript
import { createClient } from "npm:@supabase/supabase-js@2";

const getServiceClient = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);
```

#### B. Replace KV Calls with SQL Queries

**Example: Photos endpoints**

OLD (KV):
```typescript
app.get("/make-server-200dbde6/cms/photos", async (c) => {
  const photos = await kv.get('photos');
  return c.json({ photos: photos || [] });
});
```

NEW (SQL):
```typescript
app.get("/make-server-200dbde6/cms/photos", async (c) => {
  try {
    const supabase = getServiceClient();
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return c.json({ photos: photos || [] });
  } catch (error) {
    console.log('Get photos error:', error);
    return c.json({ error: 'Failed to get photos' }, 500);
  }
});
```

#### C. Implement File Upload Endpoints

**Add multipart form data handling:**

```typescript
app.post("/make-server-200dbde6/cms/photos/upload", requireAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type' }, 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File too large (max 5MB)' }, 400);
    }

    const supabase = getServiceClient();
    
    // Upload to storage
    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    // Get max display_order
    const { data: maxData } = await supabase
      .from('photos')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const displayOrder = (maxData?.display_order || 0) + 1;

    // Insert record
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        url: publicUrl,
        alt,
        display_order: displayOrder
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return c.json({ success: true, photo });
  } catch (error) {
    console.log('Upload photo error:', error);
    return c.json({ error: 'Failed to upload photo' }, 500);
  }
});
```

#### D. Delete with Storage Cleanup

```typescript
app.delete("/make-server-200dbde6/cms/photos/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const supabase = getServiceClient();

    // Get photo to extract file path
    const { data: photo } = await supabase
      .from('photos')
      .select('url')
      .eq('id', id)
      .single();

    if (photo?.url) {
      // Extract file path from URL
      const urlParts = photo.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Delete from storage
      await supabase.storage
        .from('photos')
        .remove([fileName]);
    }

    // Delete from database
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete photo error:', error);
    return c.json({ error: 'Failed to delete photo' }, 500);
  }
});
```

#### E. Reorder Photos

```typescript
app.put("/make-server-200dbde6/cms/photos/reorder", requireAuth, async (c) => {
  try {
    const { photos } = await c.req.json();
    const supabase = getServiceClient();

    // Update display_order for each photo
    for (let i = 0; i < photos.length; i++) {
      await supabase
        .from('photos')
        .update({ display_order: i })
        .eq('id', photos[i].id);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Reorder photos error:', error);
    return c.json({ error: 'Failed to reorder photos' }, 500);
  }
});
```

### 4. Frontend Updates

#### A. Update API Utility (`/utils/api.ts`)

Add file upload method:

```typescript
export const cmsAPI = {
  // ... existing methods ...

  uploadPhoto: async (formData: FormData) => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE}/cms/photos/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token || publicAnonKey}`,
      },
      body: formData, // Don't set Content-Type, browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `Upload failed with status ${response.status}`);
    }

    return response.json();
  },

  reorderPhotos: async (photos: any[]) => {
    return fetchAPI('/cms/photos/reorder', {
      method: 'PUT',
      body: JSON.stringify({ photos }),
    });
  },
};
```

#### B. Update ContentManager (`/components/ContentManager.tsx`)

Replace base64 upload with file upload:

```typescript
const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', photoForm.alt || 'Gallery photo');

    const result = await cmsAPI.uploadPhoto(formData);
    
    if (result.success && result.photo) {
      // Reload photos from server
      await loadPhotos();
      setPhotoForm({ url: '', alt: '' });
      setSaveStatus('Photo uploaded successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    alert(error.message || 'Failed to upload photo');
  } finally {
    setUploadingPhoto(false);
  }
};
```

Update drag-and-drop handler:

```typescript
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);

    const newPhotos = arrayMove(photos, oldIndex, newIndex);
    setPhotos(newPhotos);

    try {
      await cmsAPI.reorderPhotos(newPhotos);
    } catch (error) {
      console.error('Reorder error:', error);
      // Revert on error
      loadPhotos();
    }
  }
};
```

Add data loading on mount:

```typescript
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    const [photosData, mixesData, testimonialsData, venuesData, videoData] = 
      await Promise.all([
        cmsAPI.getPhotos(),
        cmsAPI.getMixes(),
        cmsAPI.getTestimonials(),
        cmsAPI.getVenues(),
        cmsAPI.getVideo(),
      ]);

    setPhotos(photosData.photos || []);
    setMixes(mixesData.mixes || []);
    setTestimonials(testimonialsData.testimonials || []);
    setVenues(venuesData.venues || []);
    setVideoForm(videoData.video || defaultVideo);
  } catch (error) {
    console.error('Load data error:', error);
  }
};
```

### 5. Contact Form Integration

Update `/components/Contact.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setSubmitStatus(null);

  try {
    await contactAPI.submit(formData);
    setSubmitStatus('success');
    setFormData(initialFormData); // Reset form
  } catch (error) {
    console.error('Contact form error:', error);
    setSubmitStatus('error');
  } finally {
    setIsSubmitting(false);
  }
};
```

### 6. Deploy and Test

```bash
# Deploy edge function
supabase functions deploy make-server-200dbde6

# Set secrets
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key

# Test locally
npm run dev
```

## Testing Checklist

After migration, test each feature:

- [ ] Create admin account (signup)
- [ ] Login with admin account
- [ ] Upload a photo (should save to storage + database)
- [ ] View photo in gallery on public site
- [ ] Reorder photos with drag-and-drop (should persist)
- [ ] Delete a photo (should remove from storage + database)
- [ ] Add a mix (Spotify/Mixcloud)
- [ ] Delete a mix
- [ ] Add a testimonial
- [ ] Edit a testimonial
- [ ] Delete a testimonial
- [ ] Add a venue
- [ ] Upload venue logo
- [ ] Delete a venue
- [ ] Update featured video
- [ ] Submit contact form (check database for entry)
- [ ] Logout and verify session cleared
- [ ] Test on mobile device

## Common Issues

### Issue: File upload returns 413 (Payload Too Large)
**Solution:** Increase max body size in Supabase Edge Function config

### Issue: Storage upload works but URL is broken
**Solution:** Check bucket is set to public, verify RLS policies

### Issue: Can't delete photos
**Solution:** Ensure auth middleware is working, check RLS policies

### Issue: Reorder doesn't persist
**Solution:** Verify display_order is being updated in database

### Issue: CORS errors on file upload
**Solution:** Ensure CORS is enabled in edge function and storage bucket

## Rollback Plan

If issues occur, you can temporarily revert to KV store:
1. Keep old KV endpoints as backup
2. Add feature flag to switch between KV and SQL
3. Test thoroughly in staging before production migration

## Performance Optimization

After migration:
1. Add indexes on frequently queried columns
2. Implement image optimization (resize on upload)
3. Use CDN for storage bucket
4. Add caching headers
5. Implement pagination for large datasets

## Next Steps

After successful migration:
1. Remove KV store code
2. Add email notifications for contact form
3. Implement admin dashboard for viewing submissions
4. Add analytics tracking
5. Set up automated backups
6. Configure production environment variables
