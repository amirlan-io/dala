import type { Metadata } from "next";
import { BlogPageContent } from "@/components/pages/BlogPageContent";

export const metadata: Metadata = {
  title: "Journal | DALA",
  description: "Editorial stories on Kazakh fashion heritage by DALA.",
};

export default function BlogPage() {
  return <BlogPageContent />;
}
