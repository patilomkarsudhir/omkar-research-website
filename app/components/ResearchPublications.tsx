"use client";
import { useEffect, useState } from "react";
import { loadPaperMapping, getPdfUrl } from "../publications/paper-utils";

type Pub = { 
  title: string; 
  link?: string | null; 
  authors?: string; 
  venue?: string; 
  cited?: number; 
  year?: number; 
};

interface ResearchPublicationsProps {
  category: 'lbdnn' | 'multiagent' | 'rise' | 'safety';
  title: string;
}

// Keywords for each category
const categoryKeywords = {
  lbdnn: [
    'neural network', 'deep neural', 'lyapunov-based', 'lstm', 'resnet', 'physics-informed', 
    'recurrent neural', 'dropout', 'gradient', 'lb-dnn', 'lb-lstm', 'pinn', 'thermodynamic'
  ],
  multiagent: [
    'multi-agent', 'distributed', 'decentralized', 'collaborative', 'herding', 'target tracking',
    'graph neural', 'heterogeneous', 'spacecraft', 'second-order'
  ],
  rise: [
    'rise', 'robust integral', 'exponential stability', 'saturated', 'projected dynamical',
    'euler-lagrange', 'time-varying', 'concurrent learning'
  ],
  safety: [
    'safety', 'barrier', 'cbf', 'control barrier', 'singularity-free', 'hierarchical',
    'disturbance observer', 'quad-rotorcraft'
  ]
};

export default function ResearchPublications({ category, title }: ResearchPublicationsProps) {
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [loading, setLoading] = useState(true);
  const [paperMapping, setPaperMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      try {
        // Load cached scholar data
        const user = process.env.NEXT_PUBLIC_SCHOLAR_USER || "EtkfNQMAAAAJ";
        const cached = localStorage.getItem(`scholar_cache:${user}`);
        
        let publications: Pub[] = [];
        if (cached) {
          try {
            const data = JSON.parse(cached);
            publications = data.publications || [];
          } catch {}
        }

        // If no cached data, try to fetch from API
        if (publications.length === 0) {
          try {
            const res = await fetch(`/api/scholar?user=${encodeURIComponent(user)}`);
            if (res.ok) {
              const data = await res.json();
              publications = data.publications || [];
            }
          } catch (e) {
            console.warn('Could not fetch scholar data:', e);
          }
        }

        // Filter publications based on category keywords
        const keywords = categoryKeywords[category];
        const filteredPubs = publications.filter(pub => {
          const titleLower = pub.title?.toLowerCase() || '';
          const authorsLower = pub.authors?.toLowerCase() || '';
          const venueLower = pub.venue?.toLowerCase() || '';
          const searchText = `${titleLower} ${authorsLower} ${venueLower}`;
          
          return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
        });

        // Sort by citation count (descending) then by year (descending)
        filteredPubs.sort((a, b) => {
          const citedA = a.cited || 0;
          const citedB = b.cited || 0;
          if (citedA !== citedB) return citedB - citedA;
          return (b.year || 0) - (a.year || 0);
        });

        setPubs(filteredPubs);

        // Load paper mapping
        const mapping = await loadPaperMapping();
        setPaperMapping(mapping);
        
      } catch (error) {
        console.error('Error loading publications:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [category]);

  if (loading) {
    return (
      <div className="grid gap-3">
        <div className="rounded-xl border border-white/10 p-4 bg-white/5 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-white/10 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-white/10 rounded w-2/3"></div>
        </div>
        <div className="rounded-xl border border-white/10 p-4 bg-white/5 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-white/10 rounded w-1/3 mb-1"></div>
          <div className="h-3 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (pubs.length === 0) {
    return (
      <div className="text-[var(--muted)] text-sm text-center py-8">
        No publications found for this research area.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {pubs.map((p, i) => {
        const pdfUrl = getPdfUrl(p, paperMapping);
        return (
          <div key={i} className="rounded-xl border border-white/10 p-4 bg-white/5">
            <div className="font-medium">
              {p.link ? (
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {p.title}
                </a>
              ) : (
                p.title
              )}
            </div>
            <div className="text-sm text-[var(--muted)] mt-1">{p.authors}</div>
            <div className="text-sm text-[var(--muted)]">{p.venue} {p.year ? `• ${p.year}` : ""}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-[var(--muted)]">Cited by {p.cited ?? 0}</div>
              <div className="flex gap-2">
                {pdfUrl && (
                  <a 
                    href={pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-md hover:bg-blue-600/30 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                    </svg>
                    View PDF
                  </a>
                )}
                {p.link && (
                  <a 
                    href={p.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-600/20 text-gray-400 border border-gray-500/30 rounded-md hover:bg-gray-600/30 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    Scholar
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
