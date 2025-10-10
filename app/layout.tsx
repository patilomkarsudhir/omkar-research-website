import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import SiteTracker from "./components/SiteTracker";
import { Analytics } from '@vercel/analytics/next';
import { Metadata, Viewport } from "next";

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://omkarsudhirpatil.com/#website",
  url: "https://omkarsudhirpatil.com",
  name: "Omkar Patil Research",
  description: "Research in adaptive control, robotics, and AI-driven safety-critical systems",
  publisher: {
    "@id": "https://omkarsudhirpatil.com/#person",
  },
};

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://omkarsudhirpatil.com/#organization",
  name: "University of Florida",
  url: "https://www.ufl.edu",
  sameAs: [
    "https://www.linkedin.com/school/university-of-florida/",
    "https://twitter.com/UF",
  ],
  logo: "https://omkarsudhirpatil.com/favicon.ico",
};

const personStructuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://omkarsudhirpatil.com/#person",
  name: "Omkar Sudhir Patil",
  alternateName: ["Omkar Patil"],
  jobTitle: "Research Scientist",
  description: "Research Scientist specializing in adaptive control, robotics, and AI-driven safety-critical systems.",
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
    email: "mailto:patilomkarsudhir@ufl.edu",
    contactType: "Academic and research inquiries",
  },
  hasPart: [
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
        <NavBar />
        <main className="flex-1 container py-10">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
