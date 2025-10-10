import Section from "../components/Section";
import Tabs from "../components/Tabs";
import dynamic from "next/dynamic";
import SelectedPubs from "./selected";
import { Metadata } from "next";

const ScholarClient = dynamic(() => import("../components/ScholarClient"), { ssr: false });

export const metadata: Metadata = {
  title: "Publications - Omkar Patil",
  description: "Research publications in adaptive control, robotics, and machine learning. Work on Lyapunov-based deep neural networks, control barrier functions, and physics-informed learning.",
  alternates: {
    canonical: "/publications",
  },
  openGraph: {
    title: "Publications - Omkar Patil",
    description: "Research publications in adaptive control, robotics, and machine learning.",
    url: "https://omkarsudhirpatil.com/publications",
    type: "website",
  },
};

export default function Page() {
  const user = process.env.NEXT_PUBLIC_SCHOLAR_USER || "EtkfNQMAAAAJ";
  return (
    <div className="space-y-8">
      <Section title="Publications" subtitle="Two views. Live from Scholar and a curated Selected tab.">
        <Tabs
          tabs={[
            { key: "selected", label: "Selected", content: <SelectedPubs /> },
            { key: "all", label: "All (Google Scholar)", content: <ScholarClient user={user} /> },
          ]}
        />
      </Section>
    </div>
  );
}
