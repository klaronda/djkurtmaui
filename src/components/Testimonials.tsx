import { Card, CardContent } from './ui/card';
import { Star, Quote } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Testimonial {
  id?: string;
  name: string;
  event: string;
  text: string;
  rating: number;
  image?: string;
}

interface Venue {
  id?: string;
  name: string;
  logo?: string;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
  venues?: Venue[];
}

export function Testimonials({ testimonials: customTestimonials, venues: customVenues }: TestimonialsProps) {
  const hasTestimonials = Array.isArray(customTestimonials) && customTestimonials.length > 0;
  const testimonials = hasTestimonials ? customTestimonials : [];

  const hasVenues = Array.isArray(customVenues) && customVenues.length > 0;
  const venues = hasVenues ? customVenues : [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-6 text-gray-900">
            What Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what couples, companies, 
            and families have to say about their experience with DJ Kurt.
          </p>
        </div>

        {/* Testimonials Grid */}
        {hasTestimonials ? (
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.id || index} className="relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="absolute top-4 right-4 text-yellow-400 opacity-20">
                    <Quote size={48} />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    {testimonial.image && (
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <ImageWithFallback
                          src={testimonial.image}
                          alt={`${testimonial.event} venue`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.event}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Quote size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl mb-4 text-gray-700">No Testimonials Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Testimonials you collect in the admin dashboard will appear here.
            </p>
          </div>
        )}

        {/* Trusted Venues Section */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl mb-8 text-center text-gray-900">
            Trusted by Maui's Premier Venues
          </h3>
          
          {hasVenues ? (
            <>
              <div className="flex flex-wrap justify-center gap-8">
                {venues.map((venue, index) => (
                  <div key={venue.id || index} className="text-center group flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center mb-3 group-hover:shadow-lg transition-shadow overflow-hidden">
                      {venue.logo ? (
                        venue.logo.startsWith('data:') || venue.logo.startsWith('https') ? (
                          <ImageWithFallback
                            src={venue.logo}
                            alt={venue.name}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <img
                            src={venue.logo}
                            alt={venue.name}
                            className="w-full h-full object-contain p-2"
                          />
                        )
                      ) : (
                        <span className="text-gray-700 font-bold text-lg">
                          {venue.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{venue.name}</p>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <p className="text-gray-600">
                  Experienced with luxury resorts, intimate venues, and everything in between
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h4 className="text-xl mb-2 text-gray-700">No Venues Listed Yet</h4>
              <p className="text-gray-500">
                Add partner venues in the admin dashboard to highlight trusted locations.
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl mb-4">Ready to Create Your Own Amazing Experience?</h3>
            <p className="text-xl mb-6 opacity-90">
              Join hundreds of satisfied clients who've trusted DJ Kurt with their special moments
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              {renderStars(5)}
              <span className="ml-2 text-white/90">5.0 Average Rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
