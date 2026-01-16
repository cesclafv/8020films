'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

type UploadedImage = {
  id?: string;
  url: string;
  alt_text?: string;
  display_order?: number;
};

type Props = {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  workReferenceId?: string;
  multiple?: boolean;
  label: string;
};

export function ImageUpload({ images, onImagesChange, workReferenceId, multiple = false, label }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${workReferenceId || 'new'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('work-images')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('work-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Filter for image files only
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setUploading(true);

    try {
      const filesToUpload = multiple ? imageFiles : [imageFiles[0]];
      const uploadPromises = filesToUpload.map(uploadFile);
      const urls = await Promise.all(uploadPromises);

      const newImages = urls
        .filter((url): url is string => url !== null)
        .map((url, index) => ({
          url,
          display_order: images.length + index,
        }));

      if (multiple) {
        onImagesChange([...images, ...newImages]);
      } else {
        // For single image (thumbnail), replace existing
        onImagesChange(newImages);
      }
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
  }, [images, multiple]);

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

  const handleDelete = async (index: number) => {
    const imageToDelete = images[index];

    // Only try to delete from Supabase storage if it's a Supabase URL
    if (imageToDelete.url.includes('supabase.co/storage')) {
      try {
        const url = new URL(imageToDelete.url);
        const pathParts = url.pathname.split('/storage/v1/object/public/work-images/');
        if (pathParts.length > 1) {
          const filePath = decodeURIComponent(pathParts[1]);

          // Delete from storage
          const { error } = await supabase.storage
            .from('work-images')
            .remove([filePath]);

          if (error) {
            console.error('Delete error:', error);
          }
        }
      } catch (e) {
        console.error('Error parsing URL for deletion:', e);
      }
    }

    // Remove from list
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
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
              className="mx-auto h-10 w-10 text-gray-400 mb-2"
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
            <p className="text-gray-600 mb-2">
              Drag and drop {multiple ? 'images' : 'an image'} here, or
            </p>
            <label className="inline-block px-4 py-2 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">
                Select {multiple ? 'Files' : 'File'}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className={`mt-4 ${multiple ? 'grid grid-cols-2 md:grid-cols-4 gap-4' : ''}`}>
          {images.map((image, index) => (
            <div
              key={image.id || image.url}
              className={`relative group ${multiple ? '' : 'w-48'}`}
            >
              <div className={`relative ${multiple ? 'aspect-video' : 'aspect-video w-48'} bg-gray-100 rounded overflow-hidden`}>
                <Image
                  src={image.url}
                  alt={image.alt_text || `Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Delete image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
