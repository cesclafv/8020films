'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FAQSection } from './FAQSection';

type LocationKey = 'paris' | 'london' | 'losAngeles';

const locationData: Record<LocationKey, {
  address: string[];
  phone?: string;
  hours: string;
  services: string[];
}> = {
  paris: {
    address: ['48 rue des Francs Bourgeois', '75003 Paris, France'],
    hours: '9am - 7pm CET',
    services: ['liveStreaming', 'corporateVideo', 'brandStorytelling', 'remoteProduction', 'musicVideo'],
  },
  london: {
    address: ['85 Great Portland Street', 'London W1W 7LT', 'United Kingdom'],
    phone: '+44 7450 463111',
    hours: '9am - 8pm GMT',
    services: ['liveStreaming', 'corporateVideo', 'brandStorytelling', 'remoteProduction', 'musicVideo'],
  },
  losAngeles: {
    address: ['10949 Ayres Ave.', 'Los Angeles, CA 90064', 'USA'],
    phone: '+1 (424) 877-2109',
    hours: '9am - 8pm PST',
    services: ['liveStreaming', 'corporateVideo', 'brandStorytelling', 'remoteProduction', 'musicVideo'],
  },
};

const serviceLabels: Record<string, { en: string; fr: string; href: string }> = {
  liveStreaming: { en: 'Live Streaming & Events', fr: 'Streaming Live & Événements', href: '/services/live-streaming' },
  corporateVideo: { en: 'Corporate Video', fr: 'Vidéo Corporate', href: '/services/corporate-video' },
  brandStorytelling: { en: 'Brand Storytelling', fr: 'Storytelling de Marque', href: '/services/brand-storytelling' },
  remoteProduction: { en: 'Remote Production', fr: 'Production à Distance', href: '/services/remote-production' },
  musicVideo: { en: 'Music Video Production', fr: 'Clips Musicaux', href: '/services/music-video' },
};

export function LocationPageContent({ location, locale }: { location: LocationKey; locale: string }) {
  const t = useTranslations('LocationPages');
  const data = locationData[location];

  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="max-w-4xl mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            {t(`${location}.title`)}
          </h1>
          <p className="text-xl md:text-2xl text-[#6b7280] mb-8">
            {t(`${location}.subtitle`)}
          </p>
          <p className="text-lg text-[#6b7280]">
            {t(`${location}.intro`)}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          {/* Why Choose Us */}
          <div>
            <h2 className="text-2xl font-bold mb-6">{t(`${location}.whyTitle`)}</h2>
            <ul className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff6b6b] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#6b7280]">{t(`${location}.why${i}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Office Info */}
          <div className="bg-[#f9fafb] rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">
              {location === 'paris' ? 'Paris' : location === 'london' ? 'London' : 'Los Angeles'} Office
            </h3>
            <div className="space-y-4 text-[#6b7280]">
              <div>
                {data.address.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              {data.phone && (
                <div>
                  <a href={`tel:${data.phone.replace(/\s/g, '')}`} className="text-[#ff6b6b] hover:underline">
                    {data.phone}
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm">{data.hours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-8">{t(`${location}.servicesTitle`)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service) => (
              <Link
                key={service}
                href={serviceLabels[service].href}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#ff6b6b] hover:shadow-md transition-all group"
              >
                <h3 className="font-semibold text-lg mb-2 group-hover:text-[#ff6b6b] transition-colors">
                  {locale === 'fr' ? serviceLabels[service].fr : serviceLabels[service].en}
                </h3>
                <span className="text-sm text-[#ff6b6b]">
                  {locale === 'fr' ? 'En savoir plus →' : 'Learn more →'}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        {(() => {
          const faqs = t.raw(`${location}.faqs`);
          if (Array.isArray(faqs) && faqs.length > 0) {
            return (
              <FAQSection
                title={t(`${location}.faqTitle`)}
                faqs={faqs as { question: string; answer: string }[]}
              />
            );
          }
          return null;
        })()}

        {/* CTA Section */}
        <div className="bg-[#0a0a0a] text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">{t(`${location}.ctaTitle`)}</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            {t(`${location}.ctaDescription`)}
          </p>
          <Link
            href="/quote"
            className="inline-block bg-[#ff6b6b] text-white px-8 py-4 font-semibold hover:bg-[#ff5252] transition-colors"
          >
            {t(`${location}.ctaButton`)}
          </Link>
        </div>
      </div>
    </div>
  );
}
