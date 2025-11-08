import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Heart, Building, PartyPopper, Music, Mic, Clock } from 'lucide-react';
import { OptimizedSupabaseImage } from './OptimizedSupabaseImage';

// Service images from Supabase Storage
const weddingImage =
  'https://oxecaqattfrvtrqhsvtn.supabase.co/storage/v1/object/public/photos/page-assets/weddings.jpg';
const corporateEventImage =
  'https://oxecaqattfrvtrqhsvtn.supabase.co/storage/v1/object/public/photos/page-assets/corp-events.jpg';
const privatePartiesImage =
  'https://oxecaqattfrvtrqhsvtn.supabase.co/storage/v1/object/public/photos/page-assets/private-parties.jpg';

export function Services() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const services = [
    {
      title: "Weddings",
      icon: Heart,
      image: weddingImage,
      objectPosition: "object-bottom",
      description: "From ceremony to reception, create the perfect soundtrack for your special day with expertly curated playlists and professional MC services.",
      features: [
        "Professional MC training (Marbecca Method Gold)",
        "Curated wedding playlists for every moment",
        "Ceremony and reception coordination",
        "Special requests and dedications"
      ],
      gradient: "from-pink-400 to-rose-600"
    },
    {
      title: "Corporate Events",
      icon: Building,
      image: corporateEventImage,
      objectPosition: "object-center",
      description: "Reliable, versatile, and professional entertainment for company parties, conferences, and corporate gatherings across Maui.",
      features: [
        "Professional setup and breakdown",
        "Corporate-appropriate music selection",
        "Microphone and announcement services",
        "Flexible timing and coordination"
      ],
      gradient: "from-blue-400 to-blue-600"
    },
    {
      title: "Private Parties",
      icon: PartyPopper,
      image: privatePartiesImage,
      objectPosition: "object-center",
      description: "Bring the local aloha spirit to your intimate celebrations, from baby showers to graduation parties and birthday celebrations.",
      features: [
        "Local community vibe and aloha spirit",
        "Personalized music for your celebration",
        "Intimate and family-friendly atmosphere",
        "Flexible packages for any budget"
      ],
      gradient: "from-green-400 to-emerald-600"
    }
  ];

  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-6 text-gray-900">
            Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional DJ services tailored to your unique celebration, 
            bringing the perfect blend of expertise and aloha spirit to every event.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative h-64 overflow-hidden">
                  <OptimizedSupabaseImage
                    objectSrc={service.image}
                    alt={`${service.title} service`}
                    className={`w-full h-full object-cover ${service.objectPosition} group-hover:scale-110 transition-transform duration-300`}
                    sizes="(min-width: 1024px) 30vw, 90vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-80`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <IconComponent size={48} className="mx-auto mb-4" />
                      <h3 className="text-2xl">{service.title}</h3>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-8">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={scrollToContact}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white"
                  >
                    Request Quote
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Services Info */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl mb-6 text-center text-gray-900">What's Included</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="text-white" size={24} />
              </div>
              <h4 className="mb-2 text-gray-900">Professional Sound System</h4>
              <p className="text-gray-600">High-quality audio equipment for crystal clear sound</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="text-white" size={24} />
              </div>
              <h4 className="mb-2 text-gray-900">Wireless Microphones</h4>
              <p className="text-gray-600">For speeches, toasts, and announcements</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white" size={24} />
              </div>
              <h4 className="mb-2 text-gray-900">Setup & Breakdown</h4>
              <p className="text-gray-600">Complete event coordination from start to finish</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}