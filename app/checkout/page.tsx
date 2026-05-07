import type { Metadata } from "next";
import { CheckoutPageContent } from "@/components/pages/CheckoutPageContent";

export const metadata: Metadata = {
  title: "Checkout | DALA",
  description: "Complete your DALA order.",
};

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
