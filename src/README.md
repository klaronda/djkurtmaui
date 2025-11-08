# DJ Kurt - Professional DJ Website & CMS

A professional website for DJ Kurt, a Maui-based wedding and event DJ, featuring a comprehensive content management system built with React, TypeScript, Tailwind CSS, and Supabase.

## 🎯 Project Vision

Build a professional website that emphasizes SEO visibility, credibility, and visual storytelling while maintaining a balance between Maui's relaxed tropical vibe and upscale presentation.

### Design Philosophy
- **Visual-First Approach**: Large media elements, smooth navigation, and immersive imagery
- **Color Palette**: Black/charcoal base with gold/bronze accents and ocean teal/coral highlights
- **Target Audience**: Couples planning Maui weddings and corporate event planners
- **Brand Positioning**: Professional yet approachable, tropical yet sophisticated

## ✨ Features

### Public Website
- **Hero Section**: Full-screen video header with sticky "Book Now" CTA
- **About Section**: Professional bio emphasizing 15+ years of experience
- **Services Section**: Wedding DJs, Corporate Events, Private Parties with detailed descriptions
- **Media Gallery**: 
  - Featured video showcase
  - Photo gallery (up to 12 photos) with drag-and-drop reordering
  - Sample mixes from Spotify/Mixcloud
- **Testimonials**: Client reviews with 5-star ratings and optional photos
- **Trusted Venues**: Partner venue logos with automatic monogram fallbacks
- **Contact Form**: Multi-step form with event details and date selection

### Admin CMS
- **Secure Authentication**: Email/password login with Supabase Auth
- **Featured Video Management**: Update hero video URL
- **Photo Gallery Management**: 
  - Upload images (max 12, 5MB each)
  - Drag-and-drop reordering
  - Image preview and deletion with confirmation
- **Sample Mixes Management**: Add/remove Spotify and Mixcloud embeds
- **Testimonials Management**: 
  - Add client testimonials with ratings
  - Optional client photos
  - Edit and delete functionality
- **Venue Partners Management**: 
  - Upload venue logos
  - Automatic monogram fallback for missing logos
  - Edit and delete with confirmation dialogs
- **Contact Form Submissions**: View all client inquiries (future enhancement)

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4.0** for styling
- **shadcn/ui** component library
- **Lucide React** for icons
- **@dnd-kit** for drag-and-drop functionality
- **React Hook Form** for form validation
- **Sonner** for toast notifications

### Backend
- **Supabase** for backend services:
  - Authentication
  - PostgreSQL Database
  - Storage (for images/media)
  - Edge Functions (Hono server)

### Build Tools
- **Vite** (recommended for local development)
- **ESLint** & **Prettier** for code quality

## 📁 Project Structure

```
├── App.tsx                          # Main app with routing
├── components/
│   ├── About.tsx                    # About section
│   ├── AdminLogin.tsx               # Admin login page
│   ├── AdminSignup.tsx              # Admin account creation
│   ├── Contact.tsx                  # Contact form
│   ├── ContentManager.tsx           # CMS dashboard
│   ├── Footer.tsx                   # Site footer
│   ├── Header.tsx                   # Site header with navigation
│   ├── Hero.tsx                     # Hero section with video
│   ├── Media.tsx                    # Photo gallery & mixes
│   ├── Services.tsx                 # Services section
│   ├── Testimonials.tsx             # Testimonials & venues
│   ├── ui/                          # shadcn/ui components
│   └── figma/
│       └── ImageWithFallback.tsx    # Image component with fallback
├── styles/
│   └── globals.css                  # Global styles & Tailwind config
├── utils/
│   ├── api.ts                       # API utility functions
│   └── supabase/
│       └── info.tsx                 # Supabase config (generated)
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx            # Hono server with API routes
│           └── kv_store.tsx         # KV store utility (optional)
├── email-template.html              # Contact form email template
└── email-template-auto-response.html # Auto-response template
```

## 🗄 Database Schema (SQL)

### Recommended PostgreSQL Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Featured Video Configuration
CREATE TABLE featured_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  poster_image TEXT,
  title TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo Gallery
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample Mixes
CREATE TABLE mixes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('spotify', 'mixcloud')),
  description TEXT,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  event TEXT NOT NULL,
  text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  display_order INTEGER NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trusted Venues
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Form Submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_type TEXT NOT NULL,
  event_date DATE,
  guest_count INTEGER,
  venue TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_photos_order ON photos(display_order);
