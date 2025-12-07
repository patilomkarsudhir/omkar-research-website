import Section from "../../components/Section";
import Image from "next/image";
import ResearchPublications from "../../components/ResearchPublications";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safe Control Methods - Omkar Patil",
  description: "Safe control for autonomous systems using Control Barrier Functions (CBFs) and Signal Temporal Logic (STL). Formal safety guarantees and performance on complex temporal logic specifications.",
  alternates: {
    canonical: "/research/safe-control-methods",
  },
  openGraph: {
    title: "Safe Control Methods - Omkar Patil",
    description: "Safe control for autonomous systems using Control Barrier Functions and Signal Temporal Logic.",
    url: "https://omkarsudhirpatil.com/research/safe-control-methods",
    images: [{ url: "/CBF Lab Pic.png" }],
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
      "name": "Safe Control Methods",
      "item": "https://omkarsudhirpatil.com/research/safe-control-methods"
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
      <Section title="Safe Control Methods">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-9">
            <p className="text-[var(--muted)]">
              My research on safe control methods aims to ensure that autonomous systems operate within predefined safety constraints. I utilize techniques such as Control Barrier Functions (CBFs) and Signal Temporal Logic (STL) to design controllers that can formally guarantee safety, preventing the system from entering unsafe states while pursuing its objectives. Furthermore, these safe control methods also enable performance guarantees on complex tasks provided using temporal logic specifications.
            </p>
          </div>
          <div className="md:col-span-3 md:order-last">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow">
              <Image
                src="/CBF Lab Pic.png"
                alt="CBF Lab photo"
                fill
                sizes="(min-width: 768px) 25vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Related Publications">
        <ResearchPublications category="safety" title="Safe Control Methods Publications" />
      </Section>
    </div>
    </>
  );
}
