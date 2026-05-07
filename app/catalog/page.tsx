import type { Metadata } from "next";
import { CatalogPageContent } from "@/components/pages/CatalogPageContent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Catalog | DALA",
  description: "Luxury Kazakh fashion collection by DALA.",
};

export default async function CatalogPage() {
  const session = await getServerSession(authOptions);
  return <CatalogPageContent initialIsAdmin={Boolean(session)} />;
}
