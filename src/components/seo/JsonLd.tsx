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
type LocationKey = 'paris' | 'london' | 'losAngeles';

const locationSchemas: Record<LocationKey, {
  id: string;
  name: string;
  telephone: string;
  address: Record<string, string>;
  geo: { latitude: number; longitude: number };
}> = {
  losAngeles: {
    id: 'los-angeles',
    name: '8020 Films - Los Angeles',
    telephone: '+1-424-877-2109',
    address: {
      streetAddress: '10949 Ayres Ave.',
      addressLocality: 'Los Angeles',
      addressRegion: 'CA',
      postalCode: '90064',
      addressCountry: 'US',
    },
    geo: { latitude: 34.0375, longitude: -118.4356 },
  },
  london: {
    id: 'london',
    name: '8020 Films - London',
    telephone: '+44-7450-463111',
    address: {
      streetAddress: '85 Great Portland Street',
      addressLocality: 'London',
      postalCode: 'W1W 7LT',
      addressCountry: 'GB',
    },
    geo: { latitude: 51.5207, longitude: -0.1432 },
  },
  paris: {
    id: 'paris',
    name: '8020 Films - Paris',
    telephone: '+33-1-XX-XX-XX-XX',
    address: {
      addressLocality: 'Paris',
      postalCode: '75008',
      addressCountry: 'FR',
    },
    geo: { latitude: 48.8566, longitude: 2.3522 },
  },
};

export function LocalBusinessJsonLd({ location }: { location?: LocationKey }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://8020films.com';

  const createLocationSchema = (loc: LocationKey) => {
    const data = locationSchemas[loc];
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoProductionCompany',
      '@id': `${baseUrl}/#${data.id}`,
      name: data.name,
      image: `${baseUrl}/img/og-image.jpg`,
      url: `${baseUrl}/en/${data.id}`,
      telephone: data.telephone,
      address: {
        '@type': 'PostalAddress',
        ...data.address,
      },
      geo: {
        '@type': 'GeoCoordinates',
        ...data.geo,
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
    };
  };

  // If a specific location is provided, render only that one
  if (location) {
    return <JsonLd data={createLocationSchema(location)} />;
  }

  // Otherwise render all locations
  const allLocations: LocationKey[] = ['losAngeles', 'london', 'paris'];
  return (
    <>
      {allLocations.map((loc) => (
        <JsonLd key={loc} data={createLocationSchema(loc)} />
      ))}
    </>
  );
}

// Service schema for service pages
type ServiceKey = 'liveStreaming' | 'corporateVideo' | 'brandStorytelling' | 'remoteProduction' | 'musicVideo';

const serviceSchemas: Record<ServiceKey, {
  name: string;
  description: string;
  serviceType: string;
}> = {
  liveStreaming: {
    name: 'Live Streaming & Events',
    description: 'Professional live streaming services for corporate events, conferences, product launches, and virtual gatherings. Multi-camera production with real-time graphics and worldwide delivery.',
    serviceType: 'Live Event Production',
  },
  corporateVideo: {
    name: 'Corporate Video Production',
    description: 'High-quality corporate video production including company profiles, executive communications, training videos, and internal communications.',
    serviceType: 'Corporate Video Production',
  },
  brandStorytelling: {
    name: 'Brand Storytelling',
    description: 'Compelling brand films and documentary-style content that tells your brand story, builds emotional connections, and drives engagement.',
    serviceType: 'Brand Film Production',
  },
  remoteProduction: {
    name: 'Remote Production',
    description: 'Remote video production services connecting teams worldwide. Studio-quality results from any location with our distributed production capabilities.',
    serviceType: 'Remote Video Production',
  },
  musicVideo: {
    name: 'Music Video Production',
    description: 'Creative music video production from concept to delivery. Working with artists and labels to create visually stunning music videos.',
    serviceType: 'Music Video Production',
  },
};

export function ServiceJsonLd({ service }: { service: ServiceKey }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://8020films.com';
  const data = serviceSchemas[service];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.name,
    description: data.description,
    serviceType: data.serviceType,
    provider: {
      '@type': 'Organization',
      name: '8020 Films',
      url: baseUrl,
    },
    areaServed: [
      { '@type': 'City', name: 'Los Angeles' },
      { '@type': 'City', name: 'London' },
      { '@type': 'City', name: 'Paris' },
    ],
  };

  return <JsonLd data={schema} />;
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
