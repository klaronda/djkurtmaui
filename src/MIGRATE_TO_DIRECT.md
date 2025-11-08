# 🚀 Migrating from Edge Function to Direct Supabase Access

## Why Migrate?

**Edge Function (Current):**
- ❌ Extra server code to maintain
- ❌ Additional deployment step
- ❌ Extra network hop (slower)
- ❌ Costs per invocation
- ❌ More complex debugging

**Direct Supabase (New):**
- ✅ Simpler - no server code needed
- ✅ Faster - direct connection
- ✅ Free - no edge function costs
- ✅ Secure - RLS policies handle permissions
- ✅ Real-time ready - can use Supabase Realtime

## Migration Steps

### 1. Update Imports

Replace in `ContentManager.tsx` and other components:

**Old:**
```typescript
import { cmsAPI, authAPI } from '../utils/api'
```

**New:**
```typescript
import { photosAPI, mixesAPI, testimonialsAPI, venuesAPI, videoAPI } from '../utils/api-direct'
import { authAPI } from '../utils/api-direct'
import { supabase } from '../lib/supabase'
```

### 2. Update API Calls

**Photos:**
- `cmsAPI.getPhotos()` → `photosAPI.get()`
- `cmsAPI.addPhoto(formData)` → `photosAPI.upload(file, alt)`
- `cmsAPI.updatePhotos(photos)` → `photosAPI.updateOrder(photos)`
- `cmsAPI.deletePhoto(id)` → `photosAPI.delete(id)`

**Mixes:**
- `cmsAPI.getMixes()` → `mixesAPI.get()`
- `cmsAPI.addMix(mix)` → `mixesAPI.add(mix)`
- `cmsAPI.deleteMix(id)` → `mixesAPI.delete(id)`

**Testimonials:**
- `cmsAPI.getTestimonials()` → `testimonialsAPI.get()`
- `cmsAPI.addTestimonial(testimonial)` → `testimonialsAPI.add(testimonial)`
- `cmsAPI.updateTestimonial(id, testimonial)` → `testimonialsAPI.update(id, testimonial)`
- `cmsAPI.deleteTestimonial(id)` → `testimonialsAPI.delete(id)`

**Venues:**
- `cmsAPI.getVenues()` → `venuesAPI.get()`
- `cmsAPI.addVenue(venue)` → `venuesAPI.add(venue)`
- `cmsAPI.updateVenue(id, venue)` → `venuesAPI.update(id, venue)`
- `cmsAPI.deleteVenue(id)` → `venuesAPI.delete(id)`

**Video:**
- `cmsAPI.getVideo()` → `videoAPI.get()`
- `cmsAPI.updateVideo(url)` → `videoAPI.update({ url, posterImage })`

**Auth:**
- `authAPI.signin()` → `authAPI.signin()` (same interface)
- `authAPI.signout()` → `authAPI.signout()` (same interface)
- `authAPI.checkSession()` → `authAPI.getSession()` (returns `{ authenticated, user }`)

### 3. Update Photo Upload

**Old:**
```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('alt', photoForm.alt)
const result = await cmsAPI.addPhoto(formData)
```

**New:**
```typescript
const result = await photosAPI.upload(file, photoForm.alt)
```

### 4. Check Authentication

**Old:**
```typescript
const session = await authAPI.checkSession()
if (session.authenticated) { ... }
```

**New:**
```typescript
const { authenticated, user } = await authAPI.getSession()
if (authenticated) { ... }
```

Or use the helper:
```typescript
import { isAuthenticated } from '../lib/supabase'
if (await isAuthenticated()) { ... }
```

## RLS Policies Required

Make sure your RLS policies allow:
- **Public read** for content (photos, mixes, testimonials, venues)
- **Authenticated write** for CMS operations
- **Public insert** for contact form

These should already be set up in your migration file!

## Testing

1. Test photo upload - should go directly to Storage
2. Test authentication - should use Supabase Auth directly
3. Test all CRUD operations - should work without edge function
4. Check browser network tab - requests should go to `*.supabase.co` not `functions/v1/`

## Cleanup

Once everything works:
1. ✅ Delete edge function code (`src/supabase/functions/`)
2. ✅ Remove edge function deployment
3. ✅ Update documentation

## Benefits You'll See

- ⚡ Faster page loads (direct connection)
- 💰 Lower costs (no edge function invocations)
- 🔧 Easier debugging (all in browser DevTools)
- 📊 Better monitoring (Supabase dashboard shows all requests)
- 🔄 Real-time ready (can add subscriptions later)

