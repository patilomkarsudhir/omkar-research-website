'use client';

import { useState } from 'react';
import { ExternalLink, BarChart3, Info } from 'lucide-react';

export default function VercelAnalyticsCard() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="bg-[var(--panel)] border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Vercel Analytics</h3>
            <p className="text-sm text-[var(--muted)]">Official Vercel tracking</p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          title="More info"
        >
          <Info className="w-4 h-4 text-[var(--muted)]" />
        </button>
      </div>

      {showInfo ? (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-400 mb-2">Why No Data Here?</h4>
            <p className="text-sm text-[var(--muted)] mb-3">
              Vercel Analytics doesn't provide a public API to display data on your website. 
              The analytics data is only available in your Vercel dashboard.
            </p>
            <div className="text-xs text-[var(--muted)] space-y-1">
              <p>• This is a <a href="https://github.com/vercel/analytics/issues/68" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">highly requested feature</a></p>
              <p>• Vercel team confirmed it's "on the roadmap"</p>
              <p>• No ETA provided yet</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">What Vercel Analytics Provides:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="font-medium text-green-400 mb-1">✓ Privacy-First</div>
                <div className="text-[var(--muted)]">No cookies, anonymized data</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="font-medium text-green-400 mb-1">✓ Comprehensive</div>
                <div className="text-[var(--muted)]">Page views, referrers, demographics</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="font-medium text-green-400 mb-1">✓ Built-in</div>
                <div className="text-[var(--muted)]">Integrated with Vercel platform</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="font-medium text-green-400 mb-1">✓ Bot Filtering</div>
                <div className="text-[var(--muted)]">Automatic bot detection</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-[var(--muted)] mx-auto mb-3" />
            <p className="text-[var(--muted)] mb-4">
              Vercel Analytics is active and tracking your site
            </p>
            <p className="text-sm text-[var(--muted)] mb-4">
              Data is available in your Vercel dashboard
            </p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <span>View in Vercel Dashboard</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
