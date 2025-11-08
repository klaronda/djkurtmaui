import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Play, Volume2, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { OptimizedSupabaseImage } from './OptimizedSupabaseImage';

// Compressed fallback image for video poster
const kurtPortraitImage =
  'https://oxecaqattfrvtrqhsvtn.supabase.co/storage/v1/render/image/public/photos/page-assets/aloha-2.jpg?width=1200&quality=80&format=webp';

interface Photo {
  id?: string;
  url: string;
  alt: string;
}

interface Mix {
  id?: string;
  title: string;
  embedUrl: string;
  platform: 'spotify' | 'mixcloud';
  description?: string;
}

interface VideoConfig {
  url: string;
  posterImage: string;
  title: string;
  description: string;
}

interface MediaProps {
  videoConfig?: VideoConfig;
  photos?: Photo[];
  mixes?: Mix[];
}

export function Media({ videoConfig, photos: customPhotos, mixes: customMixes }: MediaProps) {
  const [activeTab, setActiveTab] = useState('photos');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);

  useEffect(() => {
    const handlePlayRequest = () => setIsVideoPlaying(true);
    window.addEventListener('play-highlight-video', handlePlayRequest);
    return () => window.removeEventListener('play-highlight-video', handlePlayRequest);
  }, []);

  const renderPosterImage = () => {
    if (video.posterImage?.includes('/storage/v1/object/')) {
      return (
        <OptimizedSupabaseImage
          objectSrc={video.posterImage}
          alt={video.title}
          className="w-full h-full object-cover object-top opacity-70"
          sizes="(min-width: 768px) 960px, 100vw"
        />
      );
    }

    return (
      <img
        src={video.posterImage}
        alt={video.title}
        className="w-full h-full object-cover object-top opacity-70"
        loading="lazy"
        decoding="async"
      />
    );
  };

  const defaultVideo: VideoConfig = {
    url: 'https://www.youtube.com/watch?v=SapL-tOrNF8',
    posterImage: kurtPortraitImage,
    title: 'DJ Kurt Highlight Reel',
    description: 'See the magic in action'
  };

  const hasCustomPhotos = Array.isArray(customPhotos) && customPhotos.length > 0;
  const photos = hasCustomPhotos ? customPhotos : [];
  const video = videoConfig || defaultVideo;
  const mixes = customMixes || [];

  // Convert YouTube/Vimeo URL to embed URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    } else if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  };

  // Convert Spotify/Mixcloud URL to embed URL
  const getMixEmbedUrl = (mix: Mix) => {
    if (mix.platform === 'spotify') {
      // Handle Spotify URLs or URIs
      if (mix.embedUrl.includes('spotify.com')) {
        const parts = mix.embedUrl.split('spotify.com/')[1];
        return `https://open.spotify.com/embed/${parts}`;
      } else if (mix.embedUrl.startsWith('spotify:')) {
        const uri = mix.embedUrl.replace('spotify:', '').replace(/:/g, '/');
        return `https://open.spotify.com/embed/${uri}`;
      }
      return `https://open.spotify.com/embed/track/${mix.embedUrl}`;
    } else {
      // Mixcloud
      if (mix.embedUrl.includes('mixcloud.com')) {
        return `https://www.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(mix.embedUrl)}`;
      }
      return mix.embedUrl;
    }
  };

  return (
    <section id="media" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-6 text-gray-900">
            Media Gallery
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the energy and professionalism through our highlight reels, 
            sample mixes, and gallery of memorable moments.
          </p>
        </div>

        {/* Highlight Reel Section */}
        <div className="mb-16">
          <Card className="overflow-hidden shadow-2xl">
            <div className="relative h-96 bg-black">
              {!isVideoPlaying ? (
                <>
                  {/* Poster image with play button overlay */}
                  {renderPosterImage()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <button
                        onClick={() => setIsVideoPlaying(true)}
                        className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm hover:bg-white/30 hover:scale-110 transition-all duration-300"
                        aria-label={`Play ${video.title}`}
                      >
                        <Play size={36} className="ml-2" />
                      </button>
                      <h3 className="text-3xl mb-4">{video.title}</h3>
                      <p className="text-xl opacity-90 mb-6">{video.description}</p>
                      <Button 
                        size="lg"
                        onClick={() => setIsVideoPlaying(true)}
                        className="bg-white text-yellow-600 hover:bg-gray-100"
                      >
                        <Play size={20} className="mr-2" />
                        Watch Now
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <iframe
                  className="w-full h-full"
                  src={getEmbedUrl(video.url)}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-2 shadow-lg">
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'photos'
                  ? 'bg-yellow-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Photo Gallery
            </button>
            <button
              onClick={() => setActiveTab('mixes')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'mixes'
                  ? 'bg-yellow-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sample Mixes {mixes.length > 0 && `(${mixes.length})`}
            </button>
          </div>
        </div>

        {/* Photo Gallery */}
        {activeTab === 'photos' && (
          <>
            {hasCustomPhotos ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo, index) => (
                  <div 
                    key={photo.id || index}
                    className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="aspect-square">
                      {typeof photo.url === 'string' && photo.url.startsWith('https') ? (
                        <ImageWithFallback
                          src={photo.url}
                          alt={photo.alt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <img
                          src={photo.url}
                          alt={photo.alt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button 
                        variant="outline" 
                        className="bg-white/10 border-white text-white hover:bg-white hover:text-gray-900 backdrop-blur-sm"
                        onClick={() => setFullSizeImage(photo.url)}
                      >
                        <Maximize2 size={16} className="mr-2" />
                        View Full Size
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <Maximize2 size={40} className="text-gray-400" />
                </div>
                <h3 className="text-2xl mb-4 text-gray-700">No Gallery Photos Yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Upload images in the admin dashboard to showcase DJ Kurt’s latest events.
                </p>
              </div>
            )}
          </>
        )}

        {/* Sample Mixes */}
        {activeTab === 'mixes' && (
          <>
            {mixes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mixes.map((mix, index) => (
                  <Card key={mix.id || index} className="hover:shadow-lg transition-shadow overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
                        <div className="flex items-center gap-3 mb-2">
                          <Volume2 size={24} />
                          <h4 className="font-medium">{mix.title}</h4>
                        </div>
                        {mix.description && (
                          <p className="text-white/90 text-sm">{mix.description}</p>
                        )}
                        <div className="mt-2 text-xs opacity-80 capitalize">
                          {mix.platform === 'spotify' ? '🎵 Spotify' : '🎧 Mixcloud'}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white">
                        <iframe
                          src={getMixEmbedUrl(mix)}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allow="autoplay"
                          title={mix.title}
                          className="rounded"
                          style={{ height: '152px' }}
                        ></iframe>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <Volume2 size={40} className="text-gray-400" />
                </div>
                <h3 className="text-2xl mb-4 text-gray-700">No Sample Mixes Yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Sample mixes will appear here once they're added. Check back soon to hear DJ Kurt's signature sound!
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Full Size Image Dialog */}
      <Dialog open={!!fullSizeImage} onOpenChange={() => setFullSizeImage(null)}>
        <DialogContent className="max-w-6xl p-0 bg-transparent border-0 [&>button]:text-white [&>button]:hover:text-gray-300">
          <DialogTitle className="sr-only">
            Full Size Image
          </DialogTitle>
          <DialogDescription className="sr-only">
            Full size image preview
          </DialogDescription>
          {fullSizeImage && (
            <img
              src={fullSizeImage}
              alt="Full size preview"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
