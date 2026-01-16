import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Header, Footer } from '@/components/marketing';
import { WorkPageContent } from '@/components/marketing/WorkPageContent';
import { getWorkReferences, getCategories } from '@/lib/supabase/queries';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'WorkPage' });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://8020films.com';

  const title = t('metaTitle');
  const description = t('metaDescription');

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/work`,
      languages: {
        en: `${baseUrl}/en/work`,
        fr: `${baseUrl}/fr/work`,
        'x-default': `${baseUrl}/en/work`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/work`,
      siteName: '8020 Films',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function WorkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [workReferences, categories] = await Promise.all([
    getWorkReferences(locale),
    getCategories(),
  ]);

  return (
    <>
      <Header />
      <main className="pt-24">
        <WorkPageContent
          initialWorkReferences={workReferences}
          categories={categories}
          locale={locale}
        />
      </main>
      <Footer />
    </>
  );
}
