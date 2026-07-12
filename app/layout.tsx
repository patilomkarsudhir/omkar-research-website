import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import SiteTracker from "./components/SiteTracker";
import SiteBackground from "./components/SiteBackground";
import { Analytics } from '@vercel/analytics/next';
import { Metadata, Viewport } from "next";
import { Source_Serif_4, IBM_Plex_Sans } from "next/font/google";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

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
  themeColor: '#f4f7fb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeInitScript = `(() => {
    try {
      var valid = ['light','dark','midnight','sepia','slate','ocean'];
      function autoTheme() {
        var d = new Date();
        var h = d.getHours();
        var pools = {
          dawn: ['sepia','light','slate'],
          day: ['light','slate','sepia'],
          dusk: ['ocean','slate','midnight'],
          night: ['dark','midnight','ocean']
        };
        var b = (h>=5&&h<9)?'dawn':(h>=9&&h<17)?'day':(h>=17&&h<20)?'dusk':'night';
        var key = d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
        var x = key ^ 0x9e3779b9;
        x = Math.imul(x ^ (x >>> 15), 0x85ebca6b);
        x ^= x >>> 13;
        x = x >>> 0;
        var pool = pools[b];
        return pool[x % pool.length];
      }
      var mode = localStorage.getItem('themeMode');
      var legacy = localStorage.getItem('theme');
      var theme;
      if (mode === 'auto') theme = autoTheme();
      else if (valid.indexOf(mode) !== -1) theme = mode;
      else if (valid.indexOf(legacy) !== -1) theme = legacy;
      else theme = autoTheme();
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })();`;

  return (
    <html lang="en" className={`${sourceSerif.variable} ${plexSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteBackground />
        <SiteTracker />
        <NavBar />
        <main className="flex-1 container py-10">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
