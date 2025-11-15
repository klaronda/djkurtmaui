import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { scrollToSection } from '../utils/scroll-section';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (sectionId: string, path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    scrollToSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className={`text-xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
            DJ Kurt Maui
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => navigateTo('home', '/')}
            className={`hover:text-yellow-500 transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            Home
          </button>
          <button 
            onClick={() => navigateTo('about', '/about')}
            className={`hover:text-yellow-500 transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            About
          </button>
          <button 
            onClick={() => navigateTo('services', '/services')}
            className={`hover:text-yellow-500 transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            Services
          </button>
          <button 
            onClick={() => navigateTo('media', '/media')}
            className={`hover:text-yellow-500 transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            Media
          </button>
          <button 
            onClick={() => navigateTo('testimonials', '/testimonials')}
            className={`hover:text-yellow-500 transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            Testimonials
          </button>
          <button 
            onClick={() => navigateTo('contact', '/contact')}
            className={`hover:text-yellow-500 transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            Contact
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigateTo('contact', '/book')}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white px-6 py-2"
          >
            Book Now
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <button 
              onClick={() => navigateTo('home', '/')}
              className="text-gray-700 hover:text-yellow-500 transition-colors text-left"
            >
              Home
            </button>
            <button 
              onClick={() => navigateTo('about', '/about')}
              className="text-gray-700 hover:text-yellow-500 transition-colors text-left"
            >
              About
            </button>
            <button 
              onClick={() => navigateTo('services', '/services')}
              className="text-gray-700 hover:text-yellow-500 transition-colors text-left"
            >
              Services
            </button>
            <button 
              onClick={() => navigateTo('media', '/media')}
              className="text-gray-700 hover:text-yellow-500 transition-colors text-left"
            >
              Media
            </button>
            <button 
              onClick={() => navigateTo('testimonials', '/testimonials')}
              className="text-gray-700 hover:text-yellow-500 transition-colors text-left"
            >
              Testimonials
            </button>
            <button 
              onClick={() => navigateTo('contact', '/contact')}
              className="text-gray-700 hover:text-yellow-500 transition-colors text-left"
            >
              Contact
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}