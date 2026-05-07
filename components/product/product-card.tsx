"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group">
      <Link href={`/catalog/${product.slug}`} className="block overflow-hidden">
        <div className="relative aspect-[3/4] bg-[var(--color-surface-mid)]">
          <Image
            src={product.images[0]}
            alt={`${product.name} by DALA`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="pt-4">
        <h3 className="font-serif text-2xl">{product.name}</h3>
        <p className="gold-label mt-1">{product.material}</p>
        <p className="mt-2 text-sm">{product.price.toLocaleString("ru-RU")} KZT</p>
      </div>
    </article>
  );
}
