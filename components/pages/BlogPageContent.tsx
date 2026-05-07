"use client";

import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-data";
import { useLanguage } from "@/lib/i18n";

export function BlogPageContent() {
  const { t } = useLanguage();

  return (
    <section className="container-dala section-space">
      <h1 className="font-serif text-5xl">{t("journal")}</h1>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <article key={post.slug} className="border border-[var(--divider)] p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-on-surface-2)]">{post.date}</p>
            <h2 className="mt-4 font-serif text-2xl">{post.title}</h2>
            <p className="mt-3 text-sm text-[var(--color-on-surface-2)]">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="mt-5 inline-block text-sm uppercase tracking-[0.12em]">
              {t("readArticle")}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
