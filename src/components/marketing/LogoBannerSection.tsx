'use client';

import { useMemo } from 'react';
import Image from 'next/image';

const LOGOS = [
  { src: '/img/logo/converse_logo.jpg', alt: 'Converse' },
  { src: '/img/logo/Domino_Records_logo.png', alt: 'Domino Records' },
  { src: '/img/logo/dyson.png', alt: 'Dyson' },
  { src: '/img/logo/EMI-logo.gif', alt: 'EMI' },
  { src: '/img/logo/Galeries-Lafayette-logo.png', alt: 'Galeries Lafayette' },
  { src: '/img/logo/gucci-1-logo-png-transparent.png', alt: 'Gucci' },
  { src: '/img/logo/netflix.png', alt: 'Netflix' },
  { src: '/img/logo/ninja_logo ninja with word ninjatune.jpg', alt: 'Ninja Tune' },
  { src: '/img/logo/pitchfork.jpg', alt: 'Pitchfork' },
  { src: '/img/logo/publicis.gif', alt: 'Publicis' },
  { src: '/img/logo/radio nova logo.gif', alt: 'Radio Nova' },
  { src: '/img/logo/rdr-logo.jpg', alt: 'RDR' },
  { src: '/img/logo/Salesforce.com_logo.svg', alt: 'Salesforce' },
  { src: '/img/logo/Shell-Logo-Wallpapers.jpg', alt: 'Shell' },
  { src: '/img/logo/SonyMusicLogo_09_4Color_Medium.jpg', alt: 'Sony Music' },
  { src: '/img/logo/UNESCO_logo.svg.png', alt: 'UNESCO' },
  { src: '/img/logo/Universal+Music+Oy+universal_logo_big.jpg', alt: 'Universal Music' },
  { src: '/img/logo/Vice_Logo.png', alt: 'Vice' },
  { src: '/img/logo/warp-logo-2.png', alt: 'Warp Records' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function LogoBannerSection() {
  const shuffledLogos = useMemo(() => shuffleArray(LOGOS), []);

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="relative">
        <div className="flex animate-scroll-mobile md:animate-scroll">
          {/* First set of logos */}
          <div className="flex shrink-0 items-center gap-12 md:gap-16 px-6 md:px-8">
            {shuffledLogos.map((logo, index) => (
              <div
                key={`logo-1-${index}`}
                className="relative h-14 w-36 md:h-16 md:w-40 shrink-0 grayscale opacity-60 hover:opacity-80 transition-opacity"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  className="object-contain"
                  sizes="160px"
                />
              </div>
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex shrink-0 items-center gap-12 md:gap-16 px-6 md:px-8">
            {shuffledLogos.map((logo, index) => (
              <div
                key={`logo-2-${index}`}
                className="relative h-14 w-36 md:h-16 md:w-40 shrink-0 grayscale opacity-60 hover:opacity-80 transition-opacity"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  className="object-contain"
                  sizes="160px"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
