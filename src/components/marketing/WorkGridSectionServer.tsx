import { getHomepageWorkReferences } from '@/lib/supabase/queries';
import { WorkGridSectionClient } from './WorkGridSectionClient';

type Props = {
  locale: string;
};

export async function WorkGridSectionServer({ locale }: Props) {
  const workReferences = await getHomepageWorkReferences(locale);

  return <WorkGridSectionClient workReferences={workReferences} locale={locale} />;
}
