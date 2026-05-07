import type { Metadata } from "next";
import { AboutPageContent } from "@/components/pages/AboutPageContent";

export const metadata: Metadata = {
  title: "About | DALA",
  description: "Brand story of DALA, a luxury Kazakh fashion house.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
