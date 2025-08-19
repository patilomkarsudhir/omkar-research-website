export default function Section({ title, subtitle, children }: { title: string, subtitle?: string, children?: React.ReactNode }) {
  return (
    <section className="my-10">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {subtitle && <p className="text-[var(--muted)] mt-1">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
