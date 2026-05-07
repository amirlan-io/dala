import type { Metadata } from "next";
import { HomePageContent } from "@/components/pages/HomePageContent";

export const metadata: Metadata = {
  title: "DALA | Сила в традициях",
  description: "Kazakh heritage. Contemporary luxury.",
};

export default async function HomePage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DALA",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dala.kz",
    description: "Luxury Kazakh fashion brand inspired by heritage.",
  };
  return (
    <HomePageContent organizationSchemaJson={JSON.stringify(organizationSchema)} />
  );
}
