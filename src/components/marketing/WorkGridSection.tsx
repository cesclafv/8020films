'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// Temporary mock data - will be replaced with Supabase data
const mockProjects = [
  {
    id: 1,
    slug: 'dyson-live-corrale-hair-straightener-launch',
    title: 'Dyson Live',
    client: 'Dyson',
    category: 'Live streaming & events',
    image: '/img/work/dyson-thumbnail.jpg',
  },
  {
    id: 2,
    slug: 'salesforce-at-insead',
    title: 'Salesforce at INSEAD',
    client: 'Salesforce',
    category: 'Corp & Brand storytelling',
  },
  {
    id: 3,
    slug: 'unesco-ft-angelina-jolie',
    title: 'UNESCO Global Live Stream',
    client: 'UNESCO',
    category: 'Live streaming & events',
  },
  {
    id: 4,
    slug: 'dotconferences-live-video-production',
    title: 'DotConferences',
    client: 'DotConferences',
    category: 'Live streaming & events',
  },
  {
    id: 5,
    slug: 'musicgurus-elevating-music-education',
    title: 'MusicGurus',
    client: 'Music Gurus',
    category: 'Music',
  },
  {
    id: 6,
    slug: 'netflix-a-conversation-with-aziz-ansari-and-chris-rock',
    title: 'Netflix: Aziz Ansari & Chris Rock',
    client: 'Netflix',
    category: 'Remote production',
  },
  {
    id: 7,
    slug: 'converse-just-add-color-film-photo-coverage',
    title: 'Converse "Just Add Color"',
    client: 'Converse',
    category: 'Corp & Brand storytelling',
  },
  {
    id: 8,
    slug: 'david-guetta-at-paris-bercy',
    title: 'David Guetta at Paris Bercy',
    client: 'EMI & Orange',
    category: 'Music',
  },
  {
    id: 9,
    slug: 'conde-nast-remote-interview',
    title: 'Condé Nast x Vogue',
    client: 'Condé Nast',
    category: 'Remote production',
  },
];

export function WorkGridSection() {
  const t = useTranslations('HomePage.work');

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-16 md:mb-20 tracking-tight">
          {t('title')}
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProjects.map((project, index) => (
            <Link
              key={project.id}
              href={`/work/${project.slug}`}
              className={`work-item ${index >= 5 ? 'hidden md:block' : ''}`}
            >
              {/* Placeholder gradient until we have real images */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg,
                    hsl(${(index * 40) % 360}, 30%, 25%) 0%,
                    hsl(${(index * 40 + 60) % 360}, 40%, 15%) 100%)`,
                }}
              />
              <div className="work-item-overlay">
                <span className="text-white/70 text-xs uppercase tracking-wider mb-1">
                  {project.client}
                </span>
                <h3 className="text-white font-bold text-lg">{project.title}</h3>
                <span className="text-white/60 text-sm mt-1">
                  {project.category}
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
