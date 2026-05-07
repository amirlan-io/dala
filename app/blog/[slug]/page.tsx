"use client";

import { useParams } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog-data";
import { useLanguage } from "@/lib/i18n";

export default function BlogDetailPage() {
  const { t } = useLanguage();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) return <section className="container-dala section-space">Post not found.</section>;

  return (
    <article className="container-dala section-space max-w-3xl">
      <p className="gold-label">{post.date}</p>
      <h1 className="mt-4 font-serif text-5xl">{post.title}</h1>
      <p className="mt-8 text-lg leading-8 text-[var(--color-on-surface-2)]">{post.content}</p>
      <p className="mt-8 text-sm uppercase tracking-[0.12em] text-[var(--color-on-surface-2)]">{t("journal")}</p>
    </article>
  );
}
