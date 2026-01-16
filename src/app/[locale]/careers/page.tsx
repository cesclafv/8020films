import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Header, Footer } from '@/components/marketing';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CareersPage' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function CareersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('CareersPage');

  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              {t('title')}
            </h1>

            {/* Intro */}
            <div className="text-lg text-[#6b7280] space-y-6 mb-12">
              <p>{t('intro1')}</p>
              <p>{t('intro2')}</p>
              <p>{t('intro3')}</p>
            </div>

            {/* What We Look For */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{t('lookingForTitle')}</h2>
              <ul className="space-y-4 text-[#6b7280]">
                <li className="flex items-start">
                  <span className="text-[#ff6b6b] mr-3 mt-1">✓</span>
                  {t('lookingFor1')}
                </li>
                <li className="flex items-start">
                  <span className="text-[#ff6b6b] mr-3 mt-1">✓</span>
                  {t('lookingFor2')}
                </li>
                <li className="flex items-start">
                  <span className="text-[#ff6b6b] mr-3 mt-1">✓</span>
                  {t('lookingFor3')}
                </li>
                <li className="flex items-start">
                  <span className="text-[#ff6b6b] mr-3 mt-1">✓</span>
                  {t('lookingFor4')}
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-[#f8f9fa] p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">{t('contactTitle')}</h2>
              <p className="text-[#6b7280] mb-6">{t('contactDescription')}</p>
              <a
                href="mailto:hello@8020films.com?subject=Career%20Inquiry"
                className="btn btn-primary"
              >
                {t('contactButton')}
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
