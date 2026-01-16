'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

type WorkReference = {
  id: string;
  slug: string;
  client_name: string;
  year: string | null;
  featured_image_url: string | null;
  is_featured_on_homepage: boolean;
  is_case_study: boolean;
  homepage_order: number | null;
  title?: string;
  categories?: { slug: string; name_en: string }[];
};

export default function AdminWorkPage() {
  const [workReferences, setWorkReferences] = useState<WorkReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchWorkReferences = async () => {
    const { data } = await supabase
      .from('work_references_with_translations')
      .select('*')
      .eq('locale', 'en')
      .order('homepage_order', { ascending: true, nullsFirst: false });

    setWorkReferences(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkReferences();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work reference?')) return;

    setDeleting(id);

    // Delete translations first
    await supabase.from('work_reference_translations').delete().eq('work_reference_id', id);
    // Delete category mappings
    await supabase.from('work_reference_categories').delete().eq('work_reference_id', id);
    // Delete videos
    await supabase.from('work_reference_videos').delete().eq('work_reference_id', id);
    // Delete images
    await supabase.from('work_reference_images').delete().eq('work_reference_id', id);
    // Delete main record
    await supabase.from('work_references').delete().eq('id', id);

    setDeleting(null);
    fetchWorkReferences();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Work References</h1>
        <Link
          href="/admin/work/new"
          className="px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded hover:bg-[#1a1a1a] transition-colors"
        >
          + Add New
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {workReferences.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No work references yet
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {workReferences.map((work) => (
              <div
                key={work.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-24 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                  {work.featured_image_url ? (
                    <Image
                      src={work.featured_image_url}
                      alt={work.title || ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {work.title || work.slug}
                    </h3>
                    {work.is_featured_on_homepage && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full flex-shrink-0">
                        Homepage
                      </span>
                    )}
                    {work.is_case_study && (
                      <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full flex-shrink-0">
                        Case Study
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {work.client_name} {work.year && `• ${work.year}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/work/${work.id}`}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(work.id)}
                    disabled={deleting === work.id}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deleting === work.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
