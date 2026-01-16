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
    title: t('losAngeles.metaTitle'),
    description: t('losAngeles.metaDescription'),
    alternates: {
      canonical: `${baseUrl}/${locale}/los-angeles`,
      languages: {
        en: `${baseUrl}/en/los-angeles`,
        fr: `${baseUrl}/fr/los-angeles`,
        es: `${baseUrl}/es/los-angeles`,
        'x-default': `${baseUrl}/en/los-angeles`,
      },
    },
    openGraph: {
      title: t('losAngeles.metaTitle'),
      description: t('losAngeles.metaDescription'),
      url: `${baseUrl}/${locale}/los-angeles`,
      siteName: '8020 Films',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function LosAngelesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <LocationPageContent location="losAngeles" locale={locale} />
      </main>
      <LocalBusinessJsonLd location="losAngeles" />
      <Footer />
    </>
  );
}
