import { getFeaturedCaseStudy } from '@/lib/supabase/queries';
import { CaseStudySectionClient } from './CaseStudySectionClient';

type Props = {
  locale: string;
};

export async function CaseStudySectionServer({ locale }: Props) {
  const caseStudy = await getFeaturedCaseStudy(locale);

  if (!caseStudy) {
    return null;
  }

  return <CaseStudySectionClient caseStudy={caseStudy} locale={locale} />;
}
