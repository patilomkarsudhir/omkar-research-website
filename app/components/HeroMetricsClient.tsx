"use client";
import { useEffect, useState } from "react";

type Metrics = Record<string, { all: number; recent: number }>;

export default function HeroMetricsClient() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Google Scholar profile URL
  const scholarUrl = "https://scholar.google.com/citations?user=EtkfNQMAAAAJ";
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Avoid bypassing CDN caching; reduces upstream scrape pressure.
        const res = await fetch('/api/scholar?user=EtkfNQMAAAAJ');
        
        if (res.ok) {
          const data = await res.json();
          if (data.metrics) {
            setMetrics(data.metrics);
          } else {
            setError('No metrics data received');
          }
        } else {
          setError(`API Error: ${res.status}`);
        }
      } catch (e) {
        setError(`Network Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (error) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="text-red-400 text-sm">Error loading metrics: {error}</div>
        </div>
      </div>
    );
  }
  
  const items = metrics ? [
    { label: "Citations", value: metrics["citations"]?.all ?? "–" },
    { label: "h-index", value: metrics["h-index"]?.all ?? "–" },
    { label: "i10-index", value: metrics["i10-index"]?.all ?? "–" },
  ] : [
    { label: "Citations", value: loading ? "Loading..." : "–" },
    { label: "h-index", value: loading ? "Loading..." : "–" },
    { label: "i10-index", value: loading ? "Loading..." : "–" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <a
          key={item.label}
          href={scholarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label={`Open Google Scholar profile to see ${item.label}`}
          title="Open Google Scholar profile"
        >
          <div className="text-2xl font-semibold">{item.value}</div>
          <div className="text-[var(--muted)]">{item.label}</div>
        </a>
      ))}
    </div>
  );
}
