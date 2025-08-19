import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 container py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
