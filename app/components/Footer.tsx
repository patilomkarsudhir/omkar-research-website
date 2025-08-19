export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[var(--panel)]/70">
      <div className="container py-6 text-sm text-[var(--muted)] flex flex-col md:flex-row gap-2 md:items-center justify-between">
        <p>© {new Date().getFullYear()} Omkar Patil</p>
        <p>Built with Next.js and Tailwind</p>
      </div>
    </footer>
  );
}
