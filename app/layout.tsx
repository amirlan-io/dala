import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { PageTransition } from "@/components/layout/page-transition";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LanguageProvider } from "@/lib/i18n";
import { Cormorant_Garamond } from "next/font/google";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "DALA — Strength in Tradition",
  description: "Luxury Kazakh fashion house by DALA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${cormorantGaramond.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <Navbar />
          <main className="flex flex-1 pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
            <PageTransition>{children}</PageTransition>
          </main>
          <MobileBottomNav />
          <Footer />
          <WhatsAppFab />
        </LanguageProvider>
      </body>
    </html>
  );
}
