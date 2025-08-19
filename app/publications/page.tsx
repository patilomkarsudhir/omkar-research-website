import Section from "../components/Section";
import Tabs from "../components/Tabs";
import dynamic from "next/dynamic";
import SelectedPubs from "./selected";

const ScholarClient = dynamic(() => import("../components/ScholarClient"), { ssr: false });

export default function Page() {
  const user = process.env.NEXT_PUBLIC_SCHOLAR_USER || "EtkfNQMAAAAJ";
  return (
    <div className="space-y-8">
      <Section title="Publications" subtitle="Two views. Live from Scholar and a curated Selected tab.">
        <Tabs
          tabs={[
            { key: "all", label: "All (Google Scholar)", content: <ScholarClient user={user} /> },
            { key: "selected", label: "Selected", content: <SelectedPubs /> },
          ]}
        />
      </Section>
    </div>
  );
}
