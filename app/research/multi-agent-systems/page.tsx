import Section from "../../components/Section";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Metadata } from "next";

const ResearchPublications = dynamic(() => import("../../components/ResearchPublications"), { ssr: false });

export const metadata: Metadata = {
  title: "Multi-Agent Systems - Omkar Patil",
  description: "Coordination and control of multiple autonomous agents using decentralized strategies, graph theory, and graph neural networks. Research in target tracking, formation control, and cooperative task execution.",
  alternates: {
    canonical: "/research/multi-agent-systems",
  },
  openGraph: {
    title: "Multi-Agent Systems - Omkar Patil",
    description: "Coordination and control of multiple autonomous agents using decentralized strategies and graph neural networks.",
    url: "https://omkarsudhirpatil.com/research/multi-agent-systems",
    images: [{ url: "/Multi Agent Pic.png" }],
    type: "website",
  },
};

const breadcrumbStructuredData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://omkarsudhirpatil.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Research",
      "item": "https://omkarsudhirpatil.com/research"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Multi-Agent Systems",
      "item": "https://omkarsudhirpatil.com/research/multi-agent-systems"
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <div className="space-y-12">
      <Section title="Multi-Agent Systems">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8">
            <p className="text-[var(--muted)]">
              I investigate the coordination and control of multiple autonomous agents to achieve collective goals. My work in this domain includes developing decentralized control strategies, communication protocols, and decision-making algorithms that enable teams of robots or other autonomous entities to collaborate effectively and robustly in dynamic environments. These systems are designed to solve problems like target tracking, formation control, and cooperative task execution, ensuring that agents can work together seamlessly even in the presence of uncertainties and disturbances. These results involve sophisticated use of graph theory and tools such graph neural networks to model and analyze the interactions between agents.
            </p>
          </div>
          <div className="md:col-span-4 md:order-last">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow">
              <Image
                src="/Multi Agent Pic.png"
                alt="Illustration of a multi-agent system"
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Related Publications">
        <ResearchPublications category="multiagent" title="Multi-Agent Systems Publications" />
      </Section>
    </div>
    </>
  );
}
