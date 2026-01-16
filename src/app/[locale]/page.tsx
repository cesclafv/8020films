import { setRequestLocale } from 'next-intl/server';
import {
  Header,
  Footer,
  HeroSection,
  CapabilitiesSection,
  QuoteFormSection,
} from '@/components/marketing';
import { WorkGridSectionServer } from '@/components/marketing/WorkGridSectionServer';
import { CaseStudySectionServer } from '@/components/marketing/CaseStudySectionServer';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <WorkGridSectionServer locale={locale} />
        <CapabilitiesSection />
        <CaseStudySectionServer locale={locale} />
        <QuoteFormSection />
      </main>
      <Footer />
    </>
  );
}
