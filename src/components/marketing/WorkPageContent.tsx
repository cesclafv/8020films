'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { WorkReference, Category } from '@/lib/supabase/queries';

type Props = {
  initialWorkReferences: WorkReference[];
  categories: Category[];
  locale: string;
};

export function WorkPageContent({
  initialWorkReferences,
  categories,
  locale,
}: Props) {
  const t = useTranslations('WorkPage');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredReferences = useMemo(() => {
    if (!activeFilter) return initialWorkReferences;
    return initialWorkReferences.filter((ref) =>
      ref.categories.some((cat) => cat.slug === activeFilter)
    );
  }, [initialWorkReferences, activeFilter]);

  const getCategoryName = (cat: Category) => {
    return locale === 'fr' ? cat.name_fr : cat.name_en;
  };

  return (
    <div className="container mx-auto px-6 pb-20">
      {/* Page Header */}
      <div className="mb-16 md:mb-20">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">{t('title')}</h1>
        <p className="text-[#6b7280] text-lg max-w-2xl">
          {t('subtitle')}
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-12">
        <button
          onClick={() => setActiveFilter(null)}
          className={cn(
            'px-5 py-2 text-sm font-semibold uppercase tracking-wider transition-all border-2',
            activeFilter === null
              ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
              : 'bg-transparent text-[#1a1a1a] border-[#e5e7eb] hover:border-[#1a1a1a]'
          )}
        >
          {t('allFilter')}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveFilter(category.slug)}
            className={cn(
              'px-5 py-2 text-sm font-semibold uppercase tracking-wider transition-all border-2',
              activeFilter === category.slug
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                : 'bg-transparent text-[#1a1a1a] border-[#e5e7eb] hover:border-[#1a1a1a]'
            )}
          >
            {getCategoryName(category)}
          </button>
        ))}
      </div>

      {/* Work Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReferences.map((reference) => (
          <Link
            key={reference.id}
            href={`/work/${reference.slug}`}
            className="work-item group"
          >
            {reference.featured_image_url ? (
              <Image
                src={reference.featured_image_url}
                alt={reference.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, hsl(${Math.random() * 360}, 30%, 25%) 0%, hsl(${Math.random() * 360}, 40%, 15%) 100%)`,
                }}
              />
            )}
            <div className="work-item-overlay">
              <span className="text-white/70 text-xs uppercase tracking-wider mb-1">
                {reference.client_name}
              </span>
              <h3 className="text-white font-bold text-lg">{reference.title}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {reference.categories.slice(0, 2).map((cat) => (
                  <span
                    key={cat.slug}
                    className="text-white/60 text-xs bg-white/10 px-2 py-0.5 rounded"
                  >
                    {locale === 'fr' ? cat.name_fr : cat.name_en}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredReferences.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[#6b7280] text-lg">{t('noResults')}</p>
        </div>
      )}
    </div>
  );
}
