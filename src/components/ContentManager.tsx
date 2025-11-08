import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, Trash2, GripVertical, LogOut, Home, Save } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Alert, AlertDescription } from './ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
// Direct Supabase APIs - no edge function needed!
import { photosAPI, mixesAPI, testimonialsAPI, venuesAPI, videoAPI } from '../utils/api-direct';

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

const STORAGE_KEY = 'djkurt_content_data';

// Sortable item component
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center gap-2 bg-white border rounded-lg p-4 mb-2">
        <button {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="text-gray-400" size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function ContentManager({ 
  onContentUpdate,
  onLogout,
  onBackToSite
}: { 
  onContentUpdate: (data: ContentData) => void;
  onLogout: () => void;
  onBackToSite: () => void;
}) {
  const [contentData, setContentData] = useState<ContentData>({
    video: {
      url: 'https://www.youtube.com/watch?v=SapL-tOrNF8',
      posterImage: '/assets/aae595903ed30eb623954fca611db78d5dec09fd.png',
      title: 'DJ Kurt Highlight Reel',
      description: 'See the magic in action'
    },
    photos: [],
    mixes: [],
    testimonials: [],
    venues: []
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'photo' | 'mix' | 'testimonial' | 'venue';
    id: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load data from Supabase directly
  useEffect(() => {
    const loadData = async () => {
      try {
        const [photosData, mixesData, testimonialsData, venuesData, videoData] = 
          await Promise.all([
            photosAPI.get().catch(() => ({ photos: [] })),
            mixesAPI.get().catch(() => ({ mixes: [] })),
            testimonialsAPI.get().catch(() => ({ testimonials: [] })),
            venuesAPI.get().catch(() => ({ venues: [] })),
            videoAPI.get().catch(() => ({ video: contentData.video })),
          ]);

        const completeData = {
          video: videoData.video || contentData.video,
          photos: photosData.photos || [],
          mixes: mixesData.mixes || [],
          testimonials: testimonialsData.testimonials || [],
          venues: venuesData.venues || []
        };
        setContentData(completeData);
        onContentUpdate(completeData);
      } catch (e) {
        console.error('Failed to load data from Supabase:', e);
        // Fallback to localStorage if API fails
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const completeData = {
          video: parsed.video || contentData.video,
          photos: parsed.photos || [],
          mixes: parsed.mixes || [],
          testimonials: parsed.testimonials || [],
          venues: parsed.venues || []
        };
        setContentData(completeData);
        onContentUpdate(completeData);
          } catch (parseError) {
        console.error('Failed to parse saved content data');
      }
    }
      }
    };
    loadData();
  }, []);

  // Save data to localStorage
  const saveData = (data: ContentData) => {
    setContentData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    onContentUpdate(data);
    setSaveStatus('Saved successfully');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Video management
  const [videoForm, setVideoForm] = useState(contentData.video);
  
  const updateVideo = async () => {
    try {
      await videoAPI.update({ url: videoForm.url, posterImage: videoForm.posterImage });
    saveData({ ...contentData, video: videoForm });
    } catch (error: any) {
      console.error('Update video error:', error);
      alert(error.message || 'Failed to update video');
    }
  };

  // Photo management
  const [photoForm, setPhotoForm] = useState({ url: '', alt: '' });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    if (!photoForm.alt) {
      alert('Please enter an alt text for the image');
      return;
    }

    if (contentData.photos.length >= 12) {
      alert('Maximum 12 photos allowed');
      return;
    }

    setUploadingPhoto(true);

    try {
      // Upload directly to Supabase Storage
      const result = await photosAPI.upload(file, photoForm.alt);
      
      if (result.success && result.photo) {
        // Reload photos from Supabase
        const photosData = await photosAPI.get();
        const updatedPhotos = photosData.photos || [];
        saveData({ ...contentData, photos: updatedPhotos });
    setPhotoForm({ url: '', alt: '' });
        setSaveStatus('Photo uploaded successfully');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const addPhoto = () => {
    // This is now handled in handlePhotoUpload
    // Keeping for backwards compatibility but it won't be called
  };

  const deletePhoto = (id: string) => {
    setDeleteConfirmation({ type: 'photo', id });
  };

  const confirmDeletePhoto = async (id: string) => {
    try {
      await photosAPI.delete(id);
      // Reload photos from Supabase
      const photosData = await photosAPI.get();
      const updatedPhotos = photosData.photos || [];
      saveData({ ...contentData, photos: updatedPhotos });
    setDeleteConfirmation(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete photo');
    }
  };

  const handlePhotoDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = contentData.photos.findIndex(p => p.id === active.id);
      const newIndex = contentData.photos.findIndex(p => p.id === over.id);
      const newPhotos = arrayMove(contentData.photos, oldIndex, newIndex);
      
      // Update UI immediately
      saveData({ ...contentData, photos: newPhotos });
      
      // Save to Supabase
      try {
        await photosAPI.updateOrder(newPhotos);
      } catch (error: any) {
        console.error('Reorder error:', error);
        // Reload from Supabase on error
        const photosData = await photosAPI.get();
        const updatedPhotos = photosData.photos || [];
        saveData({ ...contentData, photos: updatedPhotos });
      }
    }
  };

  // Mix management
  const [mixForm, setMixForm] = useState({
    title: '',
    embedUrl: '',
    platform: 'spotify' as 'spotify' | 'mixcloud',
    description: ''
  });

  const addMix = async () => {
    if (!mixForm.title || !mixForm.embedUrl) return;
    try {
      const result = await mixesAPI.add({
        title: mixForm.title,
        embedUrl: mixForm.embedUrl,
        platform: mixForm.platform,
        description: mixForm.description
      });
      if (result.success) {
        // Reload mixes from Supabase
        const mixesData = await mixesAPI.get();
        const updatedMixes = mixesData.mixes || [];
        saveData({ ...contentData, mixes: updatedMixes });
    setMixForm({ title: '', embedUrl: '', platform: 'spotify', description: '' });
      }
    } catch (error: any) {
      console.error('Add mix error:', error);
      alert(error.message || 'Failed to add mix');
    }
  };

  const deleteMix = (id: string) => {
    setDeleteConfirmation({ type: 'mix', id });
  };

  const confirmDeleteMix = async (id: string) => {
    try {
      await mixesAPI.delete(id);
      // Reload mixes from Supabase
      const mixesData = await mixesAPI.get();
      const updatedMixes = mixesData.mixes || [];
      saveData({ ...contentData, mixes: updatedMixes });
    setDeleteConfirmation(null);
    } catch (error: any) {
      console.error('Delete mix error:', error);
      alert(error.message || 'Failed to delete mix');
    }
  };

  // Testimonial management
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    event: '',
    text: '',
    rating: 5,
    image: ''
  });
  const [uploadingTestimonialImage, setUploadingTestimonialImage] = useState(false);

  const addTestimonial = async () => {
    if (!testimonialForm.name || !testimonialForm.event || !testimonialForm.text) return;
    if (contentData.testimonials.length >= 10) {
      alert('Maximum 10 testimonials allowed');
      return;
    }
    try {
      const result = await testimonialsAPI.add({
        name: testimonialForm.name,
        event: testimonialForm.event,
        text: testimonialForm.text,
        rating: testimonialForm.rating,
        image: testimonialForm.image
      });
      if (result.success) {
        // Reload testimonials from Supabase
        const testimonialsData = await testimonialsAPI.get();
        const updatedTestimonials = testimonialsData.testimonials || [];
        saveData({ ...contentData, testimonials: updatedTestimonials });
    setTestimonialForm({ name: '', event: '', text: '', rating: 5, image: '' });
      }
    } catch (error: any) {
      console.error('Add testimonial error:', error);
      alert(error.message || 'Failed to add testimonial');
    }
  };

  const deleteTestimonial = (id: string) => {
    setDeleteConfirmation({ type: 'testimonial', id });
  };

  const confirmDeleteTestimonial = async (id: string) => {
    try {
      await testimonialsAPI.delete(id);
      // Reload testimonials from Supabase
      const testimonialsData = await testimonialsAPI.get();
      const updatedTestimonials = testimonialsData.testimonials || [];
      saveData({ ...contentData, testimonials: updatedTestimonials });
    setDeleteConfirmation(null);
    } catch (error: any) {
      console.error('Delete testimonial error:', error);
      alert(error.message || 'Failed to delete testimonial');
    }
  };

  const handleTestimonialImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setUploadingTestimonialImage(true);

    try {
      const result = await testimonialsAPI.uploadImage(file);
      if (result.success && result.url) {
        setTestimonialForm(prev => ({ ...prev, image: result.url }));
        setSaveStatus('Image uploaded successfully');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error: any) {
      console.error('Testimonial image upload error:', error);
      alert(error.message || 'Failed to upload testimonial image');
    } finally {
      setUploadingTestimonialImage(false);
    }
  };

  // Venue management
  const [venueForm, setVenueForm] = useState({
    name: '',
    logo: ''
  });
  const [uploadingVenueLogo, setUploadingVenueLogo] = useState(false);

  const handleVenueLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setUploadingVenueLogo(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setVenueForm({ ...venueForm, logo: reader.result as string });
      setUploadingVenueLogo(false);
    };
    reader.onerror = () => {
      alert('Error reading file');
      setUploadingVenueLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const addVenue = async () => {
    if (!venueForm.name) return;
    if (contentData.venues.length >= 10) {
      alert('Maximum 10 venues allowed');
      return;
    }
    try {
      const result = await venuesAPI.add({
      name: venueForm.name,
        logo: venueForm.logo
      });
      if (result.success) {
        // Reload venues from Supabase
        const venuesData = await venuesAPI.get();
        const updatedVenues = venuesData.venues || [];
        saveData({ ...contentData, venues: updatedVenues });
    setVenueForm({ name: '', logo: '' });
      }
    } catch (error: any) {
      console.error('Add venue error:', error);
      alert(error.message || 'Failed to add venue');
    }
  };

  const deleteVenue = (id: string) => {
    setDeleteConfirmation({ type: 'venue', id });
  };

  const confirmDeleteVenue = async (id: string) => {
    try {
      await venuesAPI.delete(id);
      // Reload venues from Supabase
      const venuesData = await venuesAPI.get();
      const updatedVenues = venuesData.venues || [];
      saveData({ ...contentData, venues: updatedVenues });
    setDeleteConfirmation(null);
    } catch (error: any) {
      console.error('Delete venue error:', error);
      alert(error.message || 'Failed to delete venue');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                DJ Kurt CMS
              </h1>
              <p className="text-sm text-gray-400">Content Management System</p>
            </div>
            <div className="flex items-center gap-4">
              {saveStatus && (
                <span className="text-sm text-green-400 flex items-center gap-2">
                  <Save size={16} />
                  {saveStatus}
                </span>
              )}
              <Button
                variant="outline"
                onClick={onBackToSite}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-sm"
              >
                <Home size={16} className="mr-2" />
                View Site
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-sm"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <AlertDescription>
            ✅ Connected to Supabase! All changes are saved directly to the database and storage.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="video" className="w-full">
          <div className="mb-8 overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-5">
              <TabsTrigger value="video" className="whitespace-nowrap">Featured Video</TabsTrigger>
              <TabsTrigger value="photos" className="whitespace-nowrap">Photos ({contentData.photos.length}/12)</TabsTrigger>
              <TabsTrigger value="mixes" className="whitespace-nowrap">Sample Mixes ({contentData.mixes.length})</TabsTrigger>
              <TabsTrigger value="testimonials" className="whitespace-nowrap">Testimonials ({contentData.testimonials.length}/10)</TabsTrigger>
              <TabsTrigger value="venues" className="whitespace-nowrap">Venues ({contentData.venues.length}/10)</TabsTrigger>
            </TabsList>
          </div>

          {/* Featured Video Tab */}
          <TabsContent value="video" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Update Featured Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="video-url">YouTube/Vimeo URL</Label>
                  <Input
                    id="video-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoForm.url}
                    onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Paste the full YouTube or Vimeo URL
                  </p>
                </div>
                <div>
                  <Label htmlFor="poster-image">Poster Image URL</Label>
                  <Input
                    id="poster-image"
                    placeholder="Image URL or upload link"
                    value={videoForm.posterImage}
                    onChange={(e) => setVideoForm({ ...videoForm, posterImage: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Image shown before video plays
                  </p>
                </div>
                <div>
                  <Label htmlFor="video-title">Title</Label>
                  <Input
                    id="video-title"
                    placeholder="Video title"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="video-description">Description</Label>
                  <Input
                    id="video-description"
                    placeholder="Short description"
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  />
                </div>
                <Button onClick={updateVideo} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700">
                  Update Video
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Photo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div>
                  <Label htmlFor="photo-alt">Alt Text (Description) *</Label>
                      <Input
                    id="photo-alt"
                    placeholder="Describe the photo"
                    value={photoForm.alt}
                    onChange={(e) => setPhotoForm({ ...photoForm, alt: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for accessibility
                  </p>
                </div>

                  <div>
                  <Label htmlFor="photo-file">Upload Photo *</Label>
                  <Input
                    id="photo-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto || contentData.photos.length >= 12}
                    className="cursor-pointer"
                  />
                  {uploadingPhoto && (
                    <p className="text-sm text-blue-500 mt-2">Uploading...</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB. JPEG, PNG, or WebP only. Enter alt text above before uploading.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Photo Gallery ({contentData.photos.length}/12)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Drag photos to reorder them
                </p>
                {contentData.photos.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No photos added yet</p>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handlePhotoDragEnd}
                  >
                    <SortableContext
                      items={contentData.photos.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {contentData.photos.map((photo) => (
                        <SortableItem key={photo.id} id={photo.id}>
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-16 h-16 rounded overflow-hidden">
                              {photo.url.startsWith('https') ? (
                                <ImageWithFallback
                                  src={photo.url}
                                  alt={photo.alt}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src={photo.url}
                                  alt={photo.alt}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm truncate">{photo.alt}</p>
                              <p className="text-xs text-gray-500 truncate">{photo.url}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePhoto(photo.id)}
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </Button>
                          </div>
                        </SortableItem>
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sample Mixes Tab */}
          <TabsContent value="mixes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Sample Mix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mix-title">Mix Title</Label>
                  <Input
                    id="mix-title"
                    placeholder="Wedding Reception Mix"
                    value={mixForm.title}
                    onChange={(e) => setMixForm({ ...mixForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="mix-platform">Platform</Label>
                  <select
                    id="mix-platform"
                    value={mixForm.platform}
                    onChange={(e) => setMixForm({ ...mixForm, platform: e.target.value as 'spotify' | 'mixcloud' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="spotify">Spotify</option>
                    <option value="mixcloud">Mixcloud</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="mix-embed">Embed URL or ID</Label>
                  <Input
                    id="mix-embed"
                    placeholder={mixForm.platform === 'spotify' ? 'Spotify track/playlist ID or URL' : 'Mixcloud URL'}
                    value={mixForm.embedUrl}
                    onChange={(e) => setMixForm({ ...mixForm, embedUrl: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {mixForm.platform === 'spotify' 
                      ? 'Example: spotify:track:... or full Spotify URL' 
                      : 'Example: https://www.mixcloud.com/username/mix-name/'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="mix-description">Description (Optional)</Label>
                  <Textarea
                    id="mix-description"
                    placeholder="Brief description of this mix"
                    value={mixForm.description}
                    onChange={(e) => setMixForm({ ...mixForm, description: e.target.value })}
                  />
                </div>
                <Button onClick={addMix} className="w-full">
                  <Plus size={16} className="mr-2" />
                  Add Mix
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Mixes ({contentData.mixes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {contentData.mixes.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No mixes added yet</p>
                ) : (
                  <div className="space-y-2">
                    {contentData.mixes.map((mix) => (
                      <div key={mix.id} className="flex items-center gap-4 bg-white border rounded-lg p-4">
                        <div className="flex-1">
                          <h4 className="font-medium">{mix.title}</h4>
                          <p className="text-sm text-gray-500 capitalize">{mix.platform}</p>
                          {mix.description && (
                            <p className="text-sm text-gray-600 mt-1">{mix.description}</p>
                          )}
                          <p className="text-xs text-gray-400 truncate mt-1">{mix.embedUrl}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMix(mix.id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Testimonial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testimonial-name">Client Name</Label>
                  <Input
                    id="testimonial-name"
                    placeholder="Sarah & Michael Chen"
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="testimonial-event">Event Type/Venue</Label>
                  <Input
                    id="testimonial-event"
                    placeholder="Wedding Reception, Grand Wailea"
                    value={testimonialForm.event}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, event: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="testimonial-text">Testimonial Text</Label>
                  <Textarea
                    id="testimonial-text"
                    placeholder="What did they say about your service?"
                    value={testimonialForm.text}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="testimonial-rating">Rating</Label>
                  <select
                    id="testimonial-rating"
                    value={testimonialForm.rating}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="testimonial-image">Image URL (Optional)</Label>
                  <Input
                    id="testimonial-image"
                    placeholder="https://..."
                    value={testimonialForm.image}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, image: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a photo below or paste a hosted image URL here.
                  </p>
                </div>
                {testimonialForm.image && (
                  <div className="flex items-center gap-4 bg-gray-50 border rounded-lg p-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden border">
                      <ImageWithFallback
                        src={testimonialForm.image}
                        alt={testimonialForm.name || 'Testimonial preview'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-sm text-gray-600 break-all">
                      {testimonialForm.image}
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="testimonial-image-upload">Upload Image (Optional)</Label>
                  <Input
                    id="testimonial-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleTestimonialImageUpload}
                    disabled={uploadingTestimonialImage}
                    className="cursor-pointer"
                  />
                  {uploadingTestimonialImage && (
                    <p className="text-sm text-blue-500 mt-2">Uploading...</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB. JPEG, PNG, or WebP. Uploads go to your `testimonial-images` Supabase bucket.
                  </p>
                </div>
                <Button onClick={addTestimonial} className="w-full" disabled={contentData.testimonials.length >= 10}>
                  <Plus size={16} className="mr-2" />
                  Add Testimonial
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Testimonials ({contentData.testimonials.length}/10)</CardTitle>
              </CardHeader>
              <CardContent>
                {contentData.testimonials.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No testimonials added yet</p>
                ) : (
                  <div className="space-y-2">
                    {contentData.testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="flex items-start gap-4 bg-white border rounded-lg p-4">
                        {testimonial.image && (
                          <div className="w-12 h-12 rounded-full overflow-hidden border">
                            <ImageWithFallback
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500">{testimonial.event}</p>
                          <p className="text-sm text-gray-600 mt-2 italic">"{testimonial.text}"</p>
                          <p className="text-sm text-yellow-500 mt-2">{'★'.repeat(testimonial.rating)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTestimonial(testimonial.id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Venues Tab */}
          <TabsContent value="venues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Venue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="venue-name">Venue Name</Label>
                  <Input
                    id="venue-name"
                    placeholder="Grand Wailea Resort"
                    value={venueForm.name}
                    onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required - venue name will be displayed
                  </p>
                </div>

                {/* Upload or URL Toggle */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venue-logo-upload" className="block mb-2">Upload Logo (Optional)</Label>
                    <div className="relative">
                      <Input
                        id="venue-logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleVenueLogoUpload}
                        disabled={uploadingVenueLogo}
                        className="cursor-pointer"
                      />
                      {uploadingVenueLogo && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-sm">
                          Uploading...
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                  </div>
                  <div className="flex items-center justify-center text-gray-400">
                    OR
                  </div>
                </div>

                <div>
                  <Label htmlFor="venue-logo-url">Logo URL (Optional)</Label>
                  <Input
                    id="venue-logo-url"
                    placeholder="https://..."
                    value={venueForm.logo}
                    onChange={(e) => setVenueForm({ ...venueForm, logo: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to use monogram style with venue initials
                  </p>
                </div>

                {/* Preview */}
                {venueForm.name && (
                  <div>
                    <Label>Preview</Label>
                    <div className="mt-2 flex items-center gap-4 border rounded-lg p-4 bg-gray-50">
                      <div className="w-16 h-16 bg-white rounded-lg shadow-md flex items-center justify-center">
                        {venueForm.logo ? (
                          venueForm.logo.startsWith('data:') || venueForm.logo.startsWith('https') ? (
                            <ImageWithFallback
                              src={venueForm.logo}
                              alt={venueForm.name}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <img
                              src={venueForm.logo}
                              alt={venueForm.name}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          )
                        ) : (
                          <span className="text-gray-700 font-bold text-lg">
                            {venueForm.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{venueForm.name}</p>
                        <p className="text-xs text-gray-500">
                          {venueForm.logo ? 'Custom logo' : 'Monogram style'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={addVenue} className="w-full" disabled={contentData.venues.length >= 10}>
                  <Plus size={16} className="mr-2" />
                  Add Venue
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trusted Venues ({contentData.venues.length}/10)</CardTitle>
              </CardHeader>
              <CardContent>
                {contentData.venues.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No venues added yet</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {contentData.venues.map((venue) => (
                      <div key={venue.id} className="relative group">
                        <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            {venue.logo ? (
                              venue.logo.startsWith('data:') || venue.logo.startsWith('https') ? (
                                <ImageWithFallback
                                  src={venue.logo}
                                  alt={venue.name}
                                  className="w-full h-full object-contain rounded-lg"
                                />
                              ) : (
                                <img
                                  src={venue.logo}
                                  alt={venue.name}
                                  className="w-full h-full object-contain rounded-lg"
                                />
                              )
                            ) : (
                              <span className="text-gray-700 font-bold text-lg">
                                {venue.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <p className="text-center text-sm text-gray-700 font-medium">{venue.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm"
                          onClick={() => deleteVenue(venue.id)}
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {deleteConfirmation?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmation) {
                  switch (deleteConfirmation.type) {
                    case 'photo':
                      confirmDeletePhoto(deleteConfirmation.id);
                      break;
                    case 'mix':
                      confirmDeleteMix(deleteConfirmation.id);
                      break;
                    case 'testimonial':
                      confirmDeleteTestimonial(deleteConfirmation.id);
                      break;
                    case 'venue':
                      confirmDeleteVenue(deleteConfirmation.id);
                      break;
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
