'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

type EmailTemplate = {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body_html: string;
  description: string | null;
  available_variables: string[];
  updated_at: string;
};

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      setTemplates(data || []);
      setLoading(false);
    };

    fetchTemplates();
  }, [supabase]);

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditSubject(template.subject);
    setEditBody(template.body_html);
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: editSubject,
          body_html: editBody,
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      // Update local state
      setTemplates(templates.map(t =>
        t.id === selectedTemplate.id
          ? { ...t, subject: editSubject, body_html: editBody, updated_at: new Date().toISOString() }
          : t
      ));
      setSelectedTemplate({ ...selectedTemplate, subject: editSubject, body_html: editBody });

      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
    setEditSubject('');
    setEditBody('');
    setShowPreview(false);
  };

  const getPreviewHtml = () => {
    // Replace variables with sample data for preview
    const sampleData: Record<string, string> = {
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      company: 'Acme Inc',
      job_title: 'Marketing Director',
      project_type: 'Brand Storytelling',
      budget_range: '$10k - $50k',
      message: 'We are looking for a video production team to create a brand story video for our upcoming product launch.',
      how_heard: 'Referral',
    };

    let html = editBody;
    // Replace simple variables
    Object.entries(sampleData).forEach(([key, value]) => {
      html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    // Handle conditional blocks (simple implementation)
    Object.entries(sampleData).forEach(([key, value]) => {
      if (value) {
        html = html.replace(new RegExp(`\\{\\{#${key}\\}\\}`, 'g'), '');
        html = html.replace(new RegExp(`\\{\\{/${key}\\}\\}`, 'g'), '');
      }
    });
    return html;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading templates...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-500 mt-1">Manage email content sent by the website</p>
        </div>
      </div>

      {!selectedTemplate ? (
        // Template List View
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {template.description}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Subject: <span className="text-gray-600">{template.subject}</span>
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="text-sm text-gray-400">
                      Updated {new Date(template.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {template.available_variables.map((variable) => (
                    <span
                      key={variable}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Template Editor View
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to templates
              </button>
              <h2 className="text-xl font-bold text-gray-900 mt-2">{selectedTemplate.name}</h2>
              <p className="text-gray-500 text-sm">{selectedTemplate.description}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0a0a0a] rounded hover:bg-[#1a1a1a] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Available Variables */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Available Variables</h4>
            <p className="text-sm text-blue-700 mb-3">
              Use these variables in your template. They will be replaced with actual values when the email is sent.
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.available_variables.map((variable) => (
                <code
                  key={variable}
                  className="inline-flex items-center px-2 py-1 rounded text-sm font-mono bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                  onClick={() => navigator.clipboard.writeText(`{{${variable}}}`)}
                  title="Click to copy"
                >
                  {`{{${variable}}}`}
                </code>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Tip: Use {`{{#variable}}...{{/variable}}`} for conditional sections that only appear when the variable has a value.
            </p>
          </div>

          {showPreview ? (
            // Preview Mode
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-100 px-6 py-3 border-b">
                <p className="text-sm">
                  <span className="text-gray-500">Subject:</span>{' '}
                  <span className="font-medium">{editSubject.replace(/\{\{(\w+)\}\}/g, (_, key) => {
                    const samples: Record<string, string> = { first_name: 'John', last_name: 'Doe', company: 'Acme Inc' };
                    return samples[key] || key;
                  })}</span>
                </p>
              </div>
              <div className="p-6">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                />
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              {/* Subject Line */}
              <div className="bg-white rounded-lg shadow p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent"
                  placeholder="Email subject..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use variables like {`{{first_name}}`} in the subject line.
                </p>
              </div>

              {/* Body HTML */}
              <div className="bg-white rounded-lg shadow p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Body (HTML)
                </label>
                <RichTextEditor
                  content={editBody}
                  onChange={setEditBody}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
