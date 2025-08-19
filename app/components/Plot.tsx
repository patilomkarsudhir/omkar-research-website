"use client";
type Series = { name: string, data: number[] };
export default function Plot({ series, width=600, height=180, padding=24 }: { series: Series[], width?: number, height?: number, padding?: number }) {
  const all = series.flatMap(s => s.data);
  const minY = Math.min(...all, 0);
  const maxY = Math.max(...all, 1e-6);
  const len = Math.max(...series.map(s => s.data.length), 1);
  const points = (arr: number[]) => arr.map((y, i) => {
    const x = padding + (i/(len-1||1))*(width-2*padding);
    const t = (y - minY) / (maxY - minY || 1);
    const py = height - padding - t*(height-2*padding);
    return `${x.toFixed(2)},${py.toFixed(2)}`;
  }).join(" ");
  return (
    <svg width={width} height={height} className="w-full rounded-xl border border-white/10 bg-white/5">
      <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="currentColor" strokeOpacity="0.2"/>
      <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="currentColor" strokeOpacity="0.2"/>
      {series.map((s, idx) => (
        <polyline key={idx} fill="none" stroke="currentColor" strokeOpacity={0.9 - idx*0.2} strokeWidth="1.5" points={points(s.data)} />
      ))}
    </svg>
  );
}
