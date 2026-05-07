"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQty } = useCartStore();
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP ?? "+77XXXXXXXXX";
  const cleanPhone = whatsapp.replace(/[^\d]/g, "");

  const orderLines = items.map(
    (item) => `- ${item.name}, размер ${item.size} — ${(item.price * item.quantity).toLocaleString("ru-RU")} ₸`,
  );
  const orderMessage = `Здравствуйте! Хочу оформить заказ:\n${orderLines.join("\n")}\nИтого: ${total.toLocaleString("ru-RU")} ₸\nПрошу связаться со мной.`;
  const managerHref = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Здравствуйте! Прошу связаться со мной по заказу.")}`;

  const handleWhatsAppOrder = async () => {
    if (isSubmittingOrder || items.length === 0) return;
    setIsSubmittingOrder(true);

    const payload = {
      customer_name: "Website customer",
      customer_phone: cleanPhone,
      items,
      total_price: total,
      message: orderMessage,
    };

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Keep checkout flow alive even if DB save fails.
    } finally {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderMessage)}`, "_blank", "noopener,noreferrer");
      setIsSubmittingOrder(false);
    }
  };

  return (
    <section className="bg-[#FFF8F1]">
      <div className="container-dala section-space mx-auto max-w-[900px]">
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <h1 className="font-serif text-5xl">Корзина пуста</h1>
            <Link href="/catalog" className="mt-6 inline-block text-sm uppercase tracking-[0.12em] underline">
              Перейти в каталог
            </Link>
          </div>
        ) : null}

        <div className={`grid gap-10 ${items.length ? "lg:grid-cols-[1.5fr_1fr]" : ""}`}>
          {items.length ? (
            <div>
              <p className="gold-label">Ваша корзина</p>
              <AnimatePresence>
                {items.map((item) => (
                  <motion.article
                    key={`${item.productId}-${item.size}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="grid grid-cols-[80px_1fr_auto] gap-4 border-b border-[var(--divider)] py-6"
                  >
                    <div className="relative h-[100px] w-20 bg-[var(--color-surface-mid)]">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h2 className="font-serif text-3xl">{item.name}</h2>
                      <p className="text-sm text-[var(--color-on-surface-2)]">Размер: {item.size}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <button className="h-8 w-8 border" onClick={() => updateQty(item.productId, item.size, item.quantity - 1)}>
                          −
                        </button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button className="h-8 w-8 border" onClick={() => updateQty(item.productId, item.size, item.quantity + 1)}>
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeItem(item.productId, item.size)} className="text-[var(--color-on-surface-2)]">
                        <X size={16} />
                      </button>
                      <p className="text-3xl">{(item.price * item.quantity).toLocaleString("ru-RU")} ₸</p>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          ) : null}

          {items.length ? (
            <aside className="h-fit border border-[var(--divider)] p-8">
              <p className="gold-label">ВАШ ЗАКАЗ</p>
              <div className="mt-5 space-y-2">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex items-center justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toLocaleString("ru-RU")} ₸</span>
                  </div>
                ))}
              </div>
              <div className="my-5 h-px bg-[var(--divider)]" />
              <div className="flex items-center justify-between font-serif text-4xl">
                <span>ИТОГО</span>
                <span>{total.toLocaleString("ru-RU")} ₸</span>
              </div>

              <input placeholder="Промокод" className="mt-6 w-full border-b border-black bg-transparent py-2 text-sm outline-none" />
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                disabled={isSubmittingOrder}
                className="mt-6 block w-full bg-black px-5 py-4 text-center text-sm uppercase tracking-[0.1em] text-white"
              >
                {isSubmittingOrder ? "СОХРАНЯЕМ ЗАКАЗ..." : "ОФОРМИТЬ ЧЕРЕЗ WHATSAPP"}
              </button>
              <a
                href={managerHref}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block w-full border border-black px-5 py-4 text-center text-sm uppercase tracking-[0.1em]"
              >
                СВЯЗАТЬСЯ С МЕНЕДЖЕРОМ
              </a>

              <p className="mt-5 text-sm text-[var(--color-on-surface-2)]">
                <span className="text-[var(--color-gold)]">• </span>
                Менеджер свяжется с вами в течение 15 минут
                <br />
                Работаем ежедневно 9:00-21:00
              </p>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
