'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

type ServiceKey = 'liveStreaming' | 'corporateVideo' | 'brandStorytelling' | 'remoteProduction' | 'musicVideo';

type ServiceImage = {
  id: string;
  service_key: ServiceKey;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

const services: { key: ServiceKey; label: string }[] = [
  { key: 'liveStreaming', label: 'Live Streaming' },
  { key: 'corporateVideo', label: 'Corporate Video' },
  { key: 'brandStorytelling', label: 'Brand Storytelling' },
  { key: 'remoteProduction', label: 'Remote Production' },
  { key: 'musicVideo', label: 'Music Video' },
];

export default function AdminServiceImagesPage() {
  const [activeService, setActiveService] = useState<ServiceKey>('liveStreaming');
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAltText, setEditAltText] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchImages = async (serviceKey: ServiceKey) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_images')
      .select('*')
      .eq('service_key', serviceKey)
      .order('display_order');

    if (error) {
      console.error('Error fetching images:', error);
      setLoading(false);
      return;
    }

    setImages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages(activeService);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeService]);

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${activeService}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('service-images')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('service-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setUploading(true);

    try {
      const maxOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order)) : 0;

      for (let i = 0; i < imageFiles.length; i++) {
        const url = await uploadFile(imageFiles[i]);
        if (url) {
          const { error } = await supabase
            .from('service_images')
            .insert({
              service_key: activeService,
              image_url: url,
              alt_text: null,
              display_order: maxOrder + i + 1,
              is_active: true,
            });

          if (error) {
            console.error('Error inserting image:', error);
          }
        }
      }

      await fetchImages(activeService);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeService, images]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDelete = async (image: ServiceImage) => {
    if (!confirm('Delete this image?')) return;

    // Delete from storage if it's a Supabase URL
    if (image.image_url.includes('supabase.co/storage')) {
      try {
        const url = new URL(image.image_url);
        const pathParts = url.pathname.split('/storage/v1/object/public/service-images/');
        if (pathParts.length > 1) {
          const filePath = decodeURIComponent(pathParts[1]);
          await supabase.storage.from('service-images').remove([filePath]);
        }
      } catch (e) {
        console.error('Error deleting from storage:', e);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('service_images')
      .delete()
      .eq('id', image.id);

    if (error) {
      console.error('Error deleting image:', error);
      return;
    }

    await fetchImages(activeService);
  };

  const handleToggleActive = async (image: ServiceImage) => {
    const { error } = await supabase
      .from('service_images')
      .update({ is_active: !image.is_active })
      .eq('id', image.id);

    if (error) {
      console.error('Error toggling image:', error);
      return;
    }

    await fetchImages(activeService);
  };

  const handleStartEdit = (image: ServiceImage) => {
    setEditingId(image.id);
    setEditAltText(image.alt_text || '');
  };

  const handleSaveEdit = async (imageId: string) => {
    const { error } = await supabase
      .from('service_images')
      .update({ alt_text: editAltText.trim() || null })
      .eq('id', imageId);

    if (error) {
      console.error('Error updating alt text:', error);
      return;
    }

    setEditingId(null);
    setEditAltText('');
    await fetchImages(activeService);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAltText('');
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const currentImage = images[index];
    const previousImage = images[index - 1];

    await supabase
      .from('service_images')
      .update({ display_order: previousImage.display_order })
      .eq('id', currentImage.id);

    await supabase
      .from('service_images')
      .update({ display_order: currentImage.display_order })
      .eq('id', previousImage.id);

    await fetchImages(activeService);
  };

  const handleMoveDown = async (index: number) => {
    if (index === images.length - 1) return;

    const currentImage = images[index];
    const nextImage = images[index + 1];

    await supabase
      .from('service_images')
      .update({ display_order: nextImage.display_order })
      .eq('id', currentImage.id);

    await supabase
      .from('service_images')
      .update({ display_order: currentImage.display_order })
      .eq('id', nextImage.id);

    await fetchImages(activeService);
  };

  const activeImages = images.filter(img => img.is_active);
  const inactiveImages = images.filter(img => !img.is_active);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Images</h1>
          <p className="text-gray-600 mt-1">
            Manage images displayed on each service page
          </p>
        </div>
      </div>

      {/* Service Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {services.map((service) => (
          <button
            key={service.key}
            onClick={() => setActiveService(service.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeService === service.key
                ? 'bg-[#0a0a0a] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {service.label}
          </button>
        ))}
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-8 ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
      >
        {uploading ? (
          <div className="text-gray-500">
            <svg className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-3"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-gray-600 mb-3">
              Drag and drop images here, or
            </p>
            <label className="inline-block px-6 py-2 bg-[#0a0a0a] text-white rounded cursor-pointer hover:bg-[#1a1a1a] transition-colors">
              <span className="text-sm font-medium">Select Files</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-400 mt-3">
              Recommended: 16:9 aspect ratio images (e.g., 1920x1080)
            </p>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <>
          {/* Active Images */}
          {activeImages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Active Images ({activeImages.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeImages.map((image) => (
                  <div
                    key={image.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden group relative"
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || 'Service image'}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="p-3">
                      {editingId === image.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editAltText}
                            onChange={(e) => setEditAltText(e.target.value)}
                            placeholder="Alt text for accessibility"
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(image.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <button
                            onClick={() => handleSaveEdit(image.id)}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Save"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Cancel"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <p
                          className="text-xs text-gray-500 truncate cursor-pointer hover:text-gray-700"
                          onClick={() => handleStartEdit(image)}
                          title="Click to edit alt text"
                        >
                          {image.alt_text || 'Click to add alt text'}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleMoveUp(images.findIndex(img => img.id === image.id))}
                        className="p-1.5 bg-white rounded shadow hover:bg-gray-50"
                        title="Move up"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMoveDown(images.findIndex(img => img.id === image.id))}
                        className="p-1.5 bg-white rounded shadow hover:bg-gray-50"
                        title="Move down"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleActive(image)}
                        className="p-1.5 bg-white rounded shadow hover:bg-gray-50"
                        title="Hide image"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(image)}
                        className="p-1.5 bg-red-500 text-white rounded shadow hover:bg-red-600"
                        title="Delete image"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Images */}
          {inactiveImages.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-500 mb-4">
                Hidden Images ({inactiveImages.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactiveImages.map((image) => (
                  <div
                    key={image.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group relative opacity-50"
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || 'Service image'}
                        fill
                        className="object-cover grayscale"
                      />
                    </div>

                    <div className="p-3">
                      <p className="text-xs text-gray-400 truncate">
                        {image.alt_text || 'No alt text'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleActive(image)}
                        className="p-1.5 bg-white rounded shadow hover:bg-gray-50"
                        title="Show image"
                      >
                        <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(image)}
                        className="p-1.5 bg-red-500 text-white rounded shadow hover:bg-red-600"
                        title="Delete image"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No images yet for this service. Upload some images to get started.
            </div>
          )}
        </>
      )}
    </div>
  );
}
