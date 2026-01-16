import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Header, Footer } from '@/components/marketing';
import { LocationPageContent } from '@/components/marketing/LocationPageContent';
import { LocalBusinessJsonLd } from '@/components/seo/JsonLd';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LocationPages' });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://8020films.com';

  return {
    title: t('london.metaTitle'),
    description: t('london.metaDescription'),
    alternates: {
      canonical: `${baseUrl}/${locale}/london`,
      languages: {
        en: `${baseUrl}/en/london`,
        fr: `${baseUrl}/fr/london`,
        es: `${baseUrl}/es/london`,
        'x-default': `${baseUrl}/en/london`,
      },
    },
    openGraph: {
      title: t('london.metaTitle'),
      description: t('london.metaDescription'),
      url: `${baseUrl}/${locale}/london`,
      siteName: '8020 Films',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function LondonPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <LocationPageContent location="london" locale={locale} />
      </main>
      <LocalBusinessJsonLd location="london" />
      <Footer />
    </>
  );
}
