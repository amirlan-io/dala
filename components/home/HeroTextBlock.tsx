"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export function HeroTextBlock() {
  const { t } = useLanguage();

  return (
    <section className="container-dala absolute inset-x-0 bottom-0 z-20 pb-8 md:pb-14">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="gold-label text-[10px] text-white md:text-[11px]"
      >
        {t("heroLabel")}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-4 max-w-4xl font-serif text-[42px] leading-[1.05] text-white md:mt-6 md:text-[64px]"
      >
        {t("heroTitle")}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-3 max-w-2xl text-sm text-white/90 md:mt-4 md:text-[28px] md:leading-[1.2]"
      >
        {t("heroSubtitle")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-5 flex flex-col gap-3 sm:flex-row"
      >
        <Link
          href="/catalog"
          className="inline-flex h-12 items-center justify-center bg-black px-6 text-xs uppercase tracking-[0.12em] !text-white transition hover:opacity-[0.85]"
        >
          {t("exploreCollection")}
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-12 items-center justify-center border border-white/60 bg-transparent px-6 text-xs uppercase tracking-[0.12em] !text-white transition hover:bg-white/10"
        >
          {t("contactManager")}
        </Link>
      </motion.div>
    </section>
  );
}
