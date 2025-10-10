import Section from "../components/Section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects - Omkar Patil",
  description: "Toy projects and prototypes with short writeups on control systems, robotics, and machine learning.",
  alternates: {
    canonical: "/projects",
  },
};

export default function Page() {
  return (
    <div className="space-y-8">
      <Section title="Projects">
        <p className="text-[var(--muted)]">Toy projects and prototypes with short writeups.</p>
      </Section>
    </div>
  );
}
