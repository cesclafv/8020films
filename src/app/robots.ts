import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    rules: [
      {
        userAgent: '*',
        allow: isProd ? '/' : '/',
        disallow: isProd ? [] : ['/'], // block indexing in dev by default
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/sitemap.xml`,
  };
}
