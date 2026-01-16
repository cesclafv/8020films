import type { MetadataRoute } from 'next';
import { getAllWorkReferencesForSitemap } from '@/lib/supabase/queries';

// Regenerate sitemap every hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://8020films.com';

  // Fetch all work references with images from Supabase
  const workReferences = await getAllWorkReferencesForSitemap();

  // Static pages
  const staticPages = ['', '/work', '/careers', '/quote', '/contact'];

  // Location pages
  const locationPages = ['/paris', '/london', '/los-angeles'];

  // Service pages
  const servicePages = [
    '/services/live-streaming',
    '/services/corporate-video',
    '/services/brand-storytelling',
    '/services/remote-production',
    '/services/music-video',
  ];

  const locales = ['en', 'fr'];

  // Generate URLs for static pages in both locales
  const staticUrls = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  );

  // Generate URLs for location pages in both locales
  const locationUrls = locales.flatMap((locale) =>
    locationPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  // Generate URLs for service pages in both locales
  const serviceUrls = locales.flatMap((locale) =>
    servicePages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  // Generate URLs for work reference pages in both locales (with images)
  const workUrls = locales.flatMap((locale) =>
    workReferences.map((work) => ({
      url: `${baseUrl}/${locale}/work/${work.slug}`,
      lastModified: work.updated_at ? new Date(work.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      images: work.featured_image_url ? [work.featured_image_url] : undefined,
    }))
  );

  return [...staticUrls, ...locationUrls, ...serviceUrls, ...workUrls];
}
