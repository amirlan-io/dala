"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  total_price: number;
  items: { name: string; size: string; quantity: number; price: number }[];
  message?: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const response = await fetch("/api/orders");
    const data = await response.json();
    const normalized = Array.isArray(data)
      ? data.map((order) => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : [],
        }))
      : [];
    setOrders(normalized);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  return (
    <section>
      <h1 className="font-serif text-5xl">Orders</h1>
      <div className="mt-6 border">
        <div className="hidden grid-cols-6 border-b px-4 py-3 text-xs uppercase tracking-[0.12em] md:grid">
          <span>Date</span>
          <span>Name</span>
          <span>Phone</span>
          <span>Total</span>
          <span>Message</span>
          <span>Actions</span>
        </div>
        {orders.map((order) => (
          <div key={order.id} className="border-b last:border-b-0">
            <div className="grid gap-2 px-4 py-3 text-sm md:grid-cols-6 md:items-center">
              <span className="text-xs text-zinc-500 md:text-sm md:text-black">{new Date(order.created_at).toLocaleDateString("ru-RU")}</span>
              <span className="font-medium">{order.customer_name}</span>
              <span className="text-xs md:text-sm">{order.customer_phone}</span>
              <span>{order.total_price.toLocaleString("ru-RU")} ₸</span>
              <span className="truncate text-xs text-zinc-600">{order.message || "—"}</span>
              <div className="flex gap-3">
                <button className="underline" onClick={() => setExpandedId((p) => (p === order.id ? null : order.id))}>
                  Details
                </button>
                <a
                  href={`https://wa.me/${order.customer_phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent("Здравствуйте! Пишем по вашему заказу DALA.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  WhatsApp
                </a>
              </div>
            </div>
            {expandedId === order.id ? (
              <div className="bg-zinc-50 px-4 py-3 text-sm">
                {order.items.map((item, index) => (
                  <p key={`${item.name}-${index}`}>
                    {item.name}, {item.size} × {item.quantity} — {(item.price * item.quantity).toLocaleString("ru-RU")} ₸
                  </p>
                ))}
                {order.message ? <p className="mt-2 text-zinc-600">Комментарий: {order.message}</p> : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
