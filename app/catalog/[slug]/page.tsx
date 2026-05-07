"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/lib/types";
import { FittingRoom } from "@/components/fitting/FittingRoom";
import { ProductCompactShopModal, ProductGalleryShopModal } from "@/components/product/ProductShopModals";
import { normalizeProducts } from "@/lib/safe-products";

function slugFromRouteParam(slug: string | string[] | undefined): string {
  const raw = Array.isArray(slug) ? slug[0] : slug;
  if (typeof raw !== "string" || raw.length === 0) return "";
  try {
    return decodeURIComponent(raw).normalize("NFC");
  } catch {
    return raw.normalize("NFC");
  }
}

export default function ProductPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const routeSlug = useMemo(() => slugFromRouteParam(params.slug), [params.slug]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "done">("loading");
  const product = useMemo(
    () =>
      products.find((item) => item.slug.normalize("NFC") === routeSlug),
    [products, routeSlug],
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [compactShopOpen, setCompactShopOpen] = useState(false);
  const [galleryShopOpen, setGalleryShopOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(normalizeProducts(data)))
      .catch(() => setProducts([]))
      .finally(() => setLoadState("done"));
  }, []);

  if (loadState === "loading") {
    return (
      <section className="container-dala section-space text-[var(--color-on-surface-2)]">Загрузка…</section>
    );
  }

  if (!product) {
    return <section className="container-dala section-space">Товар не найден.</section>;
  }

  const size = selectedSize ?? product.sizes[0] ?? "M";
  const activeImage = selectedImage ?? product.images[0] ?? "";

  const toastAfterAdd = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const fittingCandidates = products.filter(
    (item) => item.category === product.category && item.fittingImage,
  );
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP ?? "+77XXXXXXXXX";
  const cleanPhone = whatsapp.replace(/[^\d]/g, "");
  const managerHref = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Здравствуйте! Интересует модель "${product.name}". Прошу связаться со мной.`)}`;

  return (
    <section className="container-dala section-space space-y-12">
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <button
          type="button"
          className="relative aspect-[3/4] w-full cursor-pointer bg-[var(--color-surface-mid)] text-left"
          onClick={() => setCompactShopOpen(true)}
          aria-label="Быстрый заказ: размер и в корзину"
        >
          <Image src={activeImage || product.images[0]} alt={product.name} fill className="object-cover" />
        </button>
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
            type="button"
            onClick={() => setGalleryShopOpen(true)}
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

      <ProductCompactShopModal
        product={product}
        open={compactShopOpen}
        onClose={() => setCompactShopOpen(false)}
        initialSize={size}
        initialQty={qty}
        onAdded={toastAfterAdd}
      />
      <ProductGalleryShopModal
        product={product}
        open={galleryShopOpen}
        onClose={() => setGalleryShopOpen(false)}
        initialSize={size}
        initialQty={qty}
        onAdded={toastAfterAdd}
      />

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
