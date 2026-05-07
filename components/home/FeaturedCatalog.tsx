"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";

const BLUR_DATA =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzIiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjQiIGZpbGw9IiNlZGU0ZDkiLz48L3N2Zz4=";

export function FeaturedCatalog({ products }: { products: Product[] }) {
  return (
    <section className="container-dala py-20">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-serif text-[40px] leading-[1.05]">Избранный каталог</h2>
        <Link href="/catalog" className="text-xs uppercase tracking-[0.15em]">
          Весь каталог →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <article key={product.id}>
            <Link href={`/catalog/${product.slug}`} className="block">
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-surface-mid)]">
                <Image
                  src={product.images[0] ?? "/placeholder-product.svg"}
                  alt={product.name}
                  fill
                  placeholder="blur"
                  blurDataURL={BLUR_DATA}
                  className="object-cover transition-transform duration-[400ms] ease-out hover:scale-[1.04]"
                />
                {product.new ? (
                  <span className="absolute left-2 top-2 rounded-[4px] bg-[#2C2218] px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-[#FAF7F2]">
                    Новинка
                  </span>
                ) : null}
              </div>
            </Link>
            <div className="pt-3">
              <h3 className="text-[14px] font-medium">{product.name}</h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-[var(--color-gold)]">{product.category}</p>
              <p className="mt-2 text-[14px] font-medium">{product.price.toLocaleString("ru-RU")} KZT</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
