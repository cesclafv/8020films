import { createSupabaseServerClient as createClient, createSupabaseBuildClient } from './server';

export type WorkReference = {
  id: string;
  slug: string;
  client_name: string;
  year: string | null;
  featured_image_url: string | null;
  is_featured_on_homepage: boolean;
  homepage_order: number | null;
  is_case_study: boolean;
  locale: string;
  title: string;
  excerpt: string | null;
  body_html: string | null;
  categories: Array<{ slug: string; name_en: string; name_fr: string; name_es?: string }>;
  videos: Array<{ url: string; type: string }>;
  images: Array<{ url: string; alt: string | null }>;
};

export type Category = {
  id: string;
  slug: string;
  name_en: string;
  name_fr: string;
  name_es?: string;
  display_order: number;
};

// Fetch all categories
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

// Fetch work references for a specific locale
export async function getWorkReferences(
  locale: string,
  categorySlug?: string
): Promise<WorkReference[]> {
  const supabase = await createClient();

  let query = supabase
    .from('work_references_with_translations')
    .select('*')
    .eq('locale', locale)
    .order('homepage_order', { ascending: true, nullsFirst: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching work references:', error);
    return [];
  }

  let results = data || [];

  // Filter by category if specified
  if (categorySlug) {
    results = results.filter((item) =>
      item.categories.some((cat: { slug: string }) => cat.slug === categorySlug)
    );
  }

  // If no results for this locale, fall back to English
  if (results.length === 0 && locale !== 'en') {
    return getWorkReferences('en', categorySlug);
  }

  return results;
}

// Fetch homepage work references (featured ones)
export async function getHomepageWorkReferences(
  locale: string
): Promise<WorkReference[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('work_references_with_translations')
    .select('*')
    .eq('locale', locale)
    .eq('is_featured_on_homepage', true)
    .order('homepage_order')
    .limit(9);

  if (error) {
    console.error('Error fetching homepage work references:', error);
    return [];
  }

  const results = data || [];

  // If no results for this locale, fall back to English
  if (results.length === 0 && locale !== 'en') {
    return getHomepageWorkReferences('en');
  }

  return results;
}

// Fetch featured case study
export async function getFeaturedCaseStudy(
  locale: string
): Promise<WorkReference | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('work_references_with_translations')
    .select('*')
    .eq('locale', locale)
    .eq('is_case_study', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching case study:', error);
    return null;
  }

  // If no case study for this locale, try falling back to English
  if (!data && locale !== 'en') {
    return getFeaturedCaseStudy('en');
  }

  return data;
}

// Fetch single work reference by slug
export async function getWorkReferenceBySlug(
  slug: string,
  locale: string
): Promise<WorkReference | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('work_references_with_translations')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .maybeSingle();

  if (error) {
    console.error('Error fetching work reference:', error);
    return null;
  }

  // If no translation for this locale, fall back to English
  if (!data && locale !== 'en') {
    return getWorkReferenceBySlug(slug, 'en');
  }

  return data;
}

// Get all work reference slugs for static generation (build time)
export async function getAllWorkReferenceSlugs(): Promise<string[]> {
  const supabase = createSupabaseBuildClient();

  const { data, error } = await supabase
    .from('work_references')
    .select('slug');

  if (error) {
    console.error('Error fetching work reference slugs:', error);
    return [];
  }

  return data?.map((item) => item.slug) || [];
}

// Get all work references with images for sitemap
export async function getAllWorkReferencesForSitemap(): Promise<
  Array<{ slug: string; featured_image_url: string | null; updated_at: string | null }>
> {
  const supabase = createSupabaseBuildClient();

  const { data, error } = await supabase
    .from('work_references')
    .select('slug, featured_image_url, updated_at');

  if (error) {
    console.error('Error fetching work references for sitemap:', error);
    return [];
  }

  return data || [];
}

// Get related work references (same category, excluding current)
export async function getRelatedWorkReferences(
  currentSlug: string,
  categorySlug: string,
  locale: string,
  limit: number = 3
): Promise<WorkReference[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('work_references_with_translations')
    .select('*')
    .eq('locale', locale)
    .neq('slug', currentSlug)
    .limit(limit * 2); // Fetch more to filter by category

  if (error) {
    console.error('Error fetching related work references:', error);
    return [];
  }

  // Filter by category and limit
  const filtered = (data || [])
    .filter((item) =>
      item.categories.some((cat: { slug: string }) => cat.slug === categorySlug)
    )
    .slice(0, limit);

  // If not enough related items, fill with other work
  if (filtered.length < limit) {
    const others = (data || [])
      .filter((item) => !filtered.some((f) => f.slug === item.slug))
      .slice(0, limit - filtered.length);
    return [...filtered, ...others];
  }

  return filtered;
}

// Submit a quote request
export async function submitQuoteRequest(formData: {
  company: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  project_type?: string;
  budget_range?: string;
  message: string;
  additional_info?: string;
  how_heard?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from('quote_submissions').insert(formData);

  if (error) {
    console.error('Error submitting quote:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Subscribe to newsletter
export async function subscribeToNewsletter(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseBuildClient();

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email });

  if (error) {
    // Handle duplicate email
    if (error.code === '23505') {
      return { success: true }; // Already subscribed, treat as success
    }
    console.error('Error subscribing to newsletter:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
