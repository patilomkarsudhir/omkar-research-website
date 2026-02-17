"use client";

import Section from "../components/Section";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function FunStuffClient() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="space-y-8">
      <Section title="Fun Stuff">
        <div className="space-y-12">
          <div>
            <h3 className="text-xl font-semibold text-white/95 mb-4">3D Prints Gallery</h3>
            <p className="text-[var(--muted)] mb-6">Explorations in mathematical forms and architectural structures through 3D printing.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Klein Bottle */}
              <div className="flex flex-col items-center">
                <div className="bg-white/5 rounded-lg p-4 w-full h-64 flex items-center justify-center hover:bg-white/10 transition-colors mb-4 overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src="/Klein Bottle.jpg"
                      alt="Klein Bottle"
                      fill
                      className="rounded object-contain"
                    />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white/95 mb-2">Klein Bottle</h4>
                <p className="text-sm text-center text-[var(--muted)]">A non-orientable surface without boundary, where inside and outside merge into architectural elegance.</p>
              </div>

              {/* Tensegrity 1 */}
              <div className="flex flex-col items-center">
                <div className="bg-white/5 rounded-lg p-4 w-full h-64 flex items-center justify-center hover:bg-white/10 transition-colors mb-4 overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src="/Tensegrity 1.jpg"
                      alt="Tensegrity Structure"
                      fill
                      className="rounded object-contain"
                    />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white/95 mb-2">Tensegrity</h4>
                <p className="text-sm text-center text-[var(--muted)]">Tensional integrity in balance: discontinuous compression and continuous tension creating strength through equilibrium.</p>
              </div>

              {/* Voronoi Ball */}
              <div className="flex flex-col items-center">
                <div className="bg-white/5 rounded-lg p-4 w-full h-64 flex items-center justify-center hover:bg-white/10 transition-colors mb-4 overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src="/Voronoi Ball.jpg"
                      alt="Voronoi Ball"
                      fill
                      className="rounded object-contain"
                    />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white/95 mb-2">Voronoi Ball</h4>
                <p className="text-sm text-center text-[var(--muted)]">Cellular geometry dividing space into regions of geometric proximity. Nature's tessellation principle materialized.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white/95 mb-4">Academic Genealogy Tree</h3>
            <p className="text-[var(--muted)] mb-6">Academic lineage and intellectual inheritance through my advisors and mentors. Click to view larger.</p>
            <div 
              className="relative bg-white/5 rounded-lg p-6 overflow-x-auto inline-block cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <Image
                src="/Genealogy Tree.png"
                alt="Academic Genealogy Tree"
                width={300}
                height={200}
                className="rounded"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white/95 mb-4">Indian Classical Music</h3>
            <p className="text-[var(--muted)] mb-6">
              A raga is a melodic framework for improvisation (part scale, part mood, part grammar). This interactive tool includes both a generator and guided tutorials.
            </p>

            <a
              href="/raga-generator.html"
              className="group block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-colors"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold text-white/95">Raga Generator + Tutorials</h4>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-white/10 text-[var(--accent)]">
                        Beginner-friendly
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted)] group-hover:text-white/80 transition-colors max-w-2xl">
                      Pick a raga, hear it rendered with Indian-instrument style synthesis, then learn how it works via raga characteristics, a phrase library, and an interactive practice keyboard.
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-[var(--accent)]">
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/85">
                    Guided tutorials
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/85">
                    Phrase library (pakad)
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/85">
                    Interactive practice
                  </div>
                </div>

                <div className="mt-5 text-sm font-medium text-[var(--accent)]">
                  Open raga-generator
                </div>
              </div>
            </a>
          </div>
        </div>
      </Section>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto rounded-lg">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Image
              src="/Genealogy Tree.png"
              alt="Academic Genealogy Tree - Full View"
              width={1200}
              height={800}
              className="rounded w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
