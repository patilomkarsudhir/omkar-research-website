import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import SiteTracker from "./components/SiteTracker";
import { Metadata, Viewport } from "next";

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
        <link rel="canonical" href="https://omkarsudhirpatil.com" />
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteTracker />
        <NavBar />
        <main className="flex-1 container py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
