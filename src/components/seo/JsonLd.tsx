type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization schema for 8020 Films
export function OrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://8020films.com';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '8020 Films',
    url: baseUrl,
    logo: `${baseUrl}/img/logo-8020Films-horizontal_white_1000px.png`,
    description:
      'Video production company based in Paris, London & Los Angeles. Best-in-class video production for the world\'s most renowned agencies and brands.',
    sameAs: [
      'https://www.instagram.com/8020films',
      'https://vimeo.com/8020films',
      'https://www.linkedin.com/company/8020films',
    ],
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: '10949 Ayres Ave.',
        addressLocality: 'Los Angeles',
        addressRegion: 'CA',
        postalCode: '90064',
        addressCountry: 'US',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: '85 Great Portland Street',
        addressLocality: 'London',
        postalCode: 'W1W 7LT',
        addressCountry: 'GB',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@8020films.com',
      contactType: 'customer service',
    },
  };

  return <JsonLd data={data} />;
}

// WebSite schema with search action
export function WebSiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://8020films.com';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '8020 Films',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/en/work?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={data} />;
}

// LocalBusiness schema for each location
export function LocalBusinessJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://8020films.com';

  const locations = [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoProductionCompany',
      '@id': `${baseUrl}/#los-angeles`,
      name: '8020 Films - Los Angeles',
      image: `${baseUrl}/img/og-image.jpg`,
      url: baseUrl,
      telephone: '+1-424-877-2109',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '10949 Ayres Ave.',
        addressLocality: 'Los Angeles',
        addressRegion: 'CA',
        postalCode: '90064',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 34.0375,
        longitude: -118.4356,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '20:00',
      },
      priceRange: '$$$$',
      parentOrganization: {
        '@type': 'Organization',
        name: '8020 Films',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'VideoProductionCompany',
      '@id': `${baseUrl}/#london`,
      name: '8020 Films - London',
      image: `${baseUrl}/img/og-image.jpg`,
      url: baseUrl,
      telephone: '+44-7450-463111',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '85 Great Portland Street',
        addressLocality: 'London',
        postalCode: 'W1W 7LT',
        addressCountry: 'GB',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 51.5207,
        longitude: -0.1432,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '20:00',
      },
      priceRange: '$$$$',
      parentOrganization: {
        '@type': 'Organization',
        name: '8020 Films',
      },
    },
  ];

  return (
    <>
      {locations.map((location, index) => (
        <JsonLd key={index} data={location} />
      ))}
    </>
  );
}

// VideoObject schema for work reference pages
type VideoJsonLdProps = {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate?: string;
  contentUrl?: string;
  embedUrl?: string;
};

export function VideoJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
}: VideoJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate: uploadDate || new Date().toISOString().split('T')[0],
    producer: {
      '@type': 'Organization',
      name: '8020 Films',
    },
  };

  if (contentUrl) {
    data.contentUrl = contentUrl;
  }

  if (embedUrl) {
    data.embedUrl = embedUrl;
  }

  return <JsonLd data={data} />;
}

// BreadcrumbList schema for navigation
type BreadcrumbItem = {
  name: string;
  url?: string;
};

type BreadcrumbJsonLdProps = {
  items: BreadcrumbItem[];
};

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };

  return <JsonLd data={data} />;
}