CREATE INDEX idx_mixes_order ON mixes(display_order);
CREATE INDEX idx_testimonials_order ON testimonials(display_order);
CREATE INDEX idx_venues_order ON venues(display_order);
CREATE INDEX idx_contact_status ON contact_submissions(status);
CREATE INDEX idx_contact_created ON contact_submissions(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE featured_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public read access for content tables
CREATE POLICY "Public can view featured videos" ON featured_videos FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Public can view mixes" ON mixes FOR SELECT USING (true);
CREATE POLICY "Public can view testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Public can view venues" ON venues FOR SELECT USING (true);

-- Authenticated users (admins) can manage content
CREATE POLICY "Authenticated users can manage featured videos" ON featured_videos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage photos" ON photos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage mixes" ON mixes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage venues" ON venues FOR ALL USING (auth.role() = 'authenticated');

-- Anyone can insert contact submissions, only authenticated can view/manage
CREATE POLICY "Anyone can submit contact form" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view submissions" ON contact_submissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update submissions" ON contact_submissions FOR UPDATE USING (auth.role() = 'authenticated');
```

### Storage Buckets

Create the following storage buckets in Supabase:
- `photos` - For gallery images (public read, authenticated write)
- `testimonial-images` - For client testimonial photos (public read, authenticated write)
- `venue-logos` - For venue partner logos (public read, authenticated write)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dj-kurt-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Run the SQL schema from the Database Schema section above
   - Create the storage buckets mentioned above
   - Set up storage policies for public read access

4. **Configure environment variables**
   Create a `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Update Supabase config**
   Update `/utils/supabase/info.tsx`:
   ```typescript
   export const projectId = 'your-project-id';
   export const publicAnonKey = 'your-anon-key';
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Deploy Supabase Edge Function**
   ```bash
   supabase functions deploy make-server-200dbde6
   ```

8. **Create admin account**
   - Navigate to `http://localhost:5173/#admin-signup`
   - Create your admin account
   - Sign in at `http://localhost:5173/#admin`

## 📝 Current Implementation Status

### ✅ Completed
- Full responsive design (mobile, tablet, desktop)
- All public-facing sections
- Admin authentication with Supabase Auth
- Admin CMS with all CRUD operations (currently using KV store)
- Drag-and-drop photo reordering
- Image upload with base64 encoding
- Delete confirmation dialogs
- Form validation
- Toast notifications
- Email templates for contact form

### 🔄 Needs Migration to SQL
The current implementation uses Supabase KV store. To migrate to SQL tables:

1. **Update server routes** in `/supabase/functions/server/index.tsx`
   - Replace KV store calls with Supabase client queries
   - Update CRUD operations to use PostgreSQL

2. **Update API utilities** in `/utils/api.ts`
   - Endpoints remain the same
   - Server handles database operations

3. **Implement image uploads to Supabase Storage**
   - Replace base64 encoding with actual file uploads
   - Generate signed URLs for images
   - Update ContentManager to handle file uploads

4. **Add contact form backend integration**
   - Save submissions to database
   - Optional: Email notifications via Resend or SendGrid

## 🎨 Design System

### Colors
```css
/* Primary Brand Colors */
--gold: #D4AF37;          /* Primary CTA, accents */
--bronze: #CD7F32;        /* Secondary accents */
--teal: #008B8B;          /* Ocean highlights */
--coral: #FF6F61;         /* Warm accents */

/* Neutrals */
--charcoal: #1A1A1A;      /* Primary background */
--gray-900: #0F0F0F;      /* Deep blacks */
--gray-100: #F5F5F5;      /* Light text on dark */
```

### Typography
- **Headings**: System font stack (optimized for web)
- **Body**: Clean, readable sans-serif
- **Defined in**: `/styles/globals.css`

### Spacing & Layout
- Max content width: 1200px
- Section padding: 80px vertical (desktop), 40px (mobile)
- Grid system: 12-column responsive grid

## 🔐 Security Considerations

- **Environment Variables**: Never commit `.env` files
- **Row Level Security**: Enabled on all tables
- **Authentication**: Supabase Auth with email/password
- **File Uploads**: Validate file types and sizes
- **CORS**: Configured for production domain only
- **Rate Limiting**: Implement on contact form endpoint

## 📧 Email Integration (Future)

The project includes email templates but needs integration:
- Recommended: Resend, SendGrid, or Supabase Edge Functions with SMTP
- Templates located in project root
- Implement in `/supabase/functions/server/index.tsx`

## 🚢 Deployment

### Frontend
- **Recommended**: Vercel, Netlify, or Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: Add Supabase credentials

### Backend (Edge Functions)
- Deploy via Supabase CLI:
  ```bash
  supabase functions deploy make-server-200dbde6
  ```

### Database Migrations
- Use Supabase migrations for version control:
  ```bash
  supabase migration new initial_schema
  ```

## 📄 License

This project is proprietary and confidential.

## 🤝 Support

For questions or issues, contact the development team.

---

**Built with ❤️ for DJ Kurt - Maui's Premier Wedding & Event DJ**
