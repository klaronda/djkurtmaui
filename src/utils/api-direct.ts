// Direct Supabase API - No edge function needed!
// This uses Supabase client directly from the frontend

import { supabase } from '../lib/supabase'

// ==================== AUTH API ====================
export const authAPI = {
  signup: async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || 'Admin'
        },
        // Note: Email confirmation may be required depending on Supabase settings
        // If email confirmation is disabled, user will be automatically signed in
      }
    })

    if (error) throw new Error(error.message)
    
    // If email confirmation is required, session will be null
    // User will need to check their email and confirm before signing in
    if (!data.session) {
      return { 
        success: true, 
        user: data.user, 
        session: null,
        message: 'Please check your email to confirm your account before signing in.'
      }
    }
    
    return { success: true, user: data.user, session: data.session }
  },

  signin: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw new Error(error.message)
    return { 
      success: true, 
      access_token: data.session?.access_token,
      user: data.user 
    }
  },

  signout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
    return { success: true }
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw new Error(error.message)
    return { authenticated: !!session, user: session?.user }
  },
}

// ==================== CMS API ====================

// Featured Video
export const videoAPI = {
  get: async () => {
    const { data, error } = await supabase
      .from('featured_videos')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()
    
    if (error) throw new Error(error.message)
    if (!data) return { video: { url: '', posterImage: '' } }
    return { video: { url: data.url, posterImage: data.poster_image || '' } }
  },

  update: async (video: { url: string; posterImage?: string }) => {
    // Check if record exists
    const { data: existing } = await supabase
      .from('featured_videos')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('featured_videos')
        .update({ url: video.url, poster_image: video.posterImage || null })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw new Error(error.message)
      return { success: true, video: { url: data.url, posterImage: data.poster_image || '' } }
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('featured_videos')
        .insert({ url: video.url, poster_image: video.posterImage || null, is_active: true })
        .select()
        .single()
      
      if (error) throw new Error(error.message)
      return { success: true, video: { url: data.url, posterImage: data.poster_image || '' } }
    }
  },
}

// Photos - Direct Storage + Database
export const photosAPI = {
  get: async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) throw new Error(error.message)
    // Map UUIDs to strings for frontend compatibility
    return { photos: (data || []).map(p => ({ ...p, id: p.id.toString() })) }
  },

  upload: async (file: File, alt: string) => {
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 5MB.')
    }

    // Generate unique filename
    const fileName = `${crypto.randomUUID()}-${file.name}`

    // Upload to Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    // Get current max display_order
    const { data: maxOrderData } = await supabase
      .from('photos')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const displayOrder = (maxOrderData?.display_order ?? -1) + 1

    // Insert into database
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        url: publicUrl,
        alt: alt || 'Gallery photo',
        display_order: displayOrder
      })
      .select()
      .single()

    if (dbError) {
      // Clean up uploaded file on error
      await supabase.storage.from('photos').remove([fileName])
      throw new Error(`Database error: ${dbError.message}`)
    }

    return { success: true, photo: { ...photo, id: photo.id.toString() } }
  },

  updateOrder: async (photos: Array<{ id: string }>) => {
    // Update display_order for each photo
    const updates = photos.map((photo, index) =>
      supabase
        .from('photos')
        .update({ display_order: index })
        .eq('id', photo.id)
    )

    const results = await Promise.all(updates)
    const errors = results.filter(r => r.error)
    
    if (errors.length > 0) {
      throw new Error(`Failed to update order: ${errors[0].error?.message}`)
    }

    return { success: true }
  },

  delete: async (id: string) => {
    // Get photo to extract file path
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('url')
      .eq('id', id)
      .single()

    if (fetchError || !photo) {
      throw new Error('Photo not found')
    }

    // Extract file name from URL
    if (photo.url) {
      const urlParts = photo.url.split('/')
      const fileName = urlParts[urlParts.length - 1].split('?')[0]
      
      // Delete from storage (don't fail if this errors)
      await supabase.storage.from('photos').remove([fileName])
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', id)

    if (dbError) {
      throw new Error(`Delete failed: ${dbError.message}`)
    }

    return { success: true }
  },
}

