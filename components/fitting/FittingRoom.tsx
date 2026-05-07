"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { Product } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";

type FittingRoomProps = {
  title?: string;
  products: Product[];
  initialSelectedIds?: string[];
};

export function FittingRoom({ title = "Примерка", products, initialSelectedIds = [] }: FittingRoomProps) {
  const addItem = useCartStore((s) => s.addItem);
  const fittingItems = useMemo(
    () => products.filter((item) => item.fittingImage),
    [products],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  const selectedItems = useMemo(
    () => fittingItems.filter((item) => selectedIds.includes(item.id)),
    [fittingItems, selectedIds],
  );

  const playMagic = () => {
    try {
      const context = new window.AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 620;
      gain.gain.value = 0.02;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.12);
    } catch {
      // Ignore if browser blocks autoplay audio.
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      playMagic();
      return next;
    });
  };

  const buyLook = () => {
    selectedItems.forEach((item) => {
      addItem({
        productId: item.id,
        name: item.name,
        image: item.images[0] ?? "/placeholder-product.svg",
        price: item.price,
        quantity: 1,
        size: item.sizes[0] ?? "M",
      });
    });
  };

  if (fittingItems.length === 0) return null;

  return (
    <section className="rounded-2xl bg-[#F4EEE6] p-4 md:p-6">
      <h3 className="font-serif text-3xl">{title}</h3>
      <p className="mt-2 text-sm text-[#6E655A]">Выберите вещи и посмотрите образ на манекене.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.1fr]">
        <div className="relative h-[46vh] min-h-[340px] overflow-hidden rounded-xl bg-[#EDE3D7] md:h-[520px]">
          <Image src="/fitting/base-mannequin.svg" alt="Base mannequin" fill className="object-contain p-3" />
          <AnimatePresence>
            {selectedItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 10 }}
              >
                <Image src={item.fittingImage!} alt={item.name} fill className="object-contain p-3" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex flex-col">
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:pb-0">
            {fittingItems.map((item) => {
              const active = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`w-[44vw] min-w-[44vw] rounded-xl border bg-white p-2 text-left transition md:w-auto md:min-w-0 ${
                    active ? "border-black ring-1 ring-black" : "border-[#D9CCBB]"
                  }`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#EFE7DD]">
                    <Image src={item.images[0] ?? "/placeholder-product.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <p className="mt-2 font-serif text-sm">{item.name}</p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={buyLook}
            disabled={selectedItems.length === 0}
            className="mt-4 rounded-full bg-black px-6 py-3 text-xs uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Купить этот образ
          </button>
        </div>
      </div>
    </section>
  );
}
