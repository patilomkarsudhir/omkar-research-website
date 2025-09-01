'use client';

import { useState, useEffect } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupIcon from '@mui/icons-material/Group';

interface AnalyticsData {
  totalVisitors: number;
  uniqueVisitors: number;
  currentOnline: number;
  lastUpdated: string;
}

export default function CompactVisitorAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisitors: 0,
    uniqueVisitors: 0,
    currentOnline: 0,
    lastUpdated: new Date().toISOString()
  });

  // Fetch analytics data every 10 seconds
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="flex items-center gap-3 text-xs text-[var(--muted)]/60 opacity-70 hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 bg-green-400/70 rounded-full animate-pulse"></div>
        <span className="hidden sm:inline">{analytics.currentOnline}</span>
        <span className="sm:hidden">{analytics.currentOnline}</span>
      </div>
      <div className="hidden md:flex items-center gap-1">
        <VisibilityIcon fontSize="inherit" className="text-blue-400/70" style={{fontSize: '12px'}} />
        <span>{formatNumber(analytics.totalVisitors)}</span>
      </div>
    </div>
  );
}
