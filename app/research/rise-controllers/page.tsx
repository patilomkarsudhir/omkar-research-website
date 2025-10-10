import Section from "../../components/Section";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Metadata } from "next";

const ResearchPublications = dynamic(() => import("../../components/ResearchPublications"), { ssr: false });

export const metadata: Metadata = {
  title: "RISE Controllers - Omkar Patil",
  description: "Robust Integral of the Sign of the Error (RISE) controllers for nonlinear systems with uncertainties. Proving exponential convergence for asymptotic tracking in control-affine systems.",
  alternates: {
    canonical: "/research/rise-controllers",
  },
  openGraph: {
    title: "RISE Controllers - Omkar Patil",
    description: "Robust Integral of the Sign of the Error (RISE) controllers for nonlinear systems with uncertainties.",
    url: "https://omkarsudhirpatil.com/research/rise-controllers",
    images: [{ url: "/phase_trajectory.gif" }],
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
      "name": "RISE Controllers",
      "item": "https://omkarsudhirpatil.com/research/rise-controllers"
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
      <Section title="RISE Controllers">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-3">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow">
              <Image
                src="/phase_trajectory.gif"
                alt="Phase trajectory illustrating system dynamics"
                fill
                sizes="(min-width: 768px) 25vw, 100vw"
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          </div>
          <div className="md:col-span-9">
            <p className="text-[var(--muted)]">
              The Robust Integral of the Sign of the Error controllers or RISE controllers constitute a class of continuous robust control algorithms developed for nonlinear, control‐affine systems subject to uncertainties and disturbances. Distinguished by their capability to guarantee asymptotic tracking of reference trajectories even in the presence of bounded modeling errors, RISE controllers can be used where the exact system dynamics are unknown. For a while, RISE Controllers were thought to only achieve asymptotic tracking. I developed new theorems which showed the convergence is not only asymptotic but also exponential.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Related Publications">
        <ResearchPublications category="rise" title="RISE Controllers Publications" />
      </Section>
    </div>
    </>
  );
}
