"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { Product } from "@/lib/types";
import { FittingRoom } from "@/components/fitting/FittingRoom";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const product = useMemo(() => products.find((item) => item.slug === params.slug), [products, params.slug]);
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  if (!product) return <section className="container-dala section-space">Product not found.</section>;

  const size = selectedSize ?? product.sizes[0] ?? "M";
  const activeImage = selectedImage ?? product.images[0] ?? "";

  const fittingCandidates = products.filter(
    (item) => item.category === product.category && item.fittingImage,
  );
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP ?? "+77XXXXXXXXX";
  const cleanPhone = whatsapp.replace(/[^\d]/g, "");
  const managerHref = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Здравствуйте! Интересует модель "${product.name}". Прошу связаться со мной.`)}`;

  return (
    <section className="container-dala section-space space-y-12">
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative aspect-[3/4] bg-[var(--color-surface-mid)]">
          <Image src={activeImage || product.images[0]} alt={product.name} fill className="object-cover" />
        </div>
        <div>
          <p className="gold-label">{product.category}</p>
          <h1 className="mt-2 font-serif text-4xl">{product.name}</h1>
          <p className="mt-4 text-xl">{product.price.toLocaleString("ru-RU")} ₸</p>
          <p className="mt-6 border-t border-[var(--divider)] pt-6 text-[var(--color-on-surface-2)]">
            {product.description}
          </p>
          <div className="mt-6 flex gap-2">
            {product.sizes.map((item) => (
              <button
                key={item}
                className={`border px-3 py-2 text-sm ${size === item ? "bg-black text-white" : "border-black"}`}
                onClick={() => setSelectedSize(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)}>+</button>
          </div>
          <button
            className="btn-primary mt-8 w-full px-8 py-4 text-sm uppercase tracking-[0.1em]"
            onClick={() => {
              addItem({
                productId: product.id,
                name: product.name,
                image: product.images[0],
                size,
                price: product.price,
                quantity: qty,
              });
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2000);
            }}
          >
            ДОБАВИТЬ В КОРЗИНУ
          </button>
          <Link
            href={managerHref}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block w-full border border-[#A08060] px-8 py-4 text-center text-sm uppercase tracking-[0.1em] text-[#A08060]"
          >
            СВЯЗАТЬСЯ С МЕНЕДЖЕРОМ
          </Link>
        </div>
      </div>

      {product.images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {product.images.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setSelectedImage(src)}
              className={`relative h-20 w-16 flex-none overflow-hidden border ${
                src === activeImage ? "border-black" : "border-black/20"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <FittingRoom title="Примерка образа" products={fittingCandidates} initialSelectedIds={[product.id]} />

      <AnimatePresence>
        {showToast ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black px-6 py-3 text-sm text-white"
          >
            Добавлено в корзину ✓
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
