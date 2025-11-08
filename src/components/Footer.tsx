import { Heart, Mail, Phone, Instagram, MessageCircle } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">K</span>
              </div>
              <span className="text-2xl font-bold">DJ Kurt Maui</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Bringing the perfect soundtrack to your most important moments with 
              professional expertise and authentic aloha spirit on beautiful Maui.
            </p>
            <div className="flex space-x-4">
              <a 
                href="mailto:djkurtmaui@gmail.com" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
              <a 
                href="tel:18082682272" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
                aria-label="Phone"
              >
                <Phone size={20} />
              </a>
              <a 
                href="https://instagram.com/kurtle808shellsmaui" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://wa.me/18082682272" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-lg">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#services" className="hover:text-yellow-400 transition-colors">Weddings</a></li>
              <li><a href="#services" className="hover:text-yellow-400 transition-colors">Corporate Events</a></li>
              <li><a href="#services" className="hover:text-yellow-400 transition-colors">Private Parties</a></li>
              <li><a href="#media" className="hover:text-yellow-400 transition-colors">Sample Mixes</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-lg">Contact</h4>
            <div className="space-y-2 text-gray-300">
              <p>djkurtmaui@gmail.com</p>
              <p>(808) 268-2272</p>
              <p>Serving all of Maui</p>
              <p>Response within 4-6 hours</p>
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <h4 className="mb-4 text-lg">Service Areas</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-gray-300">
            <span>Wailea</span>
            <span>Kihei</span>
            <span>Lahaina</span>
            <span>Kaʻanapali</span>
            <span>Makena</span>
            <span>Paia</span>
            <span>Hana</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} DJ Kurt Maui. All rights reserved.
            </p>
            <a 
              href="#admin" 
              className="text-gray-700 hover:text-gray-500 text-xs transition-colors"
              aria-label="Admin access"
            >
              •
            </a>
          </div>
          <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="text-red-500" size={16} />
            <span>in Maui</span>
          </div>
        </div>

        {/* SEO Keywords (hidden) */}
        <div className="sr-only">
          DJ Kurt Maui wedding DJ corporate events private parties Marbecca Method certified MC 
          Grand Wailea Four Seasons Hyatt Regency Ritz Carlton Fairmont Kea Lani Marriott Wailea 
          professional sound system wireless microphones event coordination Maui DJ services
        </div>
      </div>
    </footer>
  );
}