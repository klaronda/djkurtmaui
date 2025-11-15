import { useState } from 'react';
import { Button } from './ui/button';
import { Play } from 'lucide-react';
import { OptimizedSupabaseImage } from './OptimizedSupabaseImage';

// Hero image from Supabase Storage
const heroImageUrl =
  'https://oxecaqattfrvtrqhsvtn.supabase.co/storage/v1/object/public/photos/page-assets/hero.jpg';

export function Hero() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWatchReel = () => {
    const mediaSection = document.getElementById('media');
    if (mediaSection) {
      mediaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.dispatchEvent(new CustomEvent('play-highlight-video'));
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <OptimizedSupabaseImage
          objectSrc={heroImageUrl}
          alt="DJ Kurt at his professional setup with Maui oceanfront backdrop"
          className={`w-full h-full object-cover transition-opacity duration-1000 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          sizes="100vw"
          widths={[640, 960, 1280, 1600]}
          quality={60}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
          DJ Kurt Maui
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200">
          Weddings • Corporate Events • Private Parties
        </p>
        <p className="text-lg mb-12 text-gray-300 max-w-2xl mx-auto">
          Bringing the perfect soundtrack to your most important moments with professional expertise and island aloha
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={scrollToContact}
            size="lg"
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white px-8 py-4 text-lg"
          >
            Book Now
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white px-8 py-4 text-lg flex items-center gap-2"
            aria-label="Watch DJ Kurt's highlight reel video"
            onClick={handleWatchReel}
          >
            <Play size={20} aria-hidden="true" />
            Watch Reel
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}