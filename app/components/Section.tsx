import Link from "next/link";

export default function Section({ title, subtitle, children, href }: { title: string, subtitle?: string, children?: React.ReactNode, href?: string }) {
  return (
    <section className="my-10">
      {href ? (
        <Link href={href} className="text-section-title inline-block hover:text-[var(--accent)] transition-colors">
          <h2>{title}</h2>
        </Link>
      ) : (
        <h2 className="text-section-title">{title}</h2>
      )}
      {subtitle && <p className="text-[var(--muted)] mt-1">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
