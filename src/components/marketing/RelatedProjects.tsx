import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { WorkReference } from '@/lib/supabase/queries';

type Props = {
  projects: WorkReference[];
  title: string;
  locale: string;
};

export function RelatedProjects({ projects, title, locale }: Props) {
  if (projects.length === 0) return null;

  return (
    <section className="border-t border-[#e5e7eb] pt-12 mt-12">
      <h2 className="text-2xl font-bold mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/work/${project.slug}`}
            className="group block"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
              {project.featured_image_url ? (
                <Image
                  src={project.featured_image_url}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
            <h3 className="font-semibold text-lg group-hover:text-[#ff6b6b] transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-[#6b7280]">
              {project.categories
                .map((cat) => (locale === 'fr' ? cat.name_fr : cat.name_en))
                .join(', ')}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
