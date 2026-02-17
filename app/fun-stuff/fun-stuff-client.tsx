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

            {/* BulletCAD side note */}
            <div className="mt-8 p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-sm text-[var(--muted)]">
                <span className="text-white/80 font-medium">Side note:</span> I built{" "}
                <a 
                  href="/bulletcad.html" 
                  className="text-[var(--accent)] hover:underline font-medium"
                >
                  BulletCAD
                </a>
                , an open-source tool for rapid prototyping CAD models for 3D printing. It lets you describe geometry using simple bullet-point syntax and instantly preview your model.
              </p>
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
            <div className="text-[var(--muted)] mb-6 space-y-4">
              <p>
                Imagine a musical system over 2,000 years old where there are no fixed compositions to memorize. Instead, musicians learn <em>ragas</em>: melodic blueprints that tell you which notes to use, which to emphasize, which sequences are forbidden, and what emotional mood to evoke. A morning raga sounds different from an evening one. A raga for longing differs from one for celebration.
              </p>
              <p>
                Unlike Western scales, a raga is not just a set of notes. It comes with rules: certain phrases are signature moves, certain transitions are forbidden, and certain notes must be ornamented with microtonal bends called <em>andolan</em>. Master musicians spend decades internalizing these constraints, then improvise freely within them, often for hours at a stretch.
              </p>
              <p>
                I built this tool to explore how these ancient rules can be encoded algorithmically, and to help anyone, regardless of background, experience what makes ragas so captivating.
              </p>
            </div>

            <a
              href="/raga-generator.html"
              className="group block rounded-xl overflow-hidden bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-rose-900/40 border border-amber-500/20 hover:border-amber-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
            >
              <div className="flex flex-col md:flex-row">
                {/* Decorative visual panel */}
                <div className="relative md:w-48 h-32 md:h-auto bg-gradient-to-br from-amber-600/30 via-orange-500/20 to-rose-600/30 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-amber-400/40 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-orange-400/40 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-rose-400/40 rounded-full" />
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="text-4xl mb-1">🎶</div>
                    <div className="text-xs font-medium text-amber-200/80 tracking-wider uppercase">Interactive</div>
                  </div>
                </div>

                {/* Content panel */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-lg font-bold text-amber-100">Raga Generator + Tutorials</h4>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          No prior knowledge needed
                        </span>
                      </div>
                      <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                        Choose from 15+ ragas spanning morning devotion to midnight romance. The generator plays endless, never-repeating melodies that follow each raga's grammar. Switch to Tutorials mode to see the scale, learn characteristic phrases, and practice on an interactive keyboard with visual feedback.
                      </p>
                    </div>

                    <div className="flex-shrink-0 text-amber-400 hidden md:block">
                      <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div className="rounded-lg bg-black/20 border border-amber-500/20 px-3 py-2 text-amber-100/90">
                      Procedural melodies
                    </div>
                    <div className="rounded-lg bg-black/20 border border-amber-500/20 px-3 py-2 text-amber-100/90">
                      Phrase library
                    </div>
                    <div className="rounded-lg bg-black/20 border border-amber-500/20 px-3 py-2 text-amber-100/90">
                      Practice keyboard
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
                    <span>Launch the raga generator</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
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
