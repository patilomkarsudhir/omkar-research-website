"use client";

import Section from "../components/Section";
import Image from "next/image";
import { useState } from "react";

export default function FunStuffClient() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-8">
      <Section title="Fun Stuff">
        <div className="space-y-6">
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
              <div className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 13H9" />
                </svg>
              </div>
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
