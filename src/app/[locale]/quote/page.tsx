import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Header, Footer } from '@/components/marketing';
import { QuotePageContent } from '@/components/marketing/QuotePageContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'QuotePage' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function QuotePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('QuotePage');

  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              {t('title')}
            </h1>
            <div className="text-lg text-[#6b7280] space-y-4">
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
            </div>
          </div>

          {/* Form Section */}
          <QuotePageContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
