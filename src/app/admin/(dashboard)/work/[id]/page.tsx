'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';

type Category = {
  id: string;
  slug: string;
  name_en: string;
  name_fr: string;
};

type WorkReference = {
  id: string;
  slug: string;
  client_name: string;
  year: string | null;
  featured_image_url: string | null;
  is_featured_on_homepage: boolean;
  is_case_study: boolean;
  homepage_order: number | null;
};

type Translation = {
  locale: string;
  title: string;
  excerpt: string;
  body_html: string;
};

type Video = {
  id?: string;
  url: string;
  type: string;
};

type UploadedImage = {
  id?: string;
  url: string;
  alt_text?: string;
  display_order?: number;
};

export default function AdminWorkEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [locale, setLocale] = useState<'en' | 'fr' | 'es'>('en');

  // Form state
  const [slug, setSlug] = useState('');
  const [clientName, setClientName] = useState('');
  const [year, setYear] = useState('');
  const [isFeaturedOnHomepage, setIsFeaturedOnHomepage] = useState(false);
  const [isCaseStudy, setIsCaseStudy] = useState(false);
  const [homepageOrder, setHomepageOrder] = useState('');

  // Images
  const [thumbnail, setThumbnail] = useState<UploadedImage[]>([]);
  const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);

  // Translations
  const [translations, setTranslations] = useState<Record<string, Translation>>({
    en: { locale: 'en', title: '', excerpt: '', body_html: '' },
    fr: { locale: 'fr', title: '', excerpt: '', body_html: '' },
    es: { locale: 'es', title: '', excerpt: '', body_html: '' },
  });

  // Videos
  const [videos, setVideos] = useState<Video[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');
      setCategories(cats || []);

      if (!isNew) {
        // Fetch work reference
        const { data: work } = await supabase
          .from('work_references')
          .select('*')
          .eq('id', id)
          .single();

        if (work) {
          setSlug(work.slug);
          setClientName(work.client_name);
          setYear(work.year || '');
          setIsFeaturedOnHomepage(work.is_featured_on_homepage);
          setIsCaseStudy(work.is_case_study);
          setHomepageOrder(work.homepage_order?.toString() || '');

          // Set thumbnail from featured_image_url if exists
          if (work.featured_image_url) {
            setThumbnail([{ url: work.featured_image_url }]);
          }
        }

        // Fetch translations
        const { data: trans } = await supabase
          .from('work_reference_translations')
          .select('*')
          .eq('work_reference_id', id);

        if (trans) {
          const transMap: Record<string, Translation> = {
            en: { locale: 'en', title: '', excerpt: '', body_html: '' },
            fr: { locale: 'fr', title: '', excerpt: '', body_html: '' },
            es: { locale: 'es', title: '', excerpt: '', body_html: '' },
          };
          trans.forEach((t) => {
            transMap[t.locale] = t;
          });
          setTranslations(transMap);
        }

        // Fetch categories
        const { data: workCats } = await supabase
          .from('work_reference_categories')
          .select('category_id')
          .eq('work_reference_id', id);

        if (workCats) {
          setSelectedCategories(workCats.map((c) => c.category_id));
        }

        // Fetch videos
        const { data: vids } = await supabase
          .from('work_reference_videos')
          .select('*')
          .eq('work_reference_id', id)
          .order('display_order');

        if (vids) {
          setVideos(vids.map((v) => ({
            id: v.id,
            url: v.video_url,
            type: v.video_type || 'vimeo',
          })));
        }

        // Fetch gallery images
        const { data: imgs } = await supabase
          .from('work_reference_images')
          .select('*')
          .eq('work_reference_id', id)
          .order('display_order');

        if (imgs) {
          setGalleryImages(imgs.map((img) => ({
            id: img.id,
            url: img.image_url,
            alt_text: img.alt_text,
            display_order: img.display_order,
          })));
        }

        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNew, supabase]);

  const handleTranslationChange = (field: keyof Translation, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  };

  const handleAddVideo = () => {
    setVideos([...videos, { url: '', type: 'vimeo' }]);
  };

  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleVideoChange = (index: number, field: keyof Video, value: string) => {
    const newVideos = [...videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setVideos(newVideos);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      let workId = id;

      const featuredImageUrl = thumbnail.length > 0 ? thumbnail[0].url : null;

      if (isNew) {
        // Create new work reference
        const { data: newWork, error } = await supabase
          .from('work_references')
          .insert({
            slug,
            client_name: clientName,
            year: year || null,
            featured_image_url: featuredImageUrl,
            is_featured_on_homepage: isFeaturedOnHomepage,
            is_case_study: isCaseStudy,
            homepage_order: homepageOrder ? parseInt(homepageOrder) : null,
          })
          .select()
          .single();

        if (error) throw error;
        workId = newWork.id;
      } else {
        // Update work reference
        const { error } = await supabase
          .from('work_references')
          .update({
            slug,
            client_name: clientName,
            year: year || null,
            featured_image_url: featuredImageUrl,
            is_featured_on_homepage: isFeaturedOnHomepage,
            is_case_study: isCaseStudy,
            homepage_order: homepageOrder ? parseInt(homepageOrder) : null,
          })
          .eq('id', id);

        if (error) throw error;
      }

      // Update translations
      for (const loc of ['en', 'fr', 'es']) {
        const trans = translations[loc];
        if (trans.title) {
          await supabase
            .from('work_reference_translations')
            .upsert({
              work_reference_id: workId,
              locale: loc,
              title: trans.title,
              excerpt: trans.excerpt || null,
              body_html: trans.body_html || null,
            }, { onConflict: 'work_reference_id,locale' });
        }
      }

      // Update categories
      await supabase
        .from('work_reference_categories')
        .delete()
        .eq('work_reference_id', workId);

      if (selectedCategories.length > 0) {
        await supabase.from('work_reference_categories').insert(
          selectedCategories.map((catId) => ({
            work_reference_id: workId,
            category_id: catId,
          }))
        );
      }

      // Update videos
      await supabase
        .from('work_reference_videos')
        .delete()
        .eq('work_reference_id', workId);

      const validVideos = videos.filter((v) => v.url);
      if (validVideos.length > 0) {
        await supabase.from('work_reference_videos').insert(
          validVideos.map((v, index) => ({
            work_reference_id: workId,
            video_url: v.url,
            video_type: v.type,
            display_order: index,
          }))
        );
      }

      // Update gallery images
      await supabase
        .from('work_reference_images')
        .delete()
        .eq('work_reference_id', workId);

      if (galleryImages.length > 0) {
        await supabase.from('work_reference_images').insert(
          galleryImages.map((img, index) => ({
            work_reference_id: workId,
            image_url: img.url,
            alt_text: img.alt_text || null,
            display_order: index,
          }))
        );
      }

      router.push('/admin/work');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving work reference');
    } finally {
      setSaving(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Add Work Reference' : 'Edit Work Reference'}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/work')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Language Toggle */}
        <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
          <span className="text-sm text-gray-500 mr-2">Language:</span>
          <button
            onClick={() => setLocale('en')}
            className={`px-3 py-1 text-sm rounded ${
              locale === 'en'
                ? 'bg-[#0a0a0a] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLocale('fr')}
            className={`px-3 py-1 text-sm rounded ${
              locale === 'fr'
                ? 'bg-[#0a0a0a] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            French
          </button>
          <button
            onClick={() => setLocale('es')}
            className={`px-3 py-1 text-sm rounded ${
              locale === 'es'
                ? 'bg-[#0a0a0a] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Spanish
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="my-project-slug"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Client Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2024"
            />
          </div>
        </div>

        {/* Thumbnail Image */}
        <ImageUpload
          images={thumbnail}
          onImagesChange={setThumbnail}
          workReferenceId={isNew ? undefined : id}
          multiple={false}
          label="Thumbnail Image"
        />

        {/* Gallery Images */}
        <ImageUpload
          images={galleryImages}
          onImagesChange={setGalleryImages}
          workReferenceId={isNew ? undefined : id}
          multiple={true}
          label="Gallery Images"
        />

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`px-3 py-1.5 text-sm rounded cursor-pointer transition-colors ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, cat.id]);
                    } else {
                      setSelectedCategories(selectedCategories.filter((c) => c !== cat.id));
                    }
                  }}
                />
                {cat.name_en}
              </label>
            ))}
          </div>
        </div>

        {/* Translation Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title ({locale.toUpperCase()}) *
            </label>
            <input
              type="text"
              value={translations[locale].title}
              onChange={(e) => handleTranslationChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Project Title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt ({locale.toUpperCase()})
            </label>
            <textarea
              value={translations[locale].excerpt}
              onChange={(e) => handleTranslationChange('excerpt', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Short description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body ({locale.toUpperCase()})
            </label>
            <RichTextEditor
              content={translations[locale].body_html}
              onChange={(html) => handleTranslationChange('body_html', html)}
            />
          </div>
        </div>

        {/* Videos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Video Embeds
            </label>
            <button
              onClick={handleAddVideo}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Video
            </button>
          </div>
          {videos.map((video, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <select
                value={video.type}
                onChange={(e) => handleVideoChange(index, 'type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="vimeo">Vimeo</option>
                <option value="youtube">YouTube</option>
              </select>
              <input
                type="text"
                value={video.url}
                onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://vimeo.com/123456789"
              />
              <button
                onClick={() => handleRemoveVideo(index)}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Homepage Settings */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Homepage Settings</h3>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeaturedOnHomepage}
                onChange={(e) => setIsFeaturedOnHomepage(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show on homepage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCaseStudy}
                onChange={(e) => setIsCaseStudy(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Featured case study</span>
            </label>
            {isFeaturedOnHomepage && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Order:</label>
                <input
                  type="number"
                  value={homepageOrder}
                  onChange={(e) => setHomepageOrder(e.target.value)}
                  className="w-20 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
