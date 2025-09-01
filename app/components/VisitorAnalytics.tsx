'use client';

import { useState, useEffect } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface AnalyticsData {
  totalVisitors: number;
  uniqueVisitors: number;
  currentOnline: number;
  lastUpdated: string;
}

export default function VisitorAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisitors: 0,
    uniqueVisitors: 0,
    currentOnline: 0,
    lastUpdated: new Date().toISOString()
  });
  const [isOnline, setIsOnline] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('visitor-session-id');
      if (!id) {
        id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visitor-session-id', id);
      }
      return id;
    }
    return '';
  });

  // Initialize visitor tracking
  useEffect(() => {
    if (!sessionId) return;

    // Additional bot detection - check if this looks like a real browser
    const isLikelyBot = () => {
      // Check for headless browser indicators
      if (typeof navigator !== 'undefined') {
        const userAgent = navigator.userAgent.toLowerCase();
        
        // Check for headless browser patterns
        if (userAgent.includes('headlesschrome') || 
            userAgent.includes('phantomjs') ||
            userAgent.includes('slimerjs') ||
            !navigator.languages ||
            !navigator.plugins ||
            navigator.webdriver) {
          return true;
        }
        
        // Check for missing expected browser features
        if (!window.screen || 
            !window.screen.width || 
            !window.screen.height ||
            !document.documentElement) {
          return true;
        }
      }
      
      return false;
    };

    // Don't track if this appears to be a bot
    if (isLikelyBot()) {
      return;
    }

    const initializeVisitor = async () => {
      try {
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          // Don't update analytics if server detected this as a bot
          if (!data.isBot) {
            setAnalytics(data);
            setIsOnline(true);
          }
        }
      } catch (error) {
        console.error('Failed to initialize visitor tracking:', error);
      }
    };

    initializeVisitor();
  }, [sessionId]);

  // Update visitor presence every 30 seconds
  useEffect(() => {
    if (!sessionId || !isOnline) return;

    const updatePresence = async () => {
      try {
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          // Only update if not detected as bot
          if (!data.isBot) {
            setAnalytics(data);
          }
        }
      } catch (error) {
        console.error('Failed to update presence:', error);
      }
    };

    const interval = setInterval(updatePresence, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [sessionId, isOnline]);

  // Fetch analytics data every 10 seconds for real-time updates
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

    const interval = setInterval(fetchAnalytics, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUpIcon className="text-blue-400" fontSize="small" />
        <h3 className="text-lg font-semibold text-white">Live Analytics</h3>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">Live</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Online */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <GroupIcon className="text-green-400" fontSize="small" />
          </div>
          <div className="text-2xl font-bold text-green-400 mb-1">
            {formatNumber(analytics.currentOnline)}
          </div>
          <div className="text-xs text-green-300">Online Now</div>
        </div>

        {/* Total Visitors */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <VisibilityIcon className="text-blue-400" fontSize="small" />
          </div>
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {formatNumber(analytics.totalVisitors)}
          </div>
          <div className="text-xs text-blue-300">Total Visits</div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GroupIcon className="text-purple-400" fontSize="small" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {formatNumber(analytics.uniqueVisitors)}
          </div>
          <div className="text-xs text-purple-300">Unique Visitors</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Last updated: {formatLastUpdated(analytics.lastUpdated)}</span>
          <span className="flex items-center gap-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            Real-time tracking
          </span>
        </div>
      </div>
    </div>
  );
}
