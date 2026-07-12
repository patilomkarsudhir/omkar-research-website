"use client";
import Link from "next/link";
import { NAV_LINKS, SITE } from "../lib/siteConfig";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[var(--border-soft)] bg-[var(--panel)]/80 backdrop-blur">
      <div className="container flex items-center justify-between py-5 md:py-6">
        <Link href="/" className="group flex items-center gap-6 md:gap-8">
          <span className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">{SITE.navName}</span>
          <span className="text-sm md:text-base font-medium text-[var(--muted)] transition-colors group-hover:text-[var(--text)]">{SITE.tag}</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-6 text-sm">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-1 rounded hover:bg-[var(--surface-weak)] hover:text-[var(--accent)] transition-colors ${pathname === link.href ? "text-[var(--accent)]" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <ThemeSwitcher />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeSwitcher />
          <button className="text-sm px-3 py-2 rounded border border-[var(--border-soft)]" onClick={() => setOpen(!open)}>
            Menu
          </button>
        </div>
        
        <nav className={`md:hidden gap-6 text-sm ${open ? "flex flex-col absolute left-0 right-0 top-16 bg-[var(--panel)] p-4 border-b border-[var(--border-soft)]" : "hidden"}`}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2 py-1 rounded hover:bg-[var(--surface-weak)] hover:text-[var(--accent)] transition-colors ${pathname === link.href ? "text-[var(--accent)]" : ""}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
