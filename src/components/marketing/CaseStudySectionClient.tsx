'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Lightbox } from '@/components/ui/Lightbox';
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

  // Determine if we have a video for the hero
  const hasVideo = !!videoEmbedUrl;

  // Get all images for the thumbnail column
  // If there's a video, use featured image first then project images
  // If no video, featured image is used as hero, so only use project images
  const allThumbnailImages = hasVideo
    ? [
        ...(caseStudy.featured_image_url ? [{ url: caseStudy.featured_image_url, alt: caseStudy.title }] : []),
        ...caseStudy.images,
      ]
    : caseStudy.images;

  const [scrollIndex, setScrollIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const visibleCount = 3;
  const maxIndex = Math.max(0, allThumbnailImages.length - visibleCount);

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const imageHeight = container.scrollHeight / allThumbnailImages.length;
      container.scrollTo({
        top: index * imageHeight,
        behavior: 'smooth',
      });
    }
    setScrollIndex(index);
  };

  const scrollUp = () => scrollToIndex(Math.max(0, scrollIndex - 1));
  const scrollDown = () => scrollToIndex(Math.min(maxIndex, scrollIndex + 1));

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const goToPrev = () => setLightboxIndex((prev) => (prev === 0 ? allThumbnailImages.length - 1 : prev - 1));
  const goToNext = () => setLightboxIndex((prev) => (prev === allThumbnailImages.length - 1 ? 0 : prev + 1));

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-16 md:mb-20 tracking-tight">
          {t('title')}
        </h2>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-stretch">
          {/* Left column: Content (2/3 width) */}
          <div className="lg:col-span-2">
            {/* Hero Video or Image */}
            {videoEmbedUrl ? (
              <div className="aspect-video bg-black mb-8 overflow-hidden rounded-xl">
                <iframe
                  src={videoEmbedUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  title={caseStudy.title}
                />
              </div>
            ) : caseStudy.featured_image_url ? (
              <div className="aspect-video bg-black mb-8 overflow-hidden rounded-xl relative">
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
            </div>

            {/* Title & Excerpt */}
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {caseStudy.title}
            </h3>
            {caseStudy.excerpt && (
              <p className="text-[#6b7280] text-lg leading-relaxed mb-8">
                {caseStudy.excerpt}
              </p>
            )}

            {/* CTA */}
            <Link href={`/work/${caseStudy.slug}`} className="btn btn-outline">
              {t('viewProject')}
              <span className="ml-2">→</span>
            </Link>
          </div>

          {/* Right column: Thumbnail images with scroll arrows (hidden on mobile) */}
          {allThumbnailImages.length > 0 && (
            <div className="hidden lg:flex flex-col h-full">
              {/* Up Arrow - only show after scrolling down */}
              {scrollIndex > 0 ? (
                <div className="h-10 flex items-center justify-center flex-shrink-0">
                  <button
                    onClick={scrollUp}
                    className="p-2 opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Scroll up"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="h-10 flex-shrink-0" />
              )}

              {/* Scrollable Images Container */}
              <div
                ref={scrollContainerRef}
                className="flex flex-col gap-4 overflow-hidden flex-1"
              >
                {allThumbnailImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => openLightbox(index)}
                    className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer flex-shrink-0"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || caseStudy.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>

              {/* Down Arrow */}
              {scrollIndex < maxIndex ? (
                <div className="h-10 flex items-center justify-center flex-shrink-0">
                  <button
                    onClick={scrollDown}
                    className="p-2 opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Scroll down"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="h-10 flex-shrink-0" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={allThumbnailImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}
    </section>
  );
}
