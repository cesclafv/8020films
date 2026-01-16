'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

type WorkReference = {
  id: string;
  slug: string;
  client_name: string;
  featured_image_url: string | null;
  is_featured_on_homepage: boolean;
  is_case_study: boolean;
  homepage_order: number | null;
  title?: string;
};

type HomepageSettings = {
  id: string;
  hero_video_url: string | null;
  hero_video_type: 'vimeo' | 'youtube';
};

export default function AdminHomepagePage() {
  const [allWorks, setAllWorks] = useState<WorkReference[]>([]);
  const [featuredWorks, setFeaturedWorks] = useState<WorkReference[]>([]);
  const [caseStudy, setCaseStudy] = useState<WorkReference | null>(null);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings | null>(null);
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [heroVideoType, setHeroVideoType] = useState<'vimeo' | 'youtube'>('vimeo');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchData = async () => {
    // Fetch work references
    const { data } = await supabase
      .from('work_references_with_translations')
      .select('*')
      .eq('locale', 'en')
      .order('homepage_order', { ascending: true, nullsFirst: false });

    const works = data || [];
    setAllWorks(works);
    setFeaturedWorks(works.filter((w) => w.is_featured_on_homepage).sort((a, b) => (a.homepage_order || 999) - (b.homepage_order || 999)));
    setCaseStudy(works.find((w) => w.is_case_study) || null);

    // Fetch homepage settings
    const { data: settings } = await supabase
      .from('homepage_settings')
      .select('*')
      .single();

    if (settings) {
      setHomepageSettings(settings);
      setHeroVideoUrl(settings.hero_video_url || '');
      setHeroVideoType(settings.hero_video_type || 'vimeo');
    }

    setLoading(false);
  };

  const handleSaveVideo = async () => {
    if (!homepageSettings) return;

    setSavingVideo(true);
    await supabase
      .from('homepage_settings')
      .update({
        hero_video_url: heroVideoUrl || null,
        hero_video_type: heroVideoType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', homepageSettings.id);

    setSavingVideo(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFeatured = async (work: WorkReference) => {
    const newFeatured = !work.is_featured_on_homepage;
    const newOrder = newFeatured ? featuredWorks.length + 1 : null;

    await supabase
      .from('work_references')
      .update({
        is_featured_on_homepage: newFeatured,
        homepage_order: newOrder,
      })
      .eq('id', work.id);

    fetchData();
  };

  const handleSetCaseStudy = async (work: WorkReference) => {
    // Remove current case study
    if (caseStudy) {
      await supabase
        .from('work_references')
        .update({ is_case_study: false })
        .eq('id', caseStudy.id);
    }

    // Set new case study
    await supabase
      .from('work_references')
      .update({ is_case_study: true })
      .eq('id', work.id);

    fetchData();
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newOrder = [...featuredWorks];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    setSaving(true);
    for (let i = 0; i < newOrder.length; i++) {
      await supabase
        .from('work_references')
        .update({ homepage_order: i + 1 })
        .eq('id', newOrder[i].id);
    }
    setSaving(false);
    fetchData();
  };

  const handleMoveDown = async (index: number) => {
    if (index === featuredWorks.length - 1) return;

    const newOrder = [...featuredWorks];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    setSaving(true);
    for (let i = 0; i < newOrder.length; i++) {
      await supabase
        .from('work_references')
        .update({ homepage_order: i + 1 })
        .eq('id', newOrder[i].id);
    }
    setSaving(false);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const nonFeaturedWorks = allWorks.filter((w) => !w.is_featured_on_homepage);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Homepage Settings</h1>

      {/* Hero Video */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Video</h2>
        <p className="text-sm text-gray-500 mb-4">
          Configure the background video that plays in the hero section of the homepage.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Type
            </label>
            <select
              value={heroVideoType}
              onChange={(e) => setHeroVideoType(e.target.value as 'vimeo' | 'youtube')}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vimeo">Vimeo</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL
            </label>
            <input
              type="text"
              value={heroVideoUrl}
              onChange={(e) => setHeroVideoUrl(e.target.value)}
              placeholder={heroVideoType === 'vimeo' ? 'https://vimeo.com/123456789' : 'https://www.youtube.com/watch?v=XXXXXXXXXXX'}
              className="w-full max-w-xl px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              {heroVideoType === 'vimeo'
                ? 'Enter the Vimeo video URL (e.g., https://vimeo.com/123456789)'
                : 'Enter the YouTube video URL (e.g., https://www.youtube.com/watch?v=XXXXXXXXXXX)'}
            </p>
          </div>

          <button
            onClick={handleSaveVideo}
            disabled={savingVideo}
            className="px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
          >
            {savingVideo ? 'Saving...' : 'Save Video Settings'}
          </button>
        </div>
      </div>

      {/* Featured Case Study */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Case Study</h2>
        <p className="text-sm text-gray-500 mb-4">
          This project will be featured prominently on the homepage case study section.
        </p>

        {caseStudy ? (
          <div className="flex items-center gap-4 p-4 bg-purple-50 rounded border border-purple-200">
            <div className="w-20 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
              {caseStudy.featured_image_url ? (
                <Image
                  src={caseStudy.featured_image_url}
                  alt={caseStudy.title || ''}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{caseStudy.title}</p>
              <p className="text-sm text-gray-500">{caseStudy.client_name}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No case study selected</p>
        )}

        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Select a different case study:</p>
          <select
            value={caseStudy?.id || ''}
            onChange={(e) => {
              const work = allWorks.find((w) => w.id === e.target.value);
              if (work) handleSetCaseStudy(work);
            }}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a project...</option>
            {allWorks.map((work) => (
              <option key={work.id} value={work.id}>
                {work.title} ({work.client_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Projects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Featured Projects</h2>
            <p className="text-sm text-gray-500">
              {featuredWorks.length} projects shown on homepage (9 max for desktop, 5 for mobile)
            </p>
          </div>
          {saving && <span className="text-sm text-gray-500">Saving...</span>}
        </div>

        {featuredWorks.length === 0 ? (
          <p className="text-gray-500 py-4">No featured projects selected</p>
        ) : (
          <div className="space-y-2">
            {featuredWorks.map((work, index) => (
              <div
                key={work.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded border border-gray-200"
              >
                <span className="w-6 text-center text-sm text-gray-400 font-medium">
                  {index + 1}
                </span>
                <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
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
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{work.title}</p>
                  <p className="text-sm text-gray-500">{work.client_name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === featuredWorks.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(work)}
                    className="ml-2 px-2 py-1 text-xs text-red-600 hover:text-red-700 border border-red-200 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Projects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Projects</h2>
        <p className="text-sm text-gray-500 mb-4">
          Click &quot;Add&quot; to feature a project on the homepage.
        </p>

        {nonFeaturedWorks.length === 0 ? (
          <p className="text-gray-500 py-4">All projects are already featured</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {nonFeaturedWorks.map((work) => (
              <div
                key={work.id}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded border border-gray-200"
              >
                <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
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
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{work.title}</p>
                  <p className="text-sm text-gray-500">{work.client_name}</p>
                </div>
                <button
                  onClick={() => handleToggleFeatured(work)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded hover:bg-blue-50"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
