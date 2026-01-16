import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AppLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('App');

  return (
    <div className="min-h-screen">
      <header className="border-b p-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <span className="font-medium">{t('appName')}</span>
          <span className="text-sm opacity-70">{t('navbar')}</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
