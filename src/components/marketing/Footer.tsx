'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('Footer');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#0a0a0a] text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo */}
          <div className="md:col-span-1">
            <Link href="/">
              <Image
                src="/img/logo-8020Films-horizontal_white_1000px.png"
                alt="8020 Films"
                width={160}
                height={45}
                className="h-10 w-auto mb-4"
              />
            </Link>
            <p className="text-white/60 text-sm">
              {t('tagline')}
            </p>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">
              {t('followUs')}
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://instagram.com/8020films"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
              >
                <InstagramIcon />
                Instagram
              </a>
              <a
                href="https://linkedin.com/company/8020films"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
              >
                <LinkedInIcon />
                LinkedIn
              </a>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">
              {t('connect')}
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/quote"
                className="text-white/60 hover:text-white transition-colors"
              >
                {t('contactUs')}
              </Link>
              <Link
                href="/admin"
                className="text-white/60 hover:text-white transition-colors"
              >
                {t('login')}
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">
              {t('newsletter')}
            </h4>
            {isSubmitted ? (
              <p className="text-green-400 text-sm">{t('newsletterSuccess')}</p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="input input-dark flex-1 py-2 px-3 text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-[#0a0a0a] px-4 py-2 text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '...' : '→'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} 8020 Films. {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
