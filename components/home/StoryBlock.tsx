"use client";

import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";

type StoryBlockProps = {
  imageSrc: StaticImageData;
};

export function StoryBlock({ imageSrc }: StoryBlockProps) {
  return (
    <section className="container-dala">
      <div className="grid overflow-hidden rounded-md border border-[var(--divider)] bg-[#F0E8DC] md:grid-cols-2">
        <div className="p-6 md:p-10">
          <p className="gold-label">История бренда</p>
          <h2 className="mt-5 font-serif text-3xl">Традиции, созданные вручную для нового поколения.</h2>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-[var(--color-on-surface-2)]">
            DALA создает предметы высокой казахской моды: камзолы, чапаны и аксессуары, в которых ремесло, шелк и
            культурный код складываются в современный силуэт.
          </p>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--color-on-surface-2)]">
            Каждая вещь собирается вручную с уважением к орнаменту и наследию степи.
          </p>
          <Link href="/about" className="mt-8 inline-block text-xs uppercase tracking-[0.15em]">
            Читать историю →
          </Link>
        </div>
        <div className="relative min-h-[340px] border-t border-[var(--divider)] md:min-h-[480px] md:border-l md:border-t-0">
          <Image src={imageSrc} alt="История бренда DALA" fill placeholder="blur" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
