import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "SkillPath",
  description: "Pick a role and the skills you have. See what to learn next, in order.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Header />
        <main id="main-content" className="flex-1 w-full max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 py-8 md:py-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}