"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import NavBar from "./NavBar";
import Footer from "./Footer";

export default function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const latexRoute = pathname === "/latex";

  return (
    <>
      {!latexRoute && <NavBar />}
      <main className={latexRoute ? "flex-1 p-0" : "flex-1 container py-10"}>
        {children}
      </main>
      {!latexRoute && <Footer />}
    </>
  );
}