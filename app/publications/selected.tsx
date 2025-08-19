import rawSelected from "../../data/selected.json";

type Publication = {
  title: string;
  authors: string;
  venue: string;
  year?: number;
  blurb?: string;
  links?: {
    pdf?: string;
    code?: string;
    video?: string;
  };
};

const selected = rawSelected as Publication[];

export default function SelectedPubs() {
  return (
    <div className="grid gap-3">
      {selected.map((p, i) => (
        <div key={i} className="rounded-xl border border-white/10 p-4 bg-white/5">
          <div className="font-medium">{p.title}</div>
          <div className="text-sm text-[var(--muted)] mt-1">{p.authors}</div>
          <div className="text-sm text-[var(--muted)]">{p.venue} {p.year ? `• ${p.year}` : ""}</div>
          {p.blurb && <div className="text-sm mt-2">{p.blurb}</div>}
          <div className="flex gap-3 mt-2 text-sm">
            {p.links?.pdf && (
              <a className="underline" href={p.links.pdf} target="_blank" rel="noopener noreferrer">PDF</a>
            )}
            {p.links?.code && (
              <a className="underline" href={p.links.code} target="_blank" rel="noopener noreferrer">Code</a>
            )}
            {p.links?.video && (
              <a className="underline" href={p.links.video} target="_blank" rel="noopener noreferrer">Video</a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
