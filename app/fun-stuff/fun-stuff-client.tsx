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
                <div className="bg-white/5 rounded-lg p-6 w-full h-64 flex items-center justify-center hover:bg-white/10 transition-colors mb-4">
                  <Image
                    src="/Klein Bottle.jpg"
                    alt="Klein Bottle"
                    width={250}
                    height={250}
                    className="rounded object-cover w-full h-full"
                  />
                </div>
                <h4 className="text-lg font-semibold text-white/95 mb-2">Klein Bottle</h4>
                <p className="text-sm text-center text-[var(--muted)]">A non-orientable surface without boundary, where inside and outside merge into architectural elegance.</p>
              </div>

              {/* Tensegrity 1 */}
              <div className="flex flex-col items-center">
                <div className="bg-white/5 rounded-lg p-6 w-full h-64 flex items-center justify-center hover:bg-white/10 transition-colors mb-4">
                  <Image
                    src="/Tensegrity 1.jpg"
                    alt="Tensegrity Structure"
                    width={250}
                    height={250}
                    className="rounded object-cover w-full h-full"
                  />
                </div>
                <h4 className="text-lg font-semibold text-white/95 mb-2">Tensegrity</h4>
                <p className="text-sm text-center text-[var(--muted)]">Tensional integrity in balance: discontinuous compression and continuous tension creating strength through equilibrium.</p>
              </div>

              {/* Voronoi Ball */}
              <div className="flex flex-col items-center">
                <div className="bg-white/5 rounded-lg p-6 w-full h-64 flex items-center justify-center hover:bg-white/10 transition-colors mb-4">
                  <Image
                    src="/Voronoi Ball.jpg"
                    alt="Voronoi Ball"
                    width={250}
                    height={250}
                    className="rounded object-cover w-full h-full"
                  />
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
