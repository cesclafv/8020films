'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if we're on the homepage (transparent header) or subpage (dark header)
  const isHomepage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/work', label: t('work') },
    { href: '/careers', label: t('careers') },
    { href: '/quote', label: t('getQuote') },
  ];

  const toggleLocale = locale === 'en' ? 'fr' : 'en';

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
        <Link href="/" className="relative z-[70]">
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

          {/* Language Toggle */}
          <Link
            href={pathname}
            locale={toggleLocale}
            className="text-white/60 hover:text-white text-sm font-semibold uppercase tracking-wider transition-colors ml-4 border-l border-white/20 pl-4"
          >
            {toggleLocale.toUpperCase()}
          </Link>
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

        {/* Mobile Menu */}
        <div
          className={cn(
            'fixed inset-0 z-[60] bg-[#0a0a0a] flex flex-col items-center justify-center gap-8 transition-opacity duration-300 md:hidden',
            isMobileMenuOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          )}
        >
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
          <Link
            href={pathname}
            locale={toggleLocale}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white/60 text-lg font-semibold uppercase tracking-wider mt-4 pt-4 border-t border-white/20"
          >
            {toggleLocale === 'en' ? 'English' : 'Français'}
          </Link>
        </div>
      </div>
    </header>
  );
}
