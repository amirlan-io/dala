"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/types";

export function galleryPair(product: Product): [string, string] {
  const a = product.images[0] ?? "/placeholder-product.svg";
  const b = product.images[1] ?? product.fittingImage ?? a;
  return [a, b];
}

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

type ModalBase = {
  product: Product;
  open: boolean;
  onClose: () => void;
  /** When opening from PDP, sync with already selected size/qty */
  initialSize?: string;
  initialQty?: number;
  onAdded?: () => void;
};

/** Small sheet: size, qty, add — для клика по фото */
export function ProductCompactShopModal({
  product,
  open,
  onClose,
  initialSize,
  initialQty,
  onAdded,
}: ModalBase) {
  useBodyScrollLock(open);
  const addItem = useCartStore((s) => s.addItem);
  const [size, setSize] = useState(product.sizes[0] ?? "M");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (open) {
      setSize(initialSize ?? product.sizes[0] ?? "M");
      setQty(initialQty ?? 1);
    }
  }, [open, initialSize, initialQty, product]);

  if (!open) return null;

  const mainImg = product.images[0] ?? "/placeholder-product.svg";

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 p-0 md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compact-shop-title"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl md:max-h-[90vh] md:rounded-2xl md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="compact-shop-title" className="font-serif text-xl md:text-2xl">
            {product.name}
          </h2>
          <button
            type="button"
            className="rounded-full border border-zinc-300 p-2 text-zinc-600 transition hover:bg-zinc-100"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative mx-auto mb-4 aspect-[3/4] w-full max-w-[200px] overflow-hidden rounded-lg bg-[#EFE7DD]">
          <Image src={mainImg} alt="" fill className="object-cover" sizes="200px" />
        </div>

        <p className="mb-4 text-lg">{product.price.toLocaleString("ru-RU")} ₸</p>

        <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-zinc-500">Размер</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`rounded-full border px-4 py-2 text-sm ${
                size === s ? "border-black bg-black text-white" : "border-zinc-300 text-zinc-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-zinc-500">Количество</p>
        <div className="mb-6 flex items-center gap-4">
          <button type="button" className="rounded-full border border-zinc-300 px-3 py-1" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span className="min-w-[2ch] text-center">{qty}</span>
          <button type="button" className="rounded-full border border-zinc-300 px-3 py-1" onClick={() => setQty((q) => q + 1)}>
            +
          </button>
        </div>

        <button
          type="button"
          className="btn-primary w-full px-6 py-4 text-sm uppercase tracking-[0.1em]"
          onClick={() => {
            addItem({
              productId: product.id,
              name: product.name,
              image: product.images[0],
              price: product.price,
              quantity: qty,
              size,
            });
            onAdded?.();
            onClose();
          }}
        >
          Добавить в корзину
        </button>
      </div>
    </div>
  );
}

/** Две фотографии + размер и корзина — для кнопки «В корзину» на сетке */
export function ProductGalleryShopModal({
  product,
  open,
  onClose,
  initialSize,
  initialQty,
  onAdded,
}: ModalBase) {
  useBodyScrollLock(open);
  const addItem = useCartStore((s) => s.addItem);
  const [size, setSize] = useState(product.sizes[0] ?? "M");
  const [qty, setQty] = useState(1);
  const [imgA, imgB] = galleryPair(product);

  useEffect(() => {
    if (open) {
      setSize(initialSize ?? product.sizes[0] ?? "M");
      setQty(initialQty ?? 1);
    }
  }, [open, initialSize, initialQty, product]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 p-0 md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-shop-title"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl md:max-h-[90vh] md:rounded-2xl md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="gallery-shop-title" className="font-serif text-xl md:text-2xl">
            {product.name}
          </h2>
          <button
            type="button"
            className="rounded-full border border-zinc-300 p-2 text-zinc-600 transition hover:bg-zinc-100"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 md:gap-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#EFE7DD]">
            <Image src={imgA} alt="" fill className="object-cover" sizes="(max-width:768px) 45vw, 240px" />
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#EFE7DD]">
            <Image src={imgB} alt="" fill className="object-cover" sizes="(max-width:768px) 45vw, 240px" />
          </div>
        </div>

        <p className="mb-4 text-lg">{product.price.toLocaleString("ru-RU")} ₸</p>

        <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-zinc-500">Размер</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`rounded-full border px-4 py-2 text-sm ${
                size === s ? "border-black bg-black text-white" : "border-zinc-300 text-zinc-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-zinc-500">Количество</p>
        <div className="mb-6 flex items-center gap-4">
          <button type="button" className="rounded-full border border-zinc-300 px-3 py-1" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span className="min-w-[2ch] text-center">{qty}</span>
          <button type="button" className="rounded-full border border-zinc-300 px-3 py-1" onClick={() => setQty((q) => q + 1)}>
            +
          </button>
        </div>

        <button
          type="button"
          className="btn-primary w-full px-6 py-4 text-sm uppercase tracking-[0.1em]"
          onClick={() => {
            addItem({
              productId: product.id,
              name: product.name,
              image: product.images[0],
              price: product.price,
              quantity: qty,
              size,
            });
            onAdded?.();
            onClose();
          }}
        >
          Добавить в корзину
        </button>
      </div>
    </div>
  );
}
