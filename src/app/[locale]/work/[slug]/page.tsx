import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Header, Footer } from '@/components/marketing';
import { ImageGallery } from '@/components/marketing/ImageGallery';
import { Link } from '@/i18n/navigation';
import { getWorkReferenceBySlug, getAllWorkReferenceSlugs } from '@/lib/supabase/queries';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  // Fetch all work reference slugs for static generation
  const slugs = await getAllWorkReferenceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const workReference = await getWorkReferenceBySlug(slug, locale);

  if (!workReference) {
    return { title: 'Not Found' };
  }

  return {
    title: `${workReference.title} | 8020 Films`,
    description: workReference.excerpt,
  };
}

export default async function WorkReferencePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('WorkReferencePage');
  const workReference = await getWorkReferenceBySlug(slug, locale);

  if (!workReference) {
    notFound();
  }

  // Extract video ID for embed
  const getVideoEmbed = (url: string, type: string) => {
    if (type === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) {
        return `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`;
      }
    }
    if (type === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    return null;
  };

  const primaryVideo = workReference.videos[0];
  const videoEmbedUrl = primaryVideo
    ? getVideoEmbed(primaryVideo.url, primaryVideo.type)
    : null;

  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <article className="container mx-auto px-6">
          {/* Back Link */}
          <Link
            href="/work"
            className="inline-flex items-center text-[#6b7280] hover:text-[#1a1a1a] mb-8 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t('backToWork')}
          </Link>

          {/* Hero Image or Video */}
          <div className="mb-12">
            {videoEmbedUrl ? (
              <div className="aspect-video bg-black overflow-hidden">
                <iframe
                  src={videoEmbedUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  title={workReference.title}
                />
              </div>
            ) : workReference.featured_image_url ? (
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={workReference.featured_image_url}
                  alt={workReference.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : null}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-8 mb-8 text-sm uppercase tracking-wider">
            <div>
              <span className="text-[#6b7280] block mb-1">{t('client')}</span>
              <span className="font-semibold">{workReference.client_name}</span>
            </div>
            {workReference.year && (
              <div>
                <span className="text-[#6b7280] block mb-1">{t('year')}</span>
                <span className="font-semibold">{workReference.year}</span>
              </div>
            )}
            <div>
              <span className="text-[#6b7280] block mb-1">{t('category')}</span>
              <span className="font-semibold">
                {workReference.categories
                  .map((cat) => (locale === 'fr' ? cat.name_fr : cat.name_en))
                  .join(', ')}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {workReference.title}
          </h1>

          {/* Excerpt */}
          {workReference.excerpt && (
            <p className="text-xl text-[#6b7280] mb-8 max-w-3xl">
              {workReference.excerpt}
            </p>
          )}

          {/* Body Content */}
          {workReference.body_html && (
            <div
              className="prose prose-lg max-w-3xl mb-12"
              dangerouslySetInnerHTML={{ __html: workReference.body_html }}
            />
          )}

          {/* Gallery Images */}
          <ImageGallery
            images={workReference.images}
            title={workReference.title}
            galleryLabel={t('gallery')}
          />

          {/* CTA */}
          <div className="border-t border-[#e5e7eb] pt-12 mt-12">
            <h3 className="text-2xl font-bold mb-4">{t('ctaTitle')}</h3>
            <p className="text-[#6b7280] mb-6">{t('ctaDescription')}</p>
            <Link href="/quote" className="btn btn-primary">
              {t('ctaButton')}
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
