'use client';

import { useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('HomePage.hero');

  const scrollToQuote = () => {
    const quoteSection = document.getElementById('quote-section');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <iframe
          src="https://player.vimeo.com/video/950307098?h=01466759b3&background=1&autoplay=1&loop=1&muted=1&quality=1080p"
          className="absolute top-1/2 left-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full -translate-x-1/2 -translate-y-1/2"
          allow="autoplay; fullscreen"
          title="8020 Films Showreel"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-end pb-24 px-6">
        <div className="container mx-auto">
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
