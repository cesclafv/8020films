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

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workReferences.slice(0, 9).map((project, index) => {
            // First item is large (spans 2 cols and 2 rows on desktop)
            const isLarge = index === 0;

            return (
              <Link
                key={project.id}
                href={`/work/${project.slug}`}
                className={`work-item rounded-xl ${
                  isLarge
                    ? 'md:col-span-2 md:row-span-2'
                    : ''
                } ${index >= 3 ? 'hidden md:block' : ''}`}
              >
                {project.featured_image_url ? (
                  <Image
                    src={project.featured_image_url}
                    alt={project.title}
                    fill
                    className="object-cover rounded-xl"
                    sizes={isLarge
                      ? "(max-width: 768px) 100vw, 66vw"
                      : "(max-width: 768px) 100vw, 33vw"
                    }
                  />
                ) : (
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg,
                        hsl(${(index * 40) % 360}, 30%, 25%) 0%,
                        hsl(${(index * 40 + 60) % 360}, 40%, 15%) 100%)`,
                    }}
                  />
                )}
                <div className="work-item-overlay rounded-xl">
                  <h3 className="text-white font-bold text-lg">{project.title}</h3>
                </div>
              </Link>
            );
          })}
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
