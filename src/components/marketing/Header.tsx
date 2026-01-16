'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { locales, localeNames, type Locale } from '@/i18n/config';

export function Header() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as Locale;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Check if we're on the homepage (transparent header) or subpage (dark header)
  const isHomepage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/work', label: t('work') },
    { href: '/careers', label: t('careers') },
    { href: '/quote', label: t('getQuote') },
  ];

  const otherLocales = locales.filter((l) => l !== locale);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHomepage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled || !isHomepage
          ? 'bg-[#0a0a0a]/95 backdrop-blur-sm py-4'
          : 'bg-transparent py-6'
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" onClick={handleLogoClick} className="relative z-[70]">
          <Image
            src="/img/logo-8020Films-horizontal_white_1000px.png"
            alt="8020 Films"
            width={140}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-white/80 hover:text-white text-sm font-semibold uppercase tracking-wider transition-colors',
                pathname === link.href && 'text-white'
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Language Dropdown */}
          <div ref={langMenuRef} className="relative ml-4 border-l border-white/20 pl-4">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1 text-white/60 hover:text-white text-sm font-semibold uppercase tracking-wider transition-colors"
            >
              {locale.toUpperCase()}
              <svg
                className={cn(
                  'w-3 h-3 transition-transform',
                  isLangMenuOpen && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isLangMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-[#0a0a0a] border border-white/20 rounded-lg py-1 min-w-[100px]">
                {otherLocales.map((l) => (
                  <Link
                    key={l}
                    href={pathname}
                    locale={l}
                    onClick={() => setIsLangMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {localeNames[l]}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden relative z-[70] p-2"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span
              className={cn(
                'block h-0.5 w-full bg-white transition-transform duration-300',
                isMobileMenuOpen && 'rotate-45 translate-y-2'
              )}
            />
            <span
              className={cn(
                'block h-0.5 w-full bg-white transition-opacity duration-300',
                isMobileMenuOpen && 'opacity-0'
              )}
            />
            <span
              className={cn(
                'block h-0.5 w-full bg-white transition-transform duration-300',
                isMobileMenuOpen && '-rotate-45 -translate-y-2'
              )}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu - Outside container for proper fixed positioning */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center gap-8 md:hidden"
          style={{ minHeight: '100vh', minWidth: '100vw' }}
        >
          {/* Close button and logo header */}
          <div className="absolute top-0 left-0 right-0 px-6 py-6 flex items-center justify-between">
            <Link href="/" onClick={(e) => { handleLogoClick(e); setIsMobileMenuOpen(false); }}>
              <Image
                src="/img/logo-8020Films-horizontal_white_1000px.png"
                alt="8020 Films"
                width={140}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2"
              aria-label="Close menu"
            >
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white text-2xl font-bold uppercase tracking-wider"
          >
            {link.label}
          </Link>
        ))}
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/20">
          {otherLocales.map((l) => (
            <Link
              key={l}
              href={pathname}
              locale={l}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white/60 text-lg font-semibold uppercase tracking-wider hover:text-white transition-colors"
            >
              {localeNames[l]}
            </Link>
          ))}
        </div>
        </div>
      )}
    </header>
  );
}
