"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { House, LayoutGrid, Menu, ShoppingBag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useCartStore } from "@/lib/cart-store";
import { Language, useLanguage } from "@/lib/i18n";
import { clearSupabaseSession } from "@/lib/supabase-client";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const cartCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const lastAddedAt = useCartStore((s) => s.lastAddedAt);
  const phone = process.env.NEXT_PUBLIC_WHATSAPP ?? "7XXXXXXXXXX";
  const whatsappHref = `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent("Здравствуйте! Я хочу узнать подробнее о коллекции DALA")}`;

  const languages: { key: Language; label: string }[] = [
    { key: "kz", label: "КАЗ" },
    { key: "ru", label: "РУС" },
    { key: "en", label: "ENG" },
  ];

  const navItems = [
    { href: "/", label: t("menuHome").toUpperCase(), Icon: House, active: pathname === "/" },
    { href: "/catalog", label: t("menuCatalog").toUpperCase(), Icon: LayoutGrid, active: pathname.startsWith("/catalog") },
    { href: "/cart", label: t("cart").toUpperCase(), Icon: ShoppingBag, active: pathname.startsWith("/cart") },
  ];

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => setIsAdmin(Boolean(data?.isAdmin)))
      .catch(() => setIsAdmin(false));
  }, []);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(30,27,21,0.1)] bg-[#FFF8F1] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid h-16 grid-cols-4">
          {navItems.map(({ href, label, Icon, active }) => (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center gap-1 text-center"
            >
              {active ? <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 bg-[#C9A96E]" /> : null}
              <span className="relative">
                <Icon size={18} strokeWidth={active ? 2.4 : 1.9} color={active ? "#000000" : "#999"} />
                {href === "/cart" && cartCount > 0 ? (
                  <motion.span
                    key={lastAddedAt}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white"
                  >
                    {cartCount}
                  </motion.span>
                ) : null}
              </span>
              <span
                className={`text-center text-[9px] uppercase tracking-[0.14em] ${active ? "font-semibold" : "font-normal"}`}
                style={{ color: active ? "#000000" : "#999" }}
              >
                {label}
              </span>
            </Link>
          ))}

          <button onClick={() => setMenuOpen(true)} className="relative flex flex-col items-center justify-center gap-1">
            {menuOpen ? <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 bg-[#C9A96E]" /> : null}
            <Menu size={18} color={menuOpen ? "#000000" : "#999"} />
            <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: menuOpen ? "#000000" : "#999" }}>
              {t("menuLabel").toUpperCase()}
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen ? (
          <motion.aside
            className="fixed inset-0 z-[60] overflow-y-auto bg-[#FFF8F1] antialiased md:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <button className="absolute right-6 top-6 text-[#1E1B15]/85" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X size={22} strokeWidth={1.5} />
            </button>

            <div className="flex min-h-[100dvh] flex-col px-8 pb-[calc(96px+env(safe-area-inset-bottom))] pt-20">
              <div className="my-auto">
                <div className="font-serif text-[32px] leading-none">
                  {[
                    { href: "/", label: t("menuHome") },
                    { href: "/catalog", label: t("menuCatalog") },
                    { href: "/about", label: t("menuAbout") },
                    { href: "/blog", label: t("menuJournal") },
                    { href: "/contact", label: t("menuContact") },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block border-b border-gray-100 py-4 transition-colors ${
                        pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                          ? "text-[#C9A96E]"
                          : "text-[#1E1B15]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-8 border-t border-[#C9A96E] pt-6">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-[#C9A96E]">{t("mobileLanguageLabel")}</p>
                  <div className="mb-2 mt-6 flex gap-3">
                    {languages.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setLanguage(item.key)}
                        className={`border border-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                          language === item.key
                            ? "border-black bg-black text-white"
                            : "border-black/30 bg-transparent text-[#1E1B15]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await clearSupabaseSession();
                      await signOut({ callbackUrl: "/catalog" });
                    }}
                    className="block w-full rounded-full border border-black px-5 py-3 text-center text-xs uppercase tracking-[0.16em] text-[#1E1B15] transition hover:bg-black hover:text-white"
                  >
                    {t("logoutAdmin")}
                  </button>
                ) : null}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-full bg-[#B78A3A] px-5 py-3 text-center text-sm uppercase tracking-[0.1em] text-white transition hover:bg-[#A67B30]"
                >
                  Связаться с менеджером
                </a>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
