"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  productId: string;
  name: string;
  image: string;
  size: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  lastAddedAt: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, quantity: number) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      lastAddedAt: 0,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (entry) => entry.productId === item.productId && entry.size === item.size,
          );
          if (existing) {
            return {
              lastAddedAt: Date.now(),
              items: state.items.map((entry) =>
                entry.productId === item.productId && entry.size === item.size
                  ? { ...entry, quantity: entry.quantity + item.quantity }
                  : entry,
              ),
            };
          }
          return { items: [...state.items, item], lastAddedAt: Date.now() };
        }),
      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.size === size),
          ),
        })),
      updateQty: (productId, size, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        })),
    }),
    { name: "dala-cart" },
  ),
);
