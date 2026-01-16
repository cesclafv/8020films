'use client';

import { useState, useEffect } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
type TranslationData = Record<string, any>;

export default function TranslationDataPage() {
  const [translations, setTranslationData] = useState<{ en: TranslationData; fr: TranslationData } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTranslationData();
  }, []);

  const fetchTranslationData = async () => {
    try {
      const res = await fetch('/api/admin/translations');
      if (!res.ok) throw new Error('Failed to fetch translations');
      const data = await res.json();
      setTranslationData(data);
      // Expand all top-level sections by default
      setExpandedSections(new Set(Object.keys(data.en)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load translations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!translations) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(translations),
      });

      if (!res.ok) throw new Error('Failed to save translations');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save translations');
    } finally {
      setSaving(false);
    }
  };

  const updateTranslation = (
    lang: 'en' | 'fr',
    path: string[],
    value: string
  ) => {
    if (!translations) return;

    const newTranslationData = { ...translations };
    let current: Record<string, unknown> = newTranslationData[lang];

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]] as Record<string, unknown>;
    }

    current[path[path.length - 1]] = value;
    setTranslationData(newTranslationData as { en: TranslationData; fr: TranslationData });
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const renderField = (
    path: string[],
    enValue: string,
    frValue: string,
    label: string
  ) => {
    const isLongText = enValue.length > 100 || frValue.length > 100;

    return (
      <div key={path.join('.')} className="mb-4 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500 mb-1 block">English</span>
            {isLongText ? (
              <textarea
                value={enValue}
                onChange={(e) => updateTranslation('en', path, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
            ) : (
              <input
                type="text"
                value={enValue}
                onChange={(e) => updateTranslation('en', path, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
            )}
          </div>
          <div>
            <span className="text-xs text-gray-500 mb-1 block">French</span>
            {isLongText ? (
              <textarea
                value={frValue}
                onChange={(e) => updateTranslation('fr', path, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
            ) : (
              <input
                type="text"
                value={frValue}
                onChange={(e) => updateTranslation('fr', path, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (
    sectionKey: string,
    enSection: TranslationData,
    frSection: TranslationData,
    parentPath: string[] = []
  ) => {
    const currentPath = [...parentPath, sectionKey];
    const isExpanded = expandedSections.has(currentPath.join('.')) || parentPath.length > 0;

    const renderContent = (
      enObj: TranslationData,
      frObj: TranslationData,
      path: string[],
      key: string
    ): React.ReactNode => {
      if (typeof enObj === 'string' && typeof frObj === 'string') {
        return renderField(path, enObj, frObj, key);
      }

      if (typeof enObj === 'object' && typeof frObj === 'object') {
        return (
          <div key={path.join('.')} className="mb-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              {key}
            </h4>
            <div className="pl-4 border-l-2 border-gray-200">
              {Object.keys(enObj).map((subKey) =>
                renderContent(
                  (enObj as Record<string, TranslationData>)[subKey],
                  (frObj as Record<string, TranslationData>)[subKey],
                  [...path, subKey],
                  subKey
                )
              )}
            </div>
          </div>
        );
      }

      return null;
    };

    return (
      <div key={sectionKey} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(currentPath.join('.'))}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold">{sectionKey}</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {isExpanded && (
          <div className="p-4 bg-white border-t border-gray-200">
            {Object.keys(enSection).map((key) =>
              renderContent(
                enSection[key],
                frSection[key],
                [sectionKey, key],
                key
              )
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!translations) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load translations</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">TranslationData</h1>
          <p className="text-gray-600 mt-1">Edit website text for English and French</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          TranslationData saved successfully!
        </div>
      )}

      <div className="space-y-4">
        {Object.keys(translations.en).map((sectionKey) =>
          renderSection(
            sectionKey,
            translations.en[sectionKey] as TranslationData,
            translations.fr[sectionKey] as TranslationData
          )
        )}
      </div>

      {/* Sticky save button for long pages */}
      <div className="sticky bottom-4 mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
}
