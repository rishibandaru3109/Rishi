import "./globals.css";
import "./motion.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rishi Bandaru — The Digital Playground",
  description: "An interactive portfolio showcasing Rishi Bandaru's software experiments, AI-assisted projects, and learning journey.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><a className="skip" href="#main">Skip to content</a>{children}</body></html>;
}
