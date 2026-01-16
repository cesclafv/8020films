'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

type ClientLogo = {
  id: string;
  name: string;
  image_url: string;
  display_order: number;
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function LogoBannerSection() {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    const fetchLogos = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('client_logos')
        .select('id, name, image_url, display_order')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Error fetching logos:', error);
        setLoading(false);
        return;
      }

      setLogos(shuffleArray(data || []));
      setLoading(false);
    };

    fetchLogos();
  }, []);

  // Calculate scroll width after logos render
  useEffect(() => {
    if (firstSetRef.current && logos.length > 0) {
      // Small delay to ensure images are laid out
      const timer = setTimeout(() => {
        if (firstSetRef.current) {
          setScrollWidth(firstSetRef.current.offsetWidth);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [logos]);

  // Don't render anything while loading or if no logos
  if (loading || logos.length === 0) {
    return null;
  }

  // Calculate animation duration based on number of logos (slower with more logos)
  const duration = Math.max(20, logos.length * 2);

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="relative">
        <div
          className="flex will-change-transform"
          style={{
            animation: scrollWidth > 0
              ? `logoMarquee ${duration}s linear infinite`
              : 'none',
          }}
        >
          {/* First set of logos */}
          <div
            ref={firstSetRef}
            className="flex shrink-0 items-center gap-8 md:gap-10 px-4 md:px-6"
          >
            {logos.map((logo) => (
              <div
                key={`logo-1-${logo.id}`}
                className="relative h-14 w-36 md:h-16 md:w-40 shrink-0 grayscale opacity-60 hover:opacity-80 transition-opacity"
              >
                <Image
                  src={logo.image_url}
                  alt={logo.name}
                  fill
                  className="object-contain"
                  sizes="160px"
                />
              </div>
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex shrink-0 items-center gap-8 md:gap-10 px-4 md:px-6">
            {logos.map((logo) => (
              <div
                key={`logo-2-${logo.id}`}
                className="relative h-14 w-36 md:h-16 md:w-40 shrink-0 grayscale opacity-60 hover:opacity-80 transition-opacity"
              >
                <Image
                  src={logo.image_url}
                  alt={logo.name}
                  fill
                  className="object-contain"
                  sizes="160px"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic keyframes injected via style tag */}
      {scrollWidth > 0 && (
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes logoMarquee {
              from {
                transform: translateX(0);
              }
              to {
                transform: translateX(-${scrollWidth}px);
              }
            }
          `
        }} />
      )}
    </section>
  );
}
