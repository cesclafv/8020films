'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// Mock featured case study - will be replaced with Supabase data
const featuredCaseStudy = {
  slug: 'dyson-live-corrale-hair-straightener-launch',
  title: 'Dyson Live: Corrale™ Hair Straightener Launch',
  client: 'Dyson',
  category: 'Live Streaming & Events',
  year: '2024',
  excerpt:
    'Dyson 45-minute live shopping experience produced by 8020 Films, broadcast on Darty.com - leading French consumer electronics retailer.',
  videoId: '916607861',
};

export function CaseStudySection() {
  const t = useTranslations('HomePage.caseStudy');

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-16 md:mb-20 tracking-tight">
          {t('title')}
        </h2>

        {/* Case Study Card */}
        <div className="max-w-5xl mx-auto">
          {/* Video Embed */}
          <div className="aspect-video bg-black mb-8 overflow-hidden">
            <iframe
              src={`https://player.vimeo.com/video/${featuredCaseStudy.videoId}?title=0&byline=0&portrait=0`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              title={featuredCaseStudy.title}
            />
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-8 mb-6 text-sm uppercase tracking-wider">
            <div>
              <span className="text-[#6b7280] block mb-1">{t('client')}</span>
              <span className="font-semibold">{featuredCaseStudy.client}</span>
            </div>
            <div>
              <span className="text-[#6b7280] block mb-1">{t('category')}</span>
              <span className="font-semibold">{featuredCaseStudy.category}</span>
            </div>
            <div>
              <span className="text-[#6b7280] block mb-1">{t('year')}</span>
              <span className="font-semibold">{featuredCaseStudy.year}</span>
            </div>
          </div>

          {/* Title & Excerpt */}
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            {featuredCaseStudy.title}
          </h3>
          <p className="text-[#6b7280] text-lg leading-relaxed mb-8 max-w-3xl">
            {featuredCaseStudy.excerpt}
          </p>

          {/* CTA */}
          <Link
            href={`/work/${featuredCaseStudy.slug}`}
            className="btn btn-outline"
          >
            {t('viewProject')}
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
