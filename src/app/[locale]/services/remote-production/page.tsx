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
    title: t('remoteProduction.metaTitle'),
    description: t('remoteProduction.metaDescription'),
    alternates: {
      canonical: `${baseUrl}/${locale}/services/remote-production`,
      languages: {
        en: `${baseUrl}/en/services/remote-production`,
        fr: `${baseUrl}/fr/services/remote-production`,
        es: `${baseUrl}/es/services/remote-production`,
        'x-default': `${baseUrl}/en/services/remote-production`,
      },
    },
    openGraph: {
      title: t('remoteProduction.metaTitle'),
      description: t('remoteProduction.metaDescription'),
      url: `${baseUrl}/${locale}/services/remote-production`,
      siteName: '8020 Films',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function RemoteProductionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const workReferences = await getWorkReferences(locale, 'remote-production');

  return (
    <>
      <Header />
      <main>
        <ServicePageContent
          service="remoteProduction"
          locale={locale}
          workReferences={workReferences}
        />
      </main>
      <ServiceJsonLd service="remoteProduction" />
      <Footer />
    </>
  );
}
