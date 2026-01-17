'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

type ServiceImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
};

type Props = {
  images: ServiceImage[];
  serviceName: string;
};

export function ServiceImageCarousel({ images, serviceName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const checkScrollability = useCallback(() => {
    const container = thumbnailsRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [checkScrollability, images]);

  const scroll = (direction: 'left' | 'right') => {
    const container = thumbnailsRef.current;
    if (!container) return;

    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });

    // Check scrollability after animation
    setTimeout(checkScrollability, 300);
  };

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[activeIndex];

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={activeImage.image_url}
          alt={activeImage.alt_text || `${serviceName} image`}
          fill
          className="object-cover transition-opacity duration-300"
          priority
        />
      </div>

      {/* Thumbnails - only show if more than 1 image */}
      {images.length > 1 && (
        <div className="relative mt-4">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Thumbnails Container */}
          <div
            ref={thumbnailsRef}
            onScroll={checkScrollability}
            className="flex gap-2 overflow-x-auto p-1 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setActiveIndex(index)}
                className={`relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                  index === activeIndex
                    ? 'ring-2 ring-[#ff6b6b] opacity-100'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={image.image_url}
                  alt={image.alt_text || `${serviceName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
