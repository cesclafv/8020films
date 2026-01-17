'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { FAQSection } from './FAQSection';
import { ServiceImageCarousel } from './ServiceImageCarousel';

type ServiceKey = 'liveStreaming' | 'corporateVideo' | 'brandStorytelling' | 'remoteProduction' | 'musicVideo';

type WorkReference = {
  id: string;
  slug: string;
  client_name: string;
  title: string;
  featured_image_url: string | null;
};

type ServiceImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
};

const serviceData: Record<ServiceKey, {
  icon: React.ReactNode;
  relatedServices: ServiceKey[];
}> = {
  liveStreaming: {
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    relatedServices: ['corporateVideo', 'remoteProduction', 'brandStorytelling'],
  },
  corporateVideo: {
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    relatedServices: ['brandStorytelling', 'liveStreaming', 'remoteProduction'],
  },
  brandStorytelling: {
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
    relatedServices: ['corporateVideo', 'musicVideo', 'remoteProduction'],
  },
  remoteProduction: {
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    relatedServices: ['liveStreaming', 'corporateVideo', 'brandStorytelling'],
  },
  musicVideo: {
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    relatedServices: ['brandStorytelling', 'corporateVideo', 'liveStreaming'],
  },
};

const serviceLinks: Record<ServiceKey, string> = {
  liveStreaming: '/services/live-streaming',
  corporateVideo: '/services/corporate-video',
  brandStorytelling: '/services/brand-storytelling',
  remoteProduction: '/services/remote-production',
  musicVideo: '/services/music-video',
};

export function ServicePageContent({
  service,
  locale,
  workReferences = [],
  serviceImages = []
}: {
  service: ServiceKey;
  locale: string;
  workReferences?: WorkReference[];
  serviceImages?: ServiceImage[];
}) {
  const t = useTranslations('ServicePages');
  const data = serviceData[service];

  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className={`mb-16 ${serviceImages.length > 0 ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-start' : ''}`}>
          {/* Left Column: Text Content */}
          <div className="max-w-xl">
            <div className="text-[#ff6b6b] mb-6">{data.icon}</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              {t(`${service}.title`)}
            </h1>
            <p className="text-xl md:text-2xl text-[#6b7280] mb-8">
              {t(`${service}.subtitle`)}
            </p>
            <p className="text-lg text-[#6b7280]">
              {t(`${service}.intro`)}
            </p>
          </div>

          {/* Right Column: Image Carousel */}
          {serviceImages.length > 0 && (
            <div className="lg:pt-8">
              <ServiceImageCarousel
                images={serviceImages}
                serviceName={t(`${service}.title`)}
              />
            </div>
          )}
        </div>

        {/* What We Offer */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-8">{t(`${service}.whatWeOfferTitle`)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#f9fafb] rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">
                  {t(`${service}.offer${i}Title`)}
                </h3>
                <p className="text-[#6b7280]">
                  {t(`${service}.offer${i}Description`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-6">{t(`${service}.whyTitle`)}</h2>
          <ul className="space-y-4 max-w-2xl">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#ff6b6b] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[#6b7280]">{t(`${service}.why${i}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Featured Work */}
        {workReferences.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-bold mb-8">
              {locale === 'fr' ? 'Nos réalisations' : locale === 'es' ? 'Trabajos destacados' : 'Featured Work'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workReferences.slice(0, 6).map((work) => (
                <Link
                  key={work.id}
                  href={`/work/${work.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                    {work.featured_image_url ? (
                      <Image
                        src={work.featured_image_url}
                        alt={work.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <h3 className="font-semibold group-hover:text-[#ff6b6b] transition-colors">
                    {work.title}
                  </h3>
                  <p className="text-sm text-[#6b7280]">{work.client_name}</p>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/work"
                className="inline-flex items-center gap-2 text-[#ff6b6b] font-semibold hover:underline"
              >
                {locale === 'fr' ? 'Voir tous nos projets' : locale === 'es' ? 'Ver todos nuestros trabajos' : 'View all our work'}
                <span>→</span>
              </Link>
            </div>
          </div>
        )}

        {/* Locations */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-6">
            {locale === 'fr' ? 'Disponible dans nos bureaux' : locale === 'es' ? 'Disponible en nuestras oficinas' : 'Available at our offices'}
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/paris"
              className="bg-white border border-gray-200 rounded-lg px-6 py-4 hover:border-[#ff6b6b] hover:shadow-md transition-all group"
            >
              <span className="font-semibold group-hover:text-[#ff6b6b] transition-colors">Paris</span>
            </Link>
            <Link
              href="/london"
              className="bg-white border border-gray-200 rounded-lg px-6 py-4 hover:border-[#ff6b6b] hover:shadow-md transition-all group"
            >
              <span className="font-semibold group-hover:text-[#ff6b6b] transition-colors">London</span>
            </Link>
            <Link
              href="/los-angeles"
              className="bg-white border border-gray-200 rounded-lg px-6 py-4 hover:border-[#ff6b6b] hover:shadow-md transition-all group"
            >
              <span className="font-semibold group-hover:text-[#ff6b6b] transition-colors">Los Angeles</span>
            </Link>
          </div>
        </div>

        {/* Related Services */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-6">
            {locale === 'fr' ? 'Services connexes' : locale === 'es' ? 'Servicios relacionados' : 'Related Services'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.relatedServices.map((relatedService) => (
              <Link
                key={relatedService}
                href={serviceLinks[relatedService]}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#ff6b6b] hover:shadow-md transition-all group"
              >
                <h3 className="font-semibold text-lg mb-2 group-hover:text-[#ff6b6b] transition-colors">
                  {t(`${relatedService}.title`)}
                </h3>
                <span className="text-sm text-[#ff6b6b]">
                  {locale === 'fr' ? 'En savoir plus →' : locale === 'es' ? 'Más información →' : 'Learn more →'}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        {(() => {
          const faqs = t.raw(`${service}.faqs`);
          if (Array.isArray(faqs) && faqs.length > 0) {
            return (
              <FAQSection
                title={t(`${service}.faqTitle`)}
                faqs={faqs as { question: string; answer: string }[]}
              />
            );
          }
          return null;
        })()}

        {/* CTA Section */}
        <div className="bg-[#0a0a0a] text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">{t(`${service}.ctaTitle`)}</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            {t(`${service}.ctaDescription`)}
          </p>
          <Link
            href="/quote"
            className="inline-block bg-[#ff6b6b] text-white px-8 py-4 font-semibold hover:bg-[#ff5252] transition-colors"
          >
            {t(`${service}.ctaButton`)}
          </Link>
        </div>
      </div>
    </div>
  );
}
