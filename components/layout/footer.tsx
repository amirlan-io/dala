"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { MessageCircle, Settings } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

/** Lucide dropped the branded Instagram glyph; inline SVG keeps the same look/size contract. */
function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <>
      <footer className="mt-24 border-t border-white/20 bg-black py-12 text-white">
        <div className="container-dala grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-serif text-[20px] tracking-[0.08em]">DALA</p>
            <p className="mt-3 text-sm text-white/50">{t("footerTagline")}</p>
            <p className="mt-6 text-xs uppercase tracking-[0.15em] text-white/40">© 2025 DALA</p>
          </div>
          <div className="space-y-2 text-sm uppercase tracking-[0.15em] text-white/70">
            <Link href="/catalog" className="block transition-colors hover:text-white">{t("navCollections")}</Link>
            <Link href="/about" className="block transition-colors hover:text-white">{t("navAbout")}</Link>
            <Link href="/blog" className="block transition-colors hover:text-white">{t("navJournal")}</Link>
            <Link href="/contact" className="block transition-colors hover:text-white">{t("navContact")}</Link>
          </div>
          <div className="text-sm">
            <div className="flex items-center gap-4 text-white">
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
                <InstagramIcon size={18} />
              </a>
              <a href="https://wa.me/7XXXXXXXXXX" aria-label="WhatsApp" target="_blank" rel="noreferrer">
                <MessageCircle size={18} />
              </a>
            </div>
            <p className="mt-3 text-white/70">hello@dala.kz</p>
            <button
              type="button"
              aria-label="Admin login"
              className="mb-20 mt-5 inline-flex items-center gap-2 rounded-md border border-white/30 p-2 text-white/70 transition hover:text-white md:mb-0"
              onClick={() => {
                setError("");
                setIsOpen(true);
              }}
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </footer>
      {isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4" onClick={() => setIsOpen(false)}>
          <div className="w-full max-w-md bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <p className="font-serif text-4xl">Admin login</p>
            <form
              className="mt-6 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setError("");
                const result = await signIn("credentials", {
                  email,
                  password,
                  callbackUrl: "/",
                  redirect: false,
                });

                if (result?.error) {
                  setError("Неверные данные");
                  return;
                }
                setIsOpen(false);
                window.location.href = "/";
              }}
            >
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full border-b border-black bg-transparent py-2 outline-none"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full border-b border-black bg-transparent py-2 outline-none"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex gap-3 pt-1">
                <button className="btn-primary px-7 py-3 text-xs uppercase tracking-[0.12em]">Sign in</button>
                <button type="button" className="border px-5 py-3 text-xs uppercase tracking-[0.12em]" onClick={() => setIsOpen(false)}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