// Mixes
export const mixesAPI = {
  get: async () => {
    const { data, error } = await supabase
      .from('mixes')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) throw new Error(error.message)
    // Map database columns to frontend format
    return { mixes: (data || []).map(m => ({ ...m, embedUrl: m.embed_url, id: m.id.toString() })) }
  },

  add: async (mix: { title: string; embedUrl: string; platform: string; description?: string }) => {
    const { data, error } = await supabase
      .from('mixes')
      .insert({
        title: mix.title,
        embed_url: mix.embedUrl,
        platform: mix.platform,
        description: mix.description || null,
        display_order: 0 // Will be updated if needed
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return { success: true, mix: { ...data, embedUrl: data.embed_url } }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('mixes')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return { success: true }
  },
}

// Testimonials
export const testimonialsAPI = {
  get: async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) throw new Error(error.message)
    // Map database columns to frontend format
    return { testimonials: (data || []).map(t => ({ ...t, image: t.image_url, id: t.id.toString() })) }
  },

  uploadImage: async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 5MB.')
    }

    const fileName = `${crypto.randomUUID()}-${file.name}`

    const bucketName = 'testimonial-images'

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    return { success: true, url: publicUrl }
  },

  add: async (testimonial: { name: string; event: string; text: string; rating: number; image?: string }) => {
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        name: testimonial.name,
        event: testimonial.event,
        text: testimonial.text,
        rating: testimonial.rating,
        image_url: testimonial.image || null,
        display_order: 0
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return { success: true, testimonial: { ...data, image: data.image_url, id: data.id.toString() } }
  },

  update: async (id: string, testimonial: { name: string; event: string; text: string; rating: number; image?: string }) => {
    const { data, error } = await supabase
      .from('testimonials')
      .update({
        name: testimonial.name,
        event: testimonial.event,
        text: testimonial.text,
        rating: testimonial.rating,
        image_url: testimonial.image || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return { success: true, testimonial: { ...data, image: data.image_url, id: data.id.toString() } }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return { success: true }
  },
}

// Venues
export const venuesAPI = {
  get: async () => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) throw new Error(error.message)
    // Map database columns to frontend format
    return { venues: (data || []).map(v => ({ ...v, logo: v.logo_url, id: v.id.toString() })) }
  },

  add: async (venue: { name: string; logo?: string }) => {
    const { data, error } = await supabase
      .from('venues')
      .insert({
        name: venue.name,
        logo_url: venue.logo || null,
        display_order: 0
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return { success: true, venue: { ...data, logo: data.logo_url, id: data.id.toString() } }
  },

  update: async (id: string, venue: { name: string; logo?: string }) => {
    const { data, error } = await supabase
      .from('venues')
      .update({
        name: venue.name,
        logo_url: venue.logo || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return { success: true, venue: { ...data, logo: data.logo_url, id: data.id.toString() } }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return { success: true }
  },
}

// Contact Form
export const contactAPI = {
  submit: async (formData: { name: string; email: string; phone?: string; message: string; eventDate?: string; eventType?: string }) => {
    console.log('Submitting contact form:', { name: formData.name, email: formData.email, eventType: formData.eventType || 'other' })
    
    const { data: submission, error } = await supabase
      .from('contact_submissions')
      .insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message,
        event_date: formData.eventDate || null,
        event_type: formData.eventType || 'other' // Required field
      })
      .select()
      .single()

    if (error) {
      console.error('Contact form submission error:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw new Error(error.message)
    }
    
    console.log('Contact form submitted successfully:', submission)
    return { success: true, id: submission.id.toString() }
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(error.message)
    return { contacts: data || [] }
  },
}

