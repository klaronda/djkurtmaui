import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Supabase clients
const getServiceClient = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const getAnonClient = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Auth middleware
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Authorization token required' }, 401);
  }

  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.log('Authorization error in requireAuth middleware:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', user.id);
  await next();
};

// Health check endpoint
app.get("/make-server-200dbde6/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ROUTES ====================

// Sign up new admin user
app.post("/make-server-200dbde6/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || 'Admin' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Sign up error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Sign up error:', error);
    return c.json({ error: 'Sign up failed' }, 500);
  }
});

// Sign in
app.post("/make-server-200dbde6/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    const supabase = getAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Sign in error:', error);
      return c.json({ error: error.message }, 401);
    }

    return c.json({ 
      success: true, 
      access_token: data.session?.access_token,
      user: data.user 
    });
  } catch (error) {
    console.log('Sign in error:', error);
    return c.json({ error: 'Sign in failed' }, 500);
  }
});

// Check session
app.get("/make-server-200dbde6/auth/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ authenticated: false }, 200);
    }

    const supabase = getServiceClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ authenticated: false }, 200);
    }

    return c.json({ authenticated: true, user });
  } catch (error) {
    console.log('Session check error:', error);
    return c.json({ authenticated: false }, 200);
  }
});

// Sign out
app.post("/make-server-200dbde6/auth/signout", requireAuth, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    await supabase.auth.admin.signOut(accessToken ?? '');
    return c.json({ success: true });
  } catch (error) {
    console.log('Sign out error:', error);
    return c.json({ error: 'Sign out failed' }, 500);
  }
});

// ==================== CMS ROUTES ====================

// Featured Video
app.get("/make-server-200dbde6/cms/video", async (c) => {
  try {
    const video = await kv.get('featured_video');
    return c.json({ video: video || '' });
  } catch (error) {
    console.log('Get video error:', error);
    return c.json({ error: 'Failed to get video' }, 500);
  }
});

app.put("/make-server-200dbde6/cms/video", requireAuth, async (c) => {
  try {
    const { url } = await c.req.json();
    await kv.set('featured_video', url);
    return c.json({ success: true });
  } catch (error) {
    console.log('Update video error:', error);
    return c.json({ error: 'Failed to update video' }, 500);
  }
});

// Photos
app.get("/make-server-200dbde6/cms/photos", async (c) => {
  try {
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
  } catch (error) {
    console.log('Get photos error:', error);
    return c.json({ error: 'Failed to get photos' }, 500);
  }
});

app.post("/make-server-200dbde6/cms/photos", requireAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, 400);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File too large. Maximum size is 5MB.' }, 400);
    }

    const supabase = getServiceClient();
    
    // Upload to Supabase Storage
    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.log('Storage upload error:', uploadError);
      return c.json({ error: 'Failed to upload file to storage' }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    // Get current max display_order from database
    const { data: maxOrderData } = await supabase
      .from('photos')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const displayOrder = (maxOrderData?.display_order ?? -1) + 1;

    // Insert into database
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        url: publicUrl,
        alt: alt || 'Gallery photo',
        display_order: displayOrder
      })
      .select()
      .single();

    if (dbError) {
      console.log('Database insert error:', dbError);
      // Try to clean up uploaded file
      await supabase.storage.from('photos').remove([fileName]);
      return c.json({ error: 'Failed to save photo to database' }, 500);
    }

    return c.json({ success: true, photo: { id: photo.id, url: photo.url, alt: photo.alt } });
  } catch (error) {
    console.log('Add photo error:', error);
    return c.json({ error: 'Failed to add photo' }, 500);
  }
});

