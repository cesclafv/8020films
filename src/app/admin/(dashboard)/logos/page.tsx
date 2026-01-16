'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

type ClientLogo = {
  id: string;
  name: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
};

export default function AdminLogosPage() {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchLogos = async () => {
    const { data, error } = await supabase
      .from('client_logos')
      .select('*')
      .order('display_order');

    if (error) {
      console.error('Error fetching logos:', error);
      return;
    }

    setLogos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  const uploadFile = async (file: File): Promise<{ url: string; name: string } | null> => {
    const fileExt = file.name.split('.').pop();
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, ' ').trim();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('logos')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

    return { url: publicUrl, name: baseName };
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setUploading(true);

    try {
      const maxOrder = logos.length > 0 ? Math.max(...logos.map(l => l.display_order)) : 0;

      for (let i = 0; i < imageFiles.length; i++) {
        const result = await uploadFile(imageFiles[i]);
        if (result) {
          const { error } = await supabase
            .from('client_logos')
            .insert({
              name: result.name,
              image_url: result.url,
              display_order: maxOrder + i + 1,
              is_active: true,
            });

          if (error) {
            console.error('Error inserting logo:', error);
          }
        }
      }

      await fetchLogos();
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
  }, [logos]);

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

  const handleDelete = async (logo: ClientLogo) => {
    if (!confirm(`Delete "${logo.name}"?`)) return;

    // Delete from storage if it's a Supabase URL
    if (logo.image_url.includes('supabase.co/storage')) {
      try {
        const url = new URL(logo.image_url);
        const pathParts = url.pathname.split('/storage/v1/object/public/logos/');
        if (pathParts.length > 1) {
          const filePath = decodeURIComponent(pathParts[1]);
          await supabase.storage.from('logos').remove([filePath]);
        }
      } catch (e) {
        console.error('Error deleting from storage:', e);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('client_logos')
      .delete()
      .eq('id', logo.id);

    if (error) {
      console.error('Error deleting logo:', error);
      return;
    }

    await fetchLogos();
  };

  const handleToggleActive = async (logo: ClientLogo) => {
    const { error } = await supabase
      .from('client_logos')
      .update({ is_active: !logo.is_active })
      .eq('id', logo.id);

    if (error) {
      console.error('Error toggling logo:', error);
      return;
    }

    await fetchLogos();
  };

  const handleStartEdit = (logo: ClientLogo) => {
    setEditingId(logo.id);
    setEditName(logo.name);
  };

  const handleSaveEdit = async (logoId: string) => {
    if (!editName.trim()) return;

    const { error } = await supabase
      .from('client_logos')
      .update({ name: editName.trim() })
      .eq('id', logoId);

    if (error) {
      console.error('Error updating logo name:', error);
      return;
    }

    setEditingId(null);
    setEditName('');
    await fetchLogos();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const currentLogo = logos[index];
    const previousLogo = logos[index - 1];

    await supabase
      .from('client_logos')
      .update({ display_order: previousLogo.display_order })
      .eq('id', currentLogo.id);

    await supabase
      .from('client_logos')
      .update({ display_order: currentLogo.display_order })
      .eq('id', previousLogo.id);

    await fetchLogos();
  };

  const handleMoveDown = async (index: number) => {
    if (index === logos.length - 1) return;

    const currentLogo = logos[index];
    const nextLogo = logos[index + 1];

    await supabase
      .from('client_logos')
      .update({ display_order: nextLogo.display_order })
      .eq('id', currentLogo.id);

    await supabase
      .from('client_logos')
      .update({ display_order: currentLogo.display_order })
      .eq('id', nextLogo.id);

    await fetchLogos();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const activeLogos = logos.filter(l => l.is_active);
  const inactiveLogos = logos.filter(l => !l.is_active);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Logos</h1>
          <p className="text-gray-600 mt-1">
            Manage logos displayed on the homepage and work page ({activeLogos.length} active)
          </p>
        </div>
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
              Drag and drop logo images here, or
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
              Supported formats: PNG, JPG, GIF, SVG
            </p>
          </>
        )}
      </div>

      {/* Active Logos */}
      {activeLogos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Logos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {activeLogos.map((logo, index) => (
              <div
                key={logo.id}
                className="bg-white border border-gray-200 rounded-lg p-4 group relative"
              >
                <div className="relative h-16 mb-3">
                  <Image
                    src={logo.image_url}
                    alt={logo.name}
                    fill
                    className="object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                  />
                </div>

                {editingId === logo.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(logo.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <button
                      onClick={() => handleSaveEdit(logo.id)}
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
                    className="text-xs text-gray-600 text-center truncate cursor-pointer hover:text-gray-900"
                    onClick={() => handleStartEdit(logo)}
                    title="Click to edit name"
                  >
                    {logo.name}
                  </p>
                )}

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleMoveUp(logos.findIndex(l => l.id === logo.id))}
                    className="p-1 bg-white rounded shadow hover:bg-gray-50"
                    title="Move up"
                  >
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveDown(logos.findIndex(l => l.id === logo.id))}
                    className="p-1 bg-white rounded shadow hover:bg-gray-50"
                    title="Move down"
                  >
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleActive(logo)}
                    className="p-1 bg-white rounded shadow hover:bg-gray-50"
                    title="Hide logo"
                  >
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(logo)}
                    className="p-1 bg-red-500 text-white rounded shadow hover:bg-red-600"
                    title="Delete logo"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Logos */}
      {inactiveLogos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-500 mb-4">Hidden Logos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {inactiveLogos.map((logo) => (
              <div
                key={logo.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 group relative opacity-50"
              >
                <div className="relative h-16 mb-3">
                  <Image
                    src={logo.image_url}
                    alt={logo.name}
                    fill
                    className="object-contain grayscale"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center truncate">{logo.name}</p>

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleActive(logo)}
                    className="p-1 bg-white rounded shadow hover:bg-gray-50"
                    title="Show logo"
                  >
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(logo)}
                    className="p-1 bg-red-500 text-white rounded shadow hover:bg-red-600"
                    title="Delete logo"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {logos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No logos yet. Upload some client logos to get started.
        </div>
      )}
    </div>
  );
}
