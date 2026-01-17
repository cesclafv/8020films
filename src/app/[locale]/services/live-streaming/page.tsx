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
    title: t('liveStreaming.metaTitle'),
    description: t('liveStreaming.metaDescription'),
    alternates: {
      canonical: `${baseUrl}/${locale}/services/live-streaming`,
      languages: {
        en: `${baseUrl}/en/services/live-streaming`,
        fr: `${baseUrl}/fr/services/live-streaming`,
        es: `${baseUrl}/es/services/live-streaming`,
        'x-default': `${baseUrl}/en/services/live-streaming`,
      },
    },
    openGraph: {
      title: t('liveStreaming.metaTitle'),
      description: t('liveStreaming.metaDescription'),
      url: `${baseUrl}/${locale}/services/live-streaming`,
      siteName: '8020 Films',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function LiveStreamingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [workReferences, serviceImages] = await Promise.all([
    getWorkReferences(locale, 'live-streaming-events'),
    getServiceImages('liveStreaming'),
  ]);

  return (
    <>
      <Header />
      <main>
        <ServicePageContent
          service="liveStreaming"
          locale={locale}
          workReferences={workReferences}
          serviceImages={serviceImages}
        />
      </main>
      <ServiceJsonLd service="liveStreaming" />
      <Footer />
    </>
  );
}
