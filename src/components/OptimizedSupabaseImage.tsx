import { ImgHTMLAttributes, useMemo, useState } from 'react';

interface OptimizedSupabaseImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Public Supabase storage object URL (e.g. .../storage/v1/object/public/bucket/path.jpg)
   */
  objectSrc: string
  /**
   * Width breakpoints (sorted ascending) used for srcSet generation.
   */
  widths?: number[]
  /**
   * Quality for transformed images (default 75).
   */
  quality?: number
}

/**
 * Lightweight helper to serve Supabase Storage images through the on-the-fly
 * transformation CDN (`/render/image/public/...`) with a graceful fallback to
 * the original object URL if the transformation endpoint is unavailable.
 */
export function OptimizedSupabaseImage({
  objectSrc,
  widths = [480, 768, 1024, 1280, 1440, 1920],
  quality = 75,
  loading = 'lazy',
  decoding = 'async',
  ...rest
}: OptimizedSupabaseImageProps) {
  const renderBase = useMemo(() => objectSrc.replace('/object/', '/render/image/'), [objectSrc]);

  const srcSet = useMemo(() => {
    const sorted = [...widths].sort((a, b) => a - b);
    return sorted
      .map((width) => `${renderBase}?width=${width}&quality=${quality}&format=webp ${width}w`)
      .join(', ');
  }, [renderBase, widths, quality]);

  const largestWidth = useMemo(() => Math.max(...widths), [widths]);
  const initialSrc = useMemo(
    () => `${renderBase}?width=${largestWidth}&quality=${quality}&format=webp`,
    [renderBase, largestWidth, quality]
  );

  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [hasFallenBack, setHasFallenBack] = useState(false);

  const handleError = () => {
    if (!hasFallenBack) {
      setHasFallenBack(true);
      setCurrentSrc(objectSrc);
    }
  };

  return (
    <img
      {...rest}
      loading={loading}
      decoding={decoding}
      src={currentSrc}
      srcSet={hasFallenBack ? undefined : srcSet}
      onError={handleError}
    />
  );
}
