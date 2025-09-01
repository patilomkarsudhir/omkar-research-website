'use client';

import { useEffect, useState } from 'react';

export default function SiteTracker() {
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

  // Initialize visitor tracking on page load
  useEffect(() => {
    if (!sessionId) return;

    console.log('SiteTracker: Initializing with session ID:', sessionId);

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
      console.log('SiteTracker: Bot detected, skipping tracking');
      return;
    }

    const trackVisitor = async () => {
      try {
        console.log('SiteTracker: Making tracking request...');
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        console.log('SiteTracker: Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('SiteTracker: Tracking successful:', data);
        }
      } catch (error) {
        console.error('SiteTracker: Failed to track visitor:', error);
      }
    };

    trackVisitor();
  }, [sessionId]);

  // Update visitor presence every 30 seconds while on the page
  useEffect(() => {
    if (!sessionId) return;

    const updatePresence = async () => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
      } catch (error) {
        // Silently fail
      }
    };

    const interval = setInterval(updatePresence, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [sessionId]);

  // This component renders nothing - it's completely invisible
  return null;
}