app.put("/make-server-200dbde6/cms/photos", requireAuth, async (c) => {
  try {
    const { photos } = await c.req.json();
    const supabase = getServiceClient();

    // Update display_order for each photo
    for (let i = 0; i < photos.length; i++) {
      const { error } = await supabase
        .from('photos')
        .update({ display_order: i })
        .eq('id', photos[i].id);

      if (error) {
        console.log(`Error updating photo ${photos[i].id}:`, error);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Update photos error:', error);
    return c.json({ error: 'Failed to update photos' }, 500);
  }
});

app.delete("/make-server-200dbde6/cms/photos/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const supabase = getServiceClient();

    // Get photo to extract file path
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('url')
      .eq('id', id)
      .single();

    if (fetchError || !photo) {
      return c.json({ error: 'Photo not found' }, 404);
    }

    // Extract file name from URL
    if (photo.url) {
      const urlParts = photo.url.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params if any
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([fileName]);

      if (storageError) {
        console.log('Storage delete error:', storageError);
        // Continue with database delete even if storage delete fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.log('Database delete error:', dbError);
      return c.json({ error: 'Failed to delete photo from database' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete photo error:', error);
    return c.json({ error: 'Failed to delete photo' }, 500);
  }
});

// Mixes
app.get("/make-server-200dbde6/cms/mixes", async (c) => {
  try {
    const mixes = await kv.get('mixes');
    return c.json({ mixes: mixes || [] });
  } catch (error) {
    console.log('Get mixes error:', error);
    return c.json({ error: 'Failed to get mixes' }, 500);
  }
});

app.post("/make-server-200dbde6/cms/mixes", requireAuth, async (c) => {
  try {
    const { mix } = await c.req.json();
    const mixes = await kv.get('mixes') || [];
    mixes.push(mix);
    await kv.set('mixes', mixes);
    return c.json({ success: true, mixes });
  } catch (error) {
    console.log('Add mix error:', error);
    return c.json({ error: 'Failed to add mix' }, 500);
  }
});

app.delete("/make-server-200dbde6/cms/mixes/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const mixes = await kv.get('mixes') || [];
    const filtered = mixes.filter((m: any) => m.id !== id);
    await kv.set('mixes', filtered);
    return c.json({ success: true, mixes: filtered });
  } catch (error) {
    console.log('Delete mix error:', error);
    return c.json({ error: 'Failed to delete mix' }, 500);
  }
});

// Testimonials
app.get("/make-server-200dbde6/cms/testimonials", async (c) => {
  try {
    const testimonials = await kv.get('testimonials');
    return c.json({ testimonials: testimonials || [] });
  } catch (error) {
    console.log('Get testimonials error:', error);
    return c.json({ error: 'Failed to get testimonials' }, 500);
  }
});

app.post("/make-server-200dbde6/cms/testimonials", requireAuth, async (c) => {
  try {
    const { testimonial } = await c.req.json();
    const testimonials = await kv.get('testimonials') || [];
    testimonials.push(testimonial);
    await kv.set('testimonials', testimonials);
    return c.json({ success: true, testimonials });
  } catch (error) {
    console.log('Add testimonial error:', error);
    return c.json({ error: 'Failed to add testimonial' }, 500);
  }
});

app.put("/make-server-200dbde6/cms/testimonials/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const { testimonial } = await c.req.json();
    const testimonials = await kv.get('testimonials') || [];
    const index = testimonials.findIndex((t: any) => t.id === id);
    if (index !== -1) {
      testimonials[index] = testimonial;
      await kv.set('testimonials', testimonials);
    }
    return c.json({ success: true, testimonials });
  } catch (error) {
    console.log('Update testimonial error:', error);
    return c.json({ error: 'Failed to update testimonial' }, 500);
  }
});

app.delete("/make-server-200dbde6/cms/testimonials/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const testimonials = await kv.get('testimonials') || [];
    const filtered = testimonials.filter((t: any) => t.id !== id);
    await kv.set('testimonials', filtered);
    return c.json({ success: true, testimonials: filtered });
  } catch (error) {
    console.log('Delete testimonial error:', error);
    return c.json({ error: 'Failed to delete testimonial' }, 500);
  }
});

// Venues
app.get("/make-server-200dbde6/cms/venues", async (c) => {
  try {
    const venues = await kv.get('venues');
    return c.json({ venues: venues || [] });
  } catch (error) {
    console.log('Get venues error:', error);
    return c.json({ error: 'Failed to get venues' }, 500);
  }
});

app.post("/make-server-200dbde6/cms/venues", requireAuth, async (c) => {
  try {
    const { venue } = await c.req.json();
    const venues = await kv.get('venues') || [];
    venues.push(venue);
    await kv.set('venues', venues);
    return c.json({ success: true, venues });
  } catch (error) {
    console.log('Add venue error:', error);
    return c.json({ error: 'Failed to add venue' }, 500);
  }
});

app.put("/make-server-200dbde6/cms/venues/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const { venue } = await c.req.json();
    const venues = await kv.get('venues') || [];
    const index = venues.findIndex((v: any) => v.id === id);
    if (index !== -1) {
      venues[index] = venue;
      await kv.set('venues', venues);
    }
    return c.json({ success: true, venues });
  } catch (error) {
    console.log('Update venue error:', error);
    return c.json({ error: 'Failed to update venue' }, 500);
  }
});

app.delete("/make-server-200dbde6/cms/venues/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const venues = await kv.get('venues') || [];
    const filtered = venues.filter((v: any) => v.id !== id);
    await kv.set('venues', filtered);
    return c.json({ success: true, venues: filtered });
  } catch (error) {
    console.log('Delete venue error:', error);
    return c.json({ error: 'Failed to delete venue' }, 500);
  }
});

// ==================== CONTACT FORM ====================

app.post("/make-server-200dbde6/contact", async (c) => {
  try {
    const submission = await c.req.json();
    const contact = {
      ...submission,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    
    // Store in KV with unique key
    await kv.set(`contact_${contact.id}`, contact);
    
    return c.json({ success: true, id: contact.id });
  } catch (error) {
    console.log('Contact form submission error:', error);
    return c.json({ error: 'Failed to submit contact form' }, 500);
  }
});

app.get("/make-server-200dbde6/contact", requireAuth, async (c) => {
  try {
    const contacts = await kv.getByPrefix('contact_');
    return c.json({ contacts: contacts || [] });
  } catch (error) {
    console.log('Get contacts error:', error);
    return c.json({ error: 'Failed to get contacts' }, 500);
  }
});

Deno.serve(app.fetch);