"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  total: number;
  status: "new" | "in_progress" | "completed" | "cancelled";
  items: { name: string; size: string; quantity: number; price: number }[];
};

const STATUS_LABELS = {
  new: "🟡 Новый",
  in_progress: "🔵 В работе",
  completed: "🟢 Выполнен",
  cancelled: "🔴 Отменён",
} as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const response = await fetch("/api/orders");
    const data = await response.json();
    setOrders(data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: Order["status"]) => {
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchOrders();
  };

  return (
    <section>
      <h1 className="font-serif text-5xl">Orders</h1>
      <div className="mt-6 border">
        <div className="hidden grid-cols-6 border-b px-4 py-3 text-xs uppercase tracking-[0.12em] md:grid">
          <span>Date</span>
          <span>Name</span>
          <span>Phone</span>
          <span>Total</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {orders.map((order) => (
          <div key={order.id} className="border-b last:border-b-0">
            <div className="grid gap-2 px-4 py-3 text-sm md:grid-cols-6 md:items-center">
              <span className="text-xs text-zinc-500 md:text-sm md:text-black">{new Date(order.date).toLocaleDateString("ru-RU")}</span>
              <span className="font-medium">{order.customerName}</span>
              <span className="text-xs md:text-sm">{order.phone}</span>
              <span>{order.total.toLocaleString("ru-RU")} ₸</span>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value as Order["status"])}
                className="border px-2 py-1 text-xs md:text-xs"
              >
                <option value="new">{STATUS_LABELS.new}</option>
                <option value="in_progress">{STATUS_LABELS.in_progress}</option>
                <option value="completed">{STATUS_LABELS.completed}</option>
                <option value="cancelled">{STATUS_LABELS.cancelled}</option>
              </select>
              <div className="flex gap-3">
                <button className="underline" onClick={() => setExpandedId((p) => (p === order.id ? null : order.id))}>
                  Details
                </button>
                <a
                  href={`https://wa.me/${order.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent("Здравствуйте! Пишем по вашему заказу DALA.")}`}
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
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
