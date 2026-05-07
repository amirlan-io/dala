"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useCartStore } from "@/lib/cart-store";

export function Navbar() {
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const lastAddedAt = useCartStore((s) => s.lastAddedAt);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => setIsAdmin(Boolean(data?.isAdmin)))
      .catch(() => setIsAdmin(false));
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--divider)] bg-[color:var(--color-surface)]/90 backdrop-blur md:hidden">
        <div className="flex h-20 items-center justify-center">
          <Link href="/" className="font-serif text-2xl tracking-wide">
            DALA
          </Link>
        </div>
      </header>

      <header className="sticky top-0 z-50 hidden border-b border-[var(--divider)] bg-[color:var(--color-surface)] md:block">
        <div className="container-dala flex h-20 items-center justify-between">
          <Link href="/" className="font-serif text-[20px] tracking-[0.08em]">
            DALA
          </Link>
          <nav className="hidden items-center gap-8 text-[12px] uppercase tracking-[0.15em] md:flex">
            <Link href="/" className="transition-opacity hover:opacity-70">Главная</Link>
            <Link href="/catalog" className="transition-opacity hover:opacity-70">Каталог</Link>
            <Link href="/about" className="transition-opacity hover:opacity-70">О бренде</Link>
            <Link href="/contact" className="transition-opacity hover:opacity-70">Контакты</Link>
          </nav>
          <div className="flex items-center gap-4 text-sm uppercase tracking-[0.1em]">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/catalog" })}
                className="text-[11px] tracking-[0.14em] text-[var(--color-on-surface-2)] transition hover:text-black"
              >
                Выйти
              </button>
            ) : null}
            <button aria-label="Search" className="inline-flex">
              <Search size={17} />
            </button>
            <Link href="/cart" className="relative inline-flex">
              <ShoppingBag size={18} />
              {count > 0 ? (
                <motion.span
                  key={lastAddedAt}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-center text-[10px] text-white"
                >
                  {count}
                </motion.span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
