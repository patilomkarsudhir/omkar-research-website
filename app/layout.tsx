import "./globals.css";
import SiteFrame from "./components/SiteFrame";
import SiteTracker from "./components/SiteTracker";
import { Analytics } from '@vercel/analytics/next';
import { Metadata, Viewport } from "next";

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://omkarsudhirpatil.com/#website",
  url: "https://omkarsudhirpatil.com",
  name: "Omkar Patil Research and ARC Lab",
  description: "Incoming LSU faculty site and ARC Lab home for research in adaptive control, robotics, and AI-driven safety-critical systems",
  publisher: {
    "@id": "https://omkarsudhirpatil.com/#person",
  },
};

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://omkarsudhirpatil.com/#organization",
  name: "Louisiana State University",
  url: "https://www.lsu.edu",
  sameAs: [
    "https://www.linkedin.com/school/louisiana-state-university/",
    "https://x.com/lsu",
  ],
  logo: "https://omkarsudhirpatil.com/favicon.ico",
};

const personStructuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://omkarsudhirpatil.com/#person",
  name: "Omkar Sudhir Patil",
  alternateName: ["Omkar Patil"],
  jobTitle: "Incoming Assistant Professor (Fall 2026)",
  description: "Incoming Assistant Professor at LSU and founder of ARC Lab, specializing in adaptive control, robotics, and AI-driven safety-critical systems.",
  url: "https://omkarsudhirpatil.com",
  image: "https://omkarsudhirpatil.com/Profile%20Pic.jpg",
  worksFor: {
    "@id": "https://omkarsudhirpatil.com/#organization",
  },
  affiliation: {
    "@id": "https://omkarsudhirpatil.com/#organization",
  },
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "University of Florida",
      sameAs: "https://www.ufl.edu",
    },
  ],
  sameAs: [
    "https://www.linkedin.com/in/omkar-patil-024",
    "https://github.com/patilomkarsudhir",
    "https://scholar.google.com/citations?user=EtkfNQMAAAAJ",
  ],
  knowsAbout: [
    "Adaptive control",
    "Lyapunov stability theory",
    "Control barrier functions",
    "Physics-informed neural networks",
    "Robotics",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "mailto:opatil1@lsu.edu",
    contactType: "Academic and research inquiries",
  },
  hasPart: [
    {
      "@type": "WebPage",
      name: "ARC Lab",
      url: "https://omkarsudhirpatil.com/arc-lab",
    },
    {
      "@type": "WebPage",
      name: "Curriculum Vitae",
      url: "https://omkarsudhirpatil.com/cv",
    },
    {
      "@type": "WebPage",
      name: "Research Projects",
      url: "https://omkarsudhirpatil.com/research",
    },
    {
      "@type": "WebPage",
      name: "Publications",
      url: "https://omkarsudhirpatil.com/publications",
    },
    {
      "@type": "WebPage",
      name: "Interactive Demos",
      url: "https://omkarsudhirpatil.com/demos",
    },
    {
      "@type": "WebPage",
      name: "Contact",
      url: "https://omkarsudhirpatil.com/contact",
    },
  ],
};

const structuredData = [websiteStructuredData, organizationStructuredData, personStructuredData];

export const metadata: Metadata = {
  metadataBase: new URL('https://omkarsudhirpatil.com'),
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#667eea',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteTracker />
        <SiteFrame>{children}</SiteFrame>
        <Analytics />
      </body>
    </html>
  );
}
