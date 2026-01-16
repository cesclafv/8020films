import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { locales, defaultLocale } from './config';
import { createSupabaseBuildClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

// Cache translations for 30 days (revalidateTag on save provides immediate updates when needed)
const getCachedTranslations = unstable_cache(
  async (locale: string): Promise<Record<string, unknown>> => {
    try {
      const supabase = createSupabaseBuildClient();
      const { data, error } = await supabase
        .from('translations')
        .select('messages')
        .eq('locale', locale)
        .single();

      if (error || !data) {
        console.warn(`Failed to fetch translations for locale '${locale}' from Supabase`);
        return {};
      }

      return data.messages as Record<string, unknown>;
    } catch (error) {
      console.warn(`Error fetching translations for locale '${locale}':`, error);
      return {};
    }
  },
  ['translations'],
  { revalidate: 2592000, tags: ['translations'] }
);

async function getTranslations(locale: string): Promise<Record<string, unknown>> {
  const messages = await getCachedTranslations(locale);

  // If we got messages from Supabase, use them
  if (Object.keys(messages).length > 0) {
    return messages;
  }

  // Fallback to static JSON files
  console.warn(`Using fallback translations for locale '${locale}'`);
  return (await import(`../../messages/${locale}.json`)).default;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !hasLocale(locales, locale)) {
    locale = defaultLocale;
  }

  const messages = await getTranslations(locale);

  return {
    locale,
    messages,
  };
});
