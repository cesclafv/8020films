'use client';

import { useTranslations } from 'next-intl';

const capabilities = [
  { key: 'scopeBudget', number: '01' },
  { key: 'fullService', number: '02' },
  { key: 'liveStreaming', number: '03' },
  { key: 'music', number: '04' },
  { key: 'brandStorytelling', number: '05' },
  { key: 'remoteProduction', number: '06' },
];

export function CapabilitiesSection() {
  const t = useTranslations('HomePage.capabilities');

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header - Large, clean title */}
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-16 md:mb-24 tracking-tight">
          {t('title')}
        </h2>

        {/* Capabilities Grid - 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {capabilities.map((cap) => (
            <div key={cap.key}>
              {/* Number - small, coral colored */}
              <span className="text-sm font-bold tracking-wider text-[#ff6b6b] mb-3 block">
                {cap.number}
              </span>
              {/* Title - large, bold, sentence case */}
              <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
                {t(`${cap.key}.title`)}
              </h3>
              {/* Description */}
              <p className="text-[#6b7280] leading-relaxed">
                {t(`${cap.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
