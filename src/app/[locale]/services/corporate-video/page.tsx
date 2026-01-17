import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Header, Footer } from '@/components/marketing';
import { ServicePageContent } from '@/components/marketing/ServicePageContent';
import { ServiceJsonLd } from '@/components/seo/JsonLd';
import { getWorkReferences, getServiceImages } from '@/lib/supabase/queries';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ServicePages' });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://8020films.com';

  return {
    title: t('corporateVideo.metaTitle'),
    description: t('corporateVideo.metaDescription'),
    alternates: {
      canonical: `${baseUrl}/${locale}/services/corporate-video`,
      languages: {
        en: `${baseUrl}/en/services/corporate-video`,
        fr: `${baseUrl}/fr/services/corporate-video`,
        es: `${baseUrl}/es/services/corporate-video`,
        'x-default': `${baseUrl}/en/services/corporate-video`,
      },
    },
    openGraph: {
      title: t('corporateVideo.metaTitle'),
      description: t('corporateVideo.metaDescription'),
      url: `${baseUrl}/${locale}/services/corporate-video`,
      siteName: '8020 Films',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function CorporateVideoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [workReferences, serviceImages] = await Promise.all([
    getWorkReferences(locale, 'corp-brand-storytelling'),
    getServiceImages('corporateVideo'),
  ]);

  return (
    <>
      <Header />
      <main>
        <ServicePageContent
          service="corporateVideo"
          locale={locale}
          workReferences={workReferences}
          serviceImages={serviceImages}
        />
      </main>
      <ServiceJsonLd service="corporateVideo" />
      <Footer />
    </>
  );
}
