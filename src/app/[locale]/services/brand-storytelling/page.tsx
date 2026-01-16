import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Header, Footer } from '@/components/marketing';
import { ServicePageContent } from '@/components/marketing/ServicePageContent';
import { ServiceJsonLd } from '@/components/seo/JsonLd';
import { getWorkReferences } from '@/lib/supabase/queries';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ServicePages' });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://8020films.com';

  return {
    title: t('brandStorytelling.metaTitle'),
    description: t('brandStorytelling.metaDescription'),
    alternates: {
      canonical: `${baseUrl}/${locale}/services/brand-storytelling`,
      languages: {
        en: `${baseUrl}/en/services/brand-storytelling`,
        fr: `${baseUrl}/fr/services/brand-storytelling`,
        es: `${baseUrl}/es/services/brand-storytelling`,
        'x-default': `${baseUrl}/en/services/brand-storytelling`,
      },
    },
    openGraph: {
      title: t('brandStorytelling.metaTitle'),
      description: t('brandStorytelling.metaDescription'),
      url: `${baseUrl}/${locale}/services/brand-storytelling`,
      siteName: '8020 Films',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function BrandStorytellingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const workReferences = await getWorkReferences(locale, 'corp-brand-storytelling');

  return (
    <>
      <Header />
      <main>
        <ServicePageContent
          service="brandStorytelling"
          locale={locale}
          workReferences={workReferences}
        />
      </main>
      <ServiceJsonLd service="brandStorytelling" />
      <Footer />
    </>
  );
}
