import type { Metadata } from "next";
import { CatalogPageContent } from "@/components/pages/CatalogPageContent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Catalog | DALA",
  description: "Luxury Kazakh fashion collection by DALA.",
};

export default async function CatalogPage() {
  let initialIsAdmin = false;
  try {
    const session = await getServerSession(authOptions);
    initialIsAdmin = Boolean(session);
  } catch {
    initialIsAdmin = false;
  }

  return <CatalogPageContent initialIsAdmin={initialIsAdmin} />;
}
