import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-soft)] bg-[var(--panel)]/80">
      <div className="container py-6 text-sm text-[var(--muted)] flex flex-col md:flex-row gap-2 md:items-center justify-between">
        <p>© {new Date().getFullYear()} Omkar Patil</p>
        <div className="flex items-center gap-4">
          <p>Built with Next.js and Tailwind</p>
          <Link 
            href="/analytics" 
            className="text-[var(--muted)]/20 hover:text-[var(--muted)]/60 transition-colors text-xs"
            title="Analytics"
          >
            •
          </Link>
        </div>
      </div>
    </footer>
  );
}
