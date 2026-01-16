'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { WorkReference } from '@/lib/supabase/queries';

type Props = {
  caseStudy: WorkReference;
  locale: string;
};

export function CaseStudySectionClient({ caseStudy, locale }: Props) {
  const t = useTranslations('HomePage.caseStudy');

  // Extract video embed URL
  const getVideoEmbed = (url: string, type: string) => {
    if (type === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) {
        return `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`;
      }
    }
    if (type === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    return null;
  };

  const primaryVideo = caseStudy.videos[0];
  const videoEmbedUrl = primaryVideo
    ? getVideoEmbed(primaryVideo.url, primaryVideo.type)
    : null;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-16 md:mb-20 tracking-tight">
          {t('title')}
        </h2>

        {/* Case Study Card */}
        <div className="max-w-5xl mx-auto">
          {/* Video Embed or Thumbnail */}
          {videoEmbedUrl ? (
            <div className="aspect-video bg-black mb-8 overflow-hidden">
              <iframe
                src={videoEmbedUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                title={caseStudy.title}
              />
            </div>
          ) : caseStudy.featured_image_url ? (
            <div className="aspect-video bg-black mb-8 overflow-hidden relative">
              <Image
                src={caseStudy.featured_image_url}
                alt={caseStudy.title}
                fill
                className="object-cover"
              />
            </div>
          ) : null}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-8 mb-6 text-sm uppercase tracking-wider">
            <div>
              <span className="text-[#6b7280] block mb-1">{t('client')}</span>
              <span className="font-semibold">{caseStudy.client_name}</span>
            </div>
            <div>
              <span className="text-[#6b7280] block mb-1">{t('category')}</span>
              <span className="font-semibold">
                {caseStudy.categories
                  .map((cat) => (locale === 'fr' ? cat.name_fr : cat.name_en))
                  .join(', ')}
              </span>
            </div>
            {caseStudy.year && (
              <div>
                <span className="text-[#6b7280] block mb-1">{t('year')}</span>
                <span className="font-semibold">{caseStudy.year}</span>
              </div>
            )}
          </div>

          {/* Title & Excerpt */}
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            {caseStudy.title}
          </h3>
          {caseStudy.excerpt && (
            <p className="text-[#6b7280] text-lg leading-relaxed mb-8 max-w-3xl">
              {caseStudy.excerpt}
            </p>
          )}

          {/* CTA */}
          <Link href={`/work/${caseStudy.slug}`} className="btn btn-outline">
            {t('viewProject')}
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
