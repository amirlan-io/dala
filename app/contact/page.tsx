import type { Metadata } from "next";
import { ContactPageContent } from "@/components/pages/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact | DALA",
  description: "Contact DALA personal manager via WhatsApp or email.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
