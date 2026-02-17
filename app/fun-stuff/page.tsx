import Section from "../components/Section";
import { Metadata } from "next";

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
        <p className="text-[var(--muted)]">Placeholder for fun projects and experiments.</p>
      </Section>
    </div>
  );
}
