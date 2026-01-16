import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://8020films.com';
  const isProd = process.env.NODE_ENV === 'production';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: isProd ? ['/admin'] : ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
