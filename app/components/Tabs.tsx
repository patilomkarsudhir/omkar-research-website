"use client";
import { useState } from "react";
export default function Tabs({ tabs }: { tabs: { key: string, label: string, content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  return (
    <div>
      <div className="flex gap-2 text-sm">
        {tabs.map(t => (
          <button key={t.key} onClick={()=>setActive(t.key)} className={`px-3 py-1.5 rounded border ${active===t.key ? "border-white/30 bg-white/10" : "border-white/10 hover:bg-white/5"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs.find(t => t.key === active)?.content}</div>
    </div>
  );
}
