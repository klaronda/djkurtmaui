// DJ Kurt portrait image from Supabase Storage
const djKurtImage =
  'https://oxecaqattfrvtrqhsvtn.supabase.co/storage/v1/object/public/photos/page-assets/aloha-2.jpg';
import { Award, Music, Users } from 'lucide-react';
import { OptimizedSupabaseImage } from './OptimizedSupabaseImage';

export function About() {
  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl mb-6 text-gray-900">
              Aloha, I'm Kurt
            </h2>
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              Music is my passion, and creating unforgettable experiences is my purpose. 
              Based in beautiful Maui, I bring over a decade of professional DJ experience 
              to weddings, corporate events, and private celebrations.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              From intimate beach ceremonies to grand resort receptions, I understand that 
              every event tells a unique story. My approach combines technical expertise 
              with the warm aloha spirit that makes Maui special.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="text-white" size={24} />
                </div>
                <h4 className="mb-2 text-gray-900">10+ Years</h4>
                <p className="text-gray-600 text-sm">Professional Experience</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-white" size={24} />
                </div>
                <h4 className="mb-2 text-gray-900">500+ Events</h4>
                <p className="text-gray-600 text-sm">Successful Celebrations</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="text-white" size={24} />
                </div>
                <h4 className="mb-2 text-gray-900">Certified MC</h4>
                <p className="text-gray-600 text-sm">Marbecca Method Gold</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-400">
              <h4 className="mb-2 text-gray-900 flex items-center gap-2">
                <Award className="text-yellow-500" size={20} />
                Marbecca Method Gold MC Certification
              </h4>
              <p className="text-gray-600">
                Trained in professional wedding ceremony and reception management, 
                ensuring seamless event flow and unforgettable experiences.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="relative w-full h-full">
                <OptimizedSupabaseImage
                  objectSrc={djKurtImage}
                  alt="DJ Kurt at his professional setup in a beautiful outdoor venue with lush greenery"
                  className="w-full h-full object-cover"
                  sizes="(min-width: 1024px) 40vw, 80vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10"></div>
              </div>
            </div>
            
            {/* Floating accent elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}