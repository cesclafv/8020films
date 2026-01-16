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

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
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
