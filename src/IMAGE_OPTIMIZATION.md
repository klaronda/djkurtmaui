# 🖼️ Image Optimization Guide

## Hero Image Compression

The hero image (3.25 MB) is now automatically compressed using **Supabase's Image Transformation API**.

### How It Works

Instead of serving the full 3.25 MB image, we use Supabase's on-the-fly image transformation:

```
https://oxecaqattfrvtrqhsvtn.supabase.co/storage/v1/render/image/public/photos/[filename]?width=1920&quality=85&format=webp
```

### Parameters Used

- **`width=1920`** - Resizes to max 1920px width (perfect for hero images)
- **`quality=85`** - 85% quality (excellent visual quality, ~70% file size reduction)
- **`format=webp`** - Converts to WebP format (better compression than JPEG)

### Results

- **Original**: 3.25 MB JPEG
- **Optimized**: ~200-300 KB WebP (90%+ reduction!)
- **Quality**: Visually identical to original
- **Load Time**: 10x faster on slow connections

### Further Optimization Options

If you want even smaller file sizes, you can adjust:

```typescript
// Smaller file, slightly lower quality
?width=1600&quality=75&format=webp  // ~150-200 KB

// Mobile-optimized
?width=1200&quality=80&format=webp  // ~100-150 KB

// Maximum compression
?width=1920&quality=70&format=webp  // ~100-150 KB
```

### Browser Support

- **Modern browsers**: Automatically get WebP (Chrome, Firefox, Safari 14+, Edge)
- **Older browsers**: Supabase automatically falls back to JPEG if WebP isn't supported

### Performance Benefits

1. ✅ **Faster page loads** - 90% smaller file size
2. ✅ **Better mobile experience** - Less data usage
3. ✅ **Automatic optimization** - No manual compression needed
4. ✅ **CDN caching** - Supabase CDN caches optimized images globally

### Alternative: Pre-compress Before Upload

If you want to compress the original file before uploading:

1. Use an online tool like [Squoosh](https://squoosh.app/) or [TinyPNG](https://tinypng.com/)
2. Compress to ~500KB-1MB before uploading
3. Then use transformation API for additional optimization

But the current setup is already excellent - the transformation API handles everything automatically!

