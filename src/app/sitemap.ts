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

  return [...staticUrls, ...workUrls];
}
