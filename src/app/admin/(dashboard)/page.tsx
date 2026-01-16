'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

type Stats = {
  workReferences: number;
  quoteRequests: number;
  unreadQuotes: number;
  newsletterSubscribers: number;
};

type RecentQuote = {
  id: string;
  company: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  is_read: boolean;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    workReferences: 0,
    quoteRequests: 0,
    unreadQuotes: 0,
    newsletterSubscribers: 0,
  });
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch work references count
      const { count: workCount } = await supabase
        .from('work_references')
        .select('*', { count: 'exact', head: true });

      // Fetch quote requests count
      const { count: quotesCount } = await supabase
        .from('quote_submissions')
        .select('*', { count: 'exact', head: true });

      // Fetch unread quotes count
      const { count: unreadCount } = await supabase
        .from('quote_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      // Fetch newsletter subscribers count
      const { count: newsletterCount } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true });

      // Fetch recent quotes
      const { data: quotes } = await supabase
        .from('quote_submissions')
        .select('id, company, first_name, last_name, email, created_at, is_read')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        workReferences: workCount || 0,
        quoteRequests: quotesCount || 0,
        unreadQuotes: unreadCount || 0,
        newsletterSubscribers: newsletterCount || 0,
      });

      setRecentQuotes(quotes || []);
      setLoading(false);
    };

    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          href="/admin/quotes"
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Quote Requests</p>
              <p className="text-3xl font-bold text-gray-900">{stats.quoteRequests}</p>
              {stats.unreadQuotes > 0 && (
                <p className="text-sm text-blue-600 mt-1">{stats.unreadQuotes} unread</p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/newsletter"
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Newsletter Subscribers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.newsletterSubscribers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/work"
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Work References</p>
              <p className="text-3xl font-bold text-gray-900">{stats.workReferences}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/homepage"
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Homepage Settings</p>
              <p className="text-sm text-gray-600 mt-2">Manage featured projects</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Quote Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Quote Requests</h2>
          <Link href="/admin/quotes" className="text-sm text-blue-600 hover:text-blue-700">
            View all →
          </Link>
        </div>

        {recentQuotes.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No quote requests yet
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentQuotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/admin/quotes/${quote.id}`}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{quote.company}</span>
                    {!quote.is_read && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {quote.first_name} {quote.last_name} • {quote.email}
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(quote.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
