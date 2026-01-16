'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { WorkReference } from '@/lib/supabase/queries';

type Props = {
  workReferences: WorkReference[];
  locale: string;
};

export function WorkGridSectionClient({ workReferences, locale }: Props) {
  const t = useTranslations('HomePage.work');

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
          {t('title')}
        </h2>
        <p className="text-lg md:text-xl text-[#6b7280] mb-16 md:mb-20 max-w-2xl">
          {t('subtitle')}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workReferences.map((project, index) => (
            <Link
              key={project.id}
              href={`/work/${project.slug}`}
              className={`work-item ${index >= 5 ? 'hidden md:block' : ''}`}
            >
              {project.featured_image_url ? (
                <Image
                  src={project.featured_image_url}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg,
                      hsl(${(index * 40) % 360}, 30%, 25%) 0%,
                      hsl(${(index * 40 + 60) % 360}, 40%, 15%) 100%)`,
                  }}
                />
              )}
              <div className="work-item-overlay">
                <span className="text-white/70 text-xs uppercase tracking-wider mb-1">
                  {project.client_name}
                </span>
                <h3 className="text-white font-bold text-lg">{project.title}</h3>
                <span className="text-white/60 text-sm mt-1">
                  {project.categories
                    .slice(0, 1)
                    .map((cat) => (locale === 'fr' ? cat.name_fr : cat.name_en))
                    .join(', ')}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12">
          <Link href="/work" className="btn btn-outline">
            {t('viewAll')}
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
