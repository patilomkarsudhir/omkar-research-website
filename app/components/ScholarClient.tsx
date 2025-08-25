"use client";
import { useEffect, useMemo, useState } from "react";
type Metrics = Record<string, { all: number; recent: number }>;
type Pub = { title: string; link?: string | null; authors?: string; venue?: string; cited?: number; year?: number };
export default function ScholarClient({ user }: { user: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [q, setQ] = useState("");
  const [year, setYear] = useState<number | "">("");
  async function sync(force = false) {
    try {
      setLoading(true); setError(null);
      const url = `/api/scholar?user=${encodeURIComponent(user)}${force ? `&force=1&bust=${Date.now()}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
      const data = await res.json();
      setMetrics(data.metrics || null);
      setPubs(data.publications || []);
      localStorage.setItem(`scholar_cache:${user}`, JSON.stringify(data));
    } catch (e: any) { setError(e.message || "Failed to sync."); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    const cached = localStorage.getItem(`scholar_cache:${user}`);
    if (cached) { try { const data = JSON.parse(cached); setMetrics(data.metrics || null); setPubs(data.publications || []); } catch {} }
    sync(false);
  }, [user]);
  const years = useMemo(() => Array.from(new Set(pubs.map(p => p.year).filter(Boolean) as number[])).sort((a,b)=>b-a), [pubs]);
  const filtered = useMemo(() => pubs.filter(p => {
    const matchQ = q ? (p.title?.toLowerCase().includes(q.toLowerCase()) || p.authors?.toLowerCase().includes(q.toLowerCase()) || p.venue?.toLowerCase().includes(q.toLowerCase())) : true;
    const matchYear = year ? p.year === year : true;
    return matchQ && matchYear;
  }), [pubs, q, year]);
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex-1">
          <label className="text-sm text-[var(--muted)]">Search</label>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="title, author, venue" className="w-full px-3 py-2 rounded border border-white/10 bg-white/5 outline-none" />
        </div>
        <div>
          <label className="text-sm text-[var(--muted)]">Year</label>
          <select value={year} onChange={(e)=>setYear(e.target.value ? parseInt(e.target.value) : "")} className="w-40 px-3 py-2 rounded border border-white/10 bg-white/5">
            <option value="">All</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
  <button onClick={() => sync(true)} disabled={loading} className="px-4 py-2 rounded bg-white/10 border border-white/10 hover:bg-white/20">
          {loading ? "Syncing…" : "Sync from Google Scholar"}
        </button>
      </div>
      {error && <div className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm">{error}</div>}
      {metrics && (
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(metrics).map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-white/10 p-4 bg-white/5">
              <div className="text-xs uppercase tracking-wide text-[var(--muted)]">{k}</div>
              <div className="mt-1 text-2xl font-semibold">{v.all} <span className="text-sm text-[var(--muted)]">all</span></div>
              <div className="text-sm text-[var(--muted)]">{v.recent} recent</div>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-3">
        {filtered.map((p, i) => (
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
            <div className="text-xs text-[var(--muted)] mt-1">Cited by {p.cited ?? 0}</div>
          </div>
        ))}
        {!filtered.length && <div className="text-[var(--muted)] text-sm">No results.</div>}
      </div>
    </div>
  );
}
