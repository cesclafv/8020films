'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

function LoadingScreen({ isVisible }: { isVisible: boolean }) {
  return (
    <div
      className={`absolute inset-0 bg-[#0a0a0a] z-[5] flex items-center justify-center pb-24 transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center px-8">
        {/* Logo */}
        <div className="relative max-w-md w-full">
          <Image
            src="/img/logo-8020Films-horizontal_white_1000px.png"
            alt="8020 Films"
            width={1000}
            height={200}
            className="w-full h-auto loading-logo"
            priority
          />

          {/* Animated line underneath */}
          <div className="mt-6 h-[2px] bg-white/20 overflow-hidden rounded-full">
            <div className="h-full w-1/3 bg-white/80 loading-line" />
          </div>
        </div>

        {/* Subtle loading dots */}
        <div className="mt-8 flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/60 loading-dot" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-white/60 loading-dot" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-white/60 loading-dot" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      <style jsx>{`
        .loading-logo {
          animation: logoReveal 0.8s ease-out forwards;
        }

        @keyframes logoReveal {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .loading-line {
          animation: lineSlide 1.5s ease-in-out infinite;
        }

        @keyframes lineSlide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        .loading-dot {
          animation: dotPulse 1s ease-in-out infinite;
        }

        @keyframes dotPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}

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

// Helper to render description with linked city names
function DescriptionWithLinks({ text }: { text: string }) {
  const cityLinks: Record<string, string> = {
    'Paris': '/paris',
    'London': '/london',
    'Los Angeles': '/los-angeles',
    'Londres': '/london', // French
  };

  // Split text while keeping delimiters, but handle city names
  const parts: (string | React.ReactNode)[] = [];
  let remainingText = text;
  let key = 0;

  // Find all cities in the text and their positions
  const cityMatches: { city: string; index: number; link: string }[] = [];
  for (const [city, link] of Object.entries(cityLinks)) {
    let searchIndex = 0;
    while (true) {
      const idx = remainingText.indexOf(city, searchIndex);
      if (idx === -1) break;
      cityMatches.push({ city, index: idx, link });
      searchIndex = idx + city.length;
    }
  }

  // Sort by index
  cityMatches.sort((a, b) => a.index - b.index);

  // Remove duplicates (e.g., if "London" matches but "Londres" doesn't exist)
  const seen = new Set<number>();
  const uniqueMatches = cityMatches.filter(m => {
    if (seen.has(m.index)) return false;
    seen.add(m.index);
    return true;
  });

  // Build parts
  let lastIndex = 0;
  for (const match of uniqueMatches) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <Link
        key={key++}
        href={match.link}
        className="underline decoration-1 underline-offset-2 hover:text-[#ff6b6b] transition-colors"
      >
        {match.city}
      </Link>
    );
    lastIndex = match.index + match.city.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
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
    <section className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 bg-black">
        {/* Animated loading screen */}
        <LoadingScreen isVisible={!showVideo} />
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
          <div className="relative max-w-xl">
            {/* Logo - slides up from behind text box (hidden on mobile and short viewports) */}
            <div
              className={`hidden md:block short:hidden absolute bottom-full left-0 right-0 mb-6 transition-all duration-1000 ease-out ${
                showVideo
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-16'
              }`}
            >
              <Image
                src="/img/logo-8020Films-horizontal_white_1000px.png"
                alt="8020 Films"
                width={1000}
                height={200}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Text box - higher z-index so logo slides from behind */}
            <div className="relative z-10 bg-white/95 backdrop-blur-sm p-8 md:p-10 short:p-4">
              <p className="text-[#1a1a1a] text-lg md:text-xl leading-relaxed mb-6 short:text-sm short:mb-3 short:leading-snug">
                <DescriptionWithLinks text={t('description')} />
              </p>
              <button onClick={scrollToQuote} className="btn btn-primary short:text-xs short:py-2 short:px-4">
                {t('cta')}
                <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-16 md:bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
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
