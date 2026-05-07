"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

const CATEGORY_OPTIONS = ["KAMZOL", "CHAPAN", "DRESS", "ACCESSORIES", "HEADWEAR"];
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  material: string;
  description: string;
  sizes: string[];
  images: string[];
  fittingImage?: string;
  is_new: boolean;
  new: boolean;
};

const emptyForm = {
  name: "",
  category: "KAMZOL",
  price: 0,
  material: "",
  description: "",
  sizes: ["M"],
  images: [] as string[],
  fittingImage: "",
  is_new: false,
  new: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const fetchProducts = async () => {
    const response = await fetch("/api/products?includeHidden=true");
    const data = await response.json();
    setProducts(data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

  const saveProduct = async () => {
    const method = isEditing ? "PUT" : "POST";
    const endpoint = isEditing ? `/api/products/${editingId}` : "/api/products";
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setMessage({ type: "error", text: "Error: product was not saved." });
      return;
    }
    setEditingId(null);
    setForm(emptyForm);
    await fetchProducts();
    setMessage({ type: "success", text: isEditing ? "Success: product updated." : "Success: product created." });
  };

  const removeProduct = async (id: string) => {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage({ type: "error", text: "Error: product was not deleted." });
      return;
    }
    await fetchProducts();
    setMessage({ type: "success", text: "Success: product deleted." });
  };

  const uploadImage = async (file: File) => {
    const body = new FormData();
    body.append("file", file);
    body.append("folder", "products");
    body.append("filePrefix", editingId ?? "new");
    const response = await fetch("/api/upload", { method: "POST", body });
    const data = await response.json();
    if (data.url) {
      setForm((prev) => ({ ...prev, images: [...prev.images, data.url].slice(0, 5) }));
    } else {
      setMessage({ type: "error", text: "Error: image upload failed." });
    }
  };

  return (
    <section>
      <h1 className="font-serif text-5xl">Products</h1>
      {message ? (
        <p className={`mt-4 text-sm ${message.type === "success" ? "text-emerald-700" : "text-red-600"}`}>
          {message.text}
        </p>
      ) : null}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="border">
          <div className="hidden grid-cols-[60px_1fr_120px_120px_120px] border-b px-4 py-3 text-xs uppercase tracking-[0.12em] md:grid">
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
          </div>
          {products.map((product) => (
            <button
              key={product.id}
              className="grid w-full grid-cols-[60px_1fr] gap-x-3 gap-y-1 border-b px-4 py-3 text-left text-sm last:border-b-0 hover:bg-zinc-50 md:grid-cols-[60px_1fr_120px_120px_120px] md:items-center"
              onClick={() => {
                setEditingId(product.id);
                setForm({
                  name: product.name,
                  category: product.category,
                  price: product.price,
                  material: product.material,
                  description: product.description,
                  sizes: product.sizes,
                  images: product.images,
                  fittingImage: product.fittingImage ?? "",
                  is_new: Boolean(product.is_new ?? product.new),
                  new: Boolean(product.new),
                });
              }}
            >
              <div className="relative h-[60px] w-12 overflow-hidden bg-zinc-100">
                <Image src={product.images[0] ?? "/placeholder-product.svg"} alt="" fill className="object-cover" />
              </div>
              <span className="font-medium">{product.name}</span>
              <span className="text-xs text-zinc-600 md:text-sm md:text-black">{product.category}</span>
              <span className="text-xs md:text-sm">{product.price.toLocaleString("ru-RU")} ₸</span>
              <span className="text-xs md:text-sm">{product.is_new || product.new ? "New" : "Standard"}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4 border p-4">
          <h2 className="font-serif text-3xl">{isEditing ? "Edit product" : "Add product"}</h2>
          <input
            placeholder="Name"
            className="w-full border px-3 py-2"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <select
            className="w-full border px-3 py-2"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Price"
            className="w-full border px-3 py-2"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
          />
          <input
            placeholder="Material"
            className="w-full border px-3 py-2"
            value={form.material}
            onChange={(e) => setForm((prev) => ({ ...prev, material: e.target.value }))}
          />
          <textarea
            rows={4}
            placeholder="Description"
            className="w-full border px-3 py-2"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    sizes: prev.sizes.includes(size)
                      ? prev.sizes.filter((item) => item !== size)
                      : [...prev.sizes, size],
                  }))
                }
                className={`border px-2 py-1 text-xs ${form.sizes.includes(size) ? "bg-black text-white" : ""}`}
              >
                {size}
              </button>
            ))}
          </div>

          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
              }}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {form.images.map((src) => (
                <div key={src} className="relative">
                  <img src={src} className="h-[60px] w-12 object-cover" alt="" />
                  <button
                    className="absolute -right-2 -top-2 rounded-full bg-black px-1 text-[10px] text-white"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, images: prev.images.filter((item) => item !== src) }))
                    }
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-zinc-600">Fitting Image (PNG)</label>
            <input
              type="file"
              accept="image/png"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const body = new FormData();
                body.append("file", file);
                body.append("folder", "products");
                body.append("filePrefix", `fitting-${editingId ?? "new"}`);
                const response = await fetch("/api/upload", { method: "POST", body });
                const data = await response.json();
                if (data.url) {
                  setForm((prev) => ({ ...prev, fittingImage: data.url }));
                } else {
                  setMessage({ type: "error", text: "Error: fitting image upload failed." });
                }
              }}
            />
            {form.fittingImage ? (
              <div className="mt-2 flex items-center gap-3">
                <img src={form.fittingImage} alt="" className="h-[60px] w-12 object-contain" />
                <button
                  type="button"
                  className="text-xs underline"
                  onClick={() => setForm((prev) => ({ ...prev, fittingImage: "" }))}
                >
                  Remove fitting image
                </button>
              </div>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_new}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, is_new: e.target.checked, new: e.target.checked }))
              }
            />
            New Collection Badge
          </label>

          <div className="flex gap-2">
            <button className="bg-black px-4 py-2 text-sm text-white" onClick={saveProduct}>
              {isEditing ? "Update" : "Create"}
            </button>
            {isEditing ? (
              <button
                className="border px-4 py-2 text-sm"
                onClick={async () => {
                  if (!editingId) return;
                  await removeProduct(editingId);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
