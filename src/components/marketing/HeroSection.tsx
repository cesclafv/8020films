'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';

type VideoSettings = {
  url: string;
  type: 'vimeo' | 'youtube';
};

// Extract video ID and build embed URL
function getVideoEmbedUrl(url: string, type: 'vimeo' | 'youtube'): string | null {
  if (type === 'vimeo') {
    // Match vimeo.com/123456789 or player.vimeo.com/video/123456789
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (match) {
      return `https://player.vimeo.com/video/${match[1]}?background=1&autoplay=1&loop=1&muted=1&quality=1080p`;
    }
  }
  if (type === 'youtube') {
    // Match youtube.com/watch?v=ID or youtu.be/ID
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
    }
  }
  return null;
}

export function HeroSection() {
  const t = useTranslations('HomePage.hero');
  const [videoSettings, setVideoSettings] = useState<VideoSettings | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchVideoSettings = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data } = await supabase
        .from('homepage_settings')
        .select('hero_video_url, hero_video_type')
        .single();

      if (data?.hero_video_url) {
        setVideoSettings({
          url: data.hero_video_url,
          type: data.hero_video_type || 'vimeo',
        });
        // Delay showing video to let it buffer
        setTimeout(() => setShowVideo(true), 1000);
      }
    };

    fetchVideoSettings();
  }, []);

  const scrollToQuote = () => {
    const quoteSection = document.getElementById('quote-section');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const embedUrl = videoSettings
    ? getVideoEmbedUrl(videoSettings.url, videoSettings.type)
    : null;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 bg-black">
        {/* Black cover that hides video loading state */}
        <div className={`absolute inset-0 bg-black z-[5] transition-opacity duration-700 ${showVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />
        <div className="absolute inset-0 bg-black/40 z-10" />
        {embedUrl && (
          <iframe
            src={embedUrl}
            className="absolute top-1/2 left-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full -translate-x-1/2 -translate-y-1/2"
            allow="autoplay; fullscreen"
            title="8020 Films Showreel"
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-end pb-24 px-6">
        <div className="container mx-auto">
          {/* Logo above the box */}
          <div className="max-w-xl mb-6">
            <Image
              src="/img/logo-8020Films-horizontal_white_1000px.png"
              alt="8020 Films"
              width={1000}
              height={200}
              className="w-full h-auto"
              priority
            />
          </div>
          <div className="max-w-xl bg-white/95 backdrop-blur-sm p-8 md:p-10">
            <p className="text-[#1a1a1a] text-lg md:text-xl leading-relaxed mb-6">
              {t('description')}
            </p>
            <button onClick={scrollToQuote} className="btn btn-primary">
              {t('cta')}
              <span className="ml-2">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
