import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { Media } from './components/Media';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ContentManager } from './components/ContentManager';
import { AdminLogin } from './components/AdminLogin';
import { AdminSignup } from './components/AdminSignup';
// Use direct Supabase auth - no edge function needed!
import { authAPI, photosAPI, mixesAPI, testimonialsAPI, venuesAPI, videoAPI } from './utils/api-direct';
import { supabase } from './lib/supabase';

interface Photo {
  id: string;
  url: string;
  alt: string;
}

interface Mix {
  id: string;
  title: string;
  embedUrl: string;
  platform: 'spotify' | 'mixcloud';
  description?: string;
}

interface Testimonial {
  id: string;
  name: string;
  event: string;
  text: string;
  rating: number;
  image?: string;
}

interface Venue {
  id: string;
  name: string;
  logo?: string;
}

interface VideoConfig {
  url: string;
  posterImage: string;
  title: string;
  description: string;
}

interface ContentData {
  video: VideoConfig;
  photos: Photo[];
  mixes: Mix[];
  testimonials: Testimonial[];
  venues: Venue[];
}

type Route = 'home' | 'admin-login' | 'admin-signup' | 'admin-cms';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [contentData, setContentData] = useState<ContentData>({
    video: {
      url: 'https://www.youtube.com/watch?v=SapL-tOrNF8',
      posterImage: '/assets/aae595903ed30eb623954fca611db78d5dec09fd.png',
      title: 'DJ Kurt Highlight Reel',
      description: 'See the magic in action'
    },
    photos: [],
    mixes: [
      {
        id: '1',
        title: 'Tropical House Sunset Mix',
        embedUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6',
        platform: 'spotify',
        description: 'Perfect beach vibes for your Maui celebration'
      },
      {
        id: '2',
        title: 'Wedding Reception Mix 2024',
        embedUrl: 'https://www.mixcloud.com/discover/wedding/',
        platform: 'mixcloud',
        description: 'A blend of classics and modern hits'
      },
      {
        id: '3',
        title: 'Corporate Event Mix',
        embedUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWXti3N4Wp5xy',
        platform: 'spotify',
        description: 'Upbeat yet professional atmosphere'
      }
    ],
    testimonials: [],
    venues: []
  });

  // Load public-facing content on mount (gallery photos, mixes, testimonials, venues, featured video)
  useEffect(() => {
    const loadPublicContent = async () => {
      try {
        const [videoRes, photosRes, mixesRes, testimonialsRes, venuesRes] = await Promise.all([
          videoAPI.get().catch(() => ({ video: undefined })),
          photosAPI.get().catch(() => ({ photos: [] })),
          mixesAPI.get().catch(() => ({ mixes: [] })),
          testimonialsAPI.get().catch(() => ({ testimonials: [] })),
          venuesAPI.get().catch(() => ({ venues: [] })),
        ]);

        setContentData(prev => ({
          video: videoRes.video?.url
            ? {
                ...prev.video,
                url: videoRes.video.url,
                posterImage: videoRes.video.posterImage || prev.video.posterImage,
              }
            : prev.video,
          photos: photosRes.photos ?? [],
          mixes: mixesRes.mixes ?? [],
          testimonials: testimonialsRes.testimonials ?? [],
          venues: venuesRes.venues ?? [],
        }));
      } catch (error) {
        console.error('Failed to load public content:', error);
      }
    };

    loadPublicContent();
  }, []);

  // Check authentication status and URL on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        // Use direct Supabase auth
        const { authenticated } = await authAPI.getSession();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.log('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    // Simple URL-based routing using hash
    const handleHashChange = async () => {
      const hash = window.location.hash.slice(1); // Remove the '#'
      
      if (hash === 'admin') {
        try {
          const { authenticated } = await authAPI.getSession();
          if (authenticated) {
            setCurrentRoute('admin-cms');
            setIsAuthenticated(true);
          } else {
            setCurrentRoute('admin-login');
            setIsAuthenticated(false);
          }
        } catch (error) {
          setCurrentRoute('admin-login');
          setIsAuthenticated(false);
        }
      } else if (hash === 'admin-signup') {
        setCurrentRoute('admin-signup');
      } else {
        setCurrentRoute('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      subscription.unsubscribe();
    };
  }, []);

  const handleContentUpdate = (data: ContentData) => {
    setContentData(data);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentRoute('admin-cms');
  };

  const handleLogout = async () => {
    try {
      await authAPI.signout();
    } catch (error) {
      console.log('Logout error:', error);
    }
    setIsAuthenticated(false);
    window.location.hash = '';
    setCurrentRoute('home');
  };

  const handleBackToSite = () => {
    window.location.hash = '';
    setCurrentRoute('home');
  };

  // Render based on current route
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (currentRoute === 'admin-signup') {
    return <AdminSignup onSuccess={() => window.location.hash = 'admin'} onBackToLogin={() => window.location.hash = 'admin'} />;
  }

  if (currentRoute === 'admin-login') {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (currentRoute === 'admin-cms' && isAuthenticated) {
    return (
      <ContentManager 
        onContentUpdate={handleContentUpdate}
        onLogout={handleLogout}
        onBackToSite={handleBackToSite}
      />
    );
  }

  // Main website
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Media 
          videoConfig={contentData.video}
          photos={contentData.photos}
          mixes={contentData.mixes}
        />
        <Testimonials 
          testimonials={contentData.testimonials}
          venues={contentData.venues}
        />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
