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
    title: t('musicVideo.metaTitle'),
    description: t('musicVideo.metaDescription'),
    alternates: {
      canonical: `${baseUrl}/${locale}/services/music-video`,
      languages: {
        en: `${baseUrl}/en/services/music-video`,
        fr: `${baseUrl}/fr/services/music-video`,
        es: `${baseUrl}/es/services/music-video`,
        'x-default': `${baseUrl}/en/services/music-video`,
      },
    },
    openGraph: {
      title: t('musicVideo.metaTitle'),
      description: t('musicVideo.metaDescription'),
      url: `${baseUrl}/${locale}/services/music-video`,
      siteName: '8020 Films',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function MusicVideoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const workReferences = await getWorkReferences(locale, 'music');

  return (
    <>
      <Header />
      <main>
        <ServicePageContent
          service="musicVideo"
          locale={locale}
          workReferences={workReferences}
        />
      </main>
      <ServiceJsonLd service="musicVideo" />
      <Footer />
    </>
  );
}
