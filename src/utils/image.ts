/**
 * Converts a Cloudinary URL to a browser-compatible format.
 * HEIC images are not supported by browsers — this injects f_auto,q_auto
 * so Cloudinary serves JPEG/WebP instead.
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return ''

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url

  // Already has transformations
  if (url.includes('/upload/f_') || url.includes('/upload/q_')) return url

  return url.replace('/upload/', '/upload/f_auto,q_auto/')
}
