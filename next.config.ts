import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Update this for your Supabase Storage hostname once you have it.
    // Example: "xyzcompany.supabase.co"
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'PLACEHOLDER.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
