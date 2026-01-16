'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

type Quote = {
  id: string;
  company: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  project_type: string | null;
  budget_range: string | null;
  message: string;
  additional_info: string | null;
  how_heard: string | null;
  is_read: boolean;
  created_at: string;
};

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchQuotes = async () => {
      const { data } = await supabase
        .from('quote_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      setQuotes(data || []);
      setLoading(false);
    };

    fetchQuotes();
  }, [supabase]);

  const filteredQuotes = quotes.filter((q) => {
    if (filter === 'unread') return !q.is_read;
    if (filter === 'read') return q.is_read;
    return true;
  });

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    await supabase
      .from('quote_submissions')
      .update({ is_read: isRead })
      .eq('id', id);

    setQuotes(quotes.map((q) => (q.id === id ? { ...q, is_read: isRead } : q)));
  };

  const handleExport = () => {
    const csv = [
      ['Company', 'Name', 'Email', 'Job Title', 'Project Type', 'Budget', 'Message', 'Date', 'Read'].join(','),
      ...quotes.map((q) =>
        [
          `"${q.company}"`,
          `"${q.first_name} ${q.last_name}"`,
          `"${q.email}"`,
          `"${q.job_title}"`,
          `"${q.project_type || ''}"`,
          `"${q.budget_range || ''}"`,
          `"${q.message.replace(/"/g, '""')}"`,
          `"${new Date(q.created_at).toLocaleDateString()}"`,
          q.is_read ? 'Yes' : 'No',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
        <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm rounded ${
            filter === 'all'
              ? 'bg-[#0a0a0a] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({quotes.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 text-sm rounded ${
            filter === 'unread'
              ? 'bg-[#0a0a0a] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread ({quotes.filter((q) => !q.is_read).length})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-3 py-1 text-sm rounded ${
            filter === 'read'
              ? 'bg-[#0a0a0a] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Read ({quotes.filter((q) => q.is_read).length})
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredQuotes.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No quote requests
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredQuotes.map((quote) => (
              <div
                key={quote.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  !quote.is_read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{quote.company}</span>
                      {!quote.is_read && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                          New
                        </span>
                      )}
                      {quote.project_type && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {quote.project_type}
                        </span>
                      )}
                      {quote.budget_range && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                          {quote.budget_range}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {quote.first_name} {quote.last_name} • {quote.job_title}
                    </p>
                    <p className="text-sm text-gray-500">{quote.email}</p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{quote.message}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-gray-400">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleMarkAsRead(quote.id, !quote.is_read)}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      {quote.is_read ? 'Mark unread' : 'Mark read'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
