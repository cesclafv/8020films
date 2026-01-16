import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Dashboard');

  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold">{t('title')}</h1>
      <p className="text-sm opacity-80">{t('description')}</p>
    </section>
  );
}
