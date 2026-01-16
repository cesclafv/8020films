import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Header, Footer } from '@/components/marketing';
import { QuotePageContent } from '@/components/marketing/QuotePageContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ContactPage' });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://8020films.com';

  const title = t('metaTitle');
  const description = t('metaDescription');

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/contact`,
      languages: {
        en: `${baseUrl}/en/contact`,
        fr: `${baseUrl}/fr/contact`,
        es: `${baseUrl}/es/contact`,
        'x-default': `${baseUrl}/en/contact`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/contact`,
      siteName: '8020 Films',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('ContactPage');

  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Title - Full width */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-12 tracking-tight">
            {t('title')}
          </h1>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left column: Intro text */}
            <div className="text-lg text-[#6b7280] space-y-6">
              <p>{t('intro1')}</p>
              <p>{t('intro2')}</p>
              <p className="pt-4">
                <span className="font-semibold text-[#1a1a1a]">
                  {t('emailLabel')}
                </span>
                <br />
                <a
                  href="mailto:hello@8020films.com"
                  className="text-[#ff6b6b] hover:underline"
                >
                  hello@8020films.com
                </a>
              </p>

              {/* Office Locations */}
              <div className="pt-8 space-y-6">
                <h2 className="text-xl font-bold text-[#1a1a1a]">{t('officesTitle')}</h2>

                {/* Los Angeles */}
                <div>
                  <h3 className="font-semibold text-[#1a1a1a]">Los Angeles</h3>
                  <p className="text-sm">
                    10949 Ayres Ave.<br />
                    Los Angeles, CA 90064, USA
                  </p>
                  <a href="tel:+14248772109" className="text-sm text-[#ff6b6b] hover:underline">
                    +1 (424) 877-2109
                  </a>
                  <p className="text-sm text-[#9ca3af]">{t('hours')}: 9am - 8pm</p>
                </div>

                {/* London */}
                <div>
                  <h3 className="font-semibold text-[#1a1a1a]">London</h3>
                  <p className="text-sm">
                    85 Great Portland Street<br />
                    London W1W 7LT, UK
                  </p>
                  <a href="tel:+447450463111" className="text-sm text-[#ff6b6b] hover:underline">
                    +44 7450 463111
                  </a>
                  <p className="text-sm text-[#9ca3af]">{t('hours')}: 9am - 8pm</p>
                </div>
              </div>
            </div>

            {/* Right column: Form */}
            <QuotePageContent />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
