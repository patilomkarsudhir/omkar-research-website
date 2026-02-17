import Section from "../components/Section";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Fun Stuff - Omkar Patil",
  description: "Fun projects, experiments, and creative explorations.",
  alternates: {
    canonical: "/fun-stuff",
  },
};

export default function Page() {
  return (
    <div className="space-y-8">
      <Section title="Fun Stuff">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white/95 mb-4">Academic Genealogy Tree</h3>
            <p className="text-[var(--muted)] mb-6">Academic lineage and intellectual inheritance through my advisors and mentors.</p>
            <div className="relative w-full bg-white/5 rounded-lg p-6 overflow-x-auto">
              <Image
                src="/Genealogy Tree.png"
                alt="Academic Genealogy Tree"
                width={1200}
                height={800}
                className="w-full h-auto rounded"
                priority
              />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
