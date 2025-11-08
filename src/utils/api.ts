import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-200dbde6`;

// Store access token in memory
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('dj_kurt_token', token);
  } else {
    localStorage.removeItem('dj_kurt_token');
  }
};

export const getAccessToken = () => {
  if (!accessToken) {
    accessToken = localStorage.getItem('dj_kurt_token');
  }
  return accessToken;
};

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token || publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  signup: async (email: string, password: string, name?: string) => {
    return fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  signin: async (email: string, password: string) => {
    const result = await fetchAPI('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.access_token) {
      setAccessToken(result.access_token);
    }
    return result;
  },

  checkSession: async () => {
    try {
      return await fetchAPI('/auth/session');
    } catch (error) {
      return { authenticated: false };
    }
  },

  signout: async () => {
    try {
      await fetchAPI('/auth/signout', { method: 'POST' });
    } finally {
      setAccessToken(null);
    }
  },
};

// CMS API
export const cmsAPI = {
  // Video
  getVideo: async () => {
    return fetchAPI('/cms/video');
  },

  updateVideo: async (url: string) => {
    return fetchAPI('/cms/video', {
      method: 'PUT',
      body: JSON.stringify({ url }),
    });
  },

  // Photos
  getPhotos: async () => {
    return fetchAPI('/cms/photos');
  },

  addPhoto: async (formData: FormData) => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE}/cms/photos`, {
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

  updatePhotos: async (photos: any[]) => {
    return fetchAPI('/cms/photos', {
      method: 'PUT',
      body: JSON.stringify({ photos }),
    });
  },

  deletePhoto: async (id: string) => {
    return fetchAPI(`/cms/photos/${id}`, {
      method: 'DELETE',
    });
  },

  // Mixes
  getMixes: async () => {
    return fetchAPI('/cms/mixes');
  },

  addMix: async (mix: any) => {
    return fetchAPI('/cms/mixes', {
      method: 'POST',
      body: JSON.stringify({ mix }),
    });
  },

  deleteMix: async (id: string) => {
    return fetchAPI(`/cms/mixes/${id}`, {
      method: 'DELETE',
    });
  },

  // Testimonials
  getTestimonials: async () => {
    return fetchAPI('/cms/testimonials');
  },

  addTestimonial: async (testimonial: any) => {
    return fetchAPI('/cms/testimonials', {
      method: 'POST',
      body: JSON.stringify({ testimonial }),
    });
  },

  updateTestimonial: async (id: string, testimonial: any) => {
    return fetchAPI(`/cms/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ testimonial }),
    });
  },

  deleteTestimonial: async (id: string) => {
    return fetchAPI(`/cms/testimonials/${id}`, {
      method: 'DELETE',
    });
  },

  // Venues
  getVenues: async () => {
    return fetchAPI('/cms/venues');
  },

  addVenue: async (venue: any) => {
    return fetchAPI('/cms/venues', {
      method: 'POST',
      body: JSON.stringify({ venue }),
    });
  },

  updateVenue: async (id: string, venue: any) => {
    return fetchAPI(`/cms/venues/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ venue }),
    });
  },

  deleteVenue: async (id: string) => {
    return fetchAPI(`/cms/venues/${id}`, {
      method: 'DELETE',
    });
  },
};

// Contact API
export const contactAPI = {
  submit: async (data: any) => {
    return fetchAPI('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async () => {
    return fetchAPI('/contact');
  },
};
