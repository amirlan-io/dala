"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { Product } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";
import { normalizeProducts } from "@/lib/safe-products";

type CategoryValue = "ALL" | "KAMZOL" | "CHAPAN" | "DRESS" | "ACCESSORIES" | "HEADWEAR" | "ВЕРХНЯЯ ОДЕЖДА";
type SortValue = "NEW" | "PRICE";

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fallback-1",
    slug: "dala-fallback-1",
    name: "DALA Item",
    category: "KAMZOL",
    price: 180000,
    currency: "KZT",
    material: "Premium textile",
    description: "Демо товар для безопасного отображения каталога.",
    sizes: ["M"],
    images: ["/placeholder-product.svg"],
    featured: false,
    new: true,
  },
];

function ProductCardCatalog({
  product,
  isAdmin,
  onEdit,
  onDelete,
}: {
  product: Product;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSize] = useState(product.sizes[0] ?? "M");

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
      onClick={() => router.push(`/catalog/${product.slug}`)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#EFE7DD]">
          {isAdmin ? (
            <div className="absolute right-2 top-2 z-20 md:right-3 md:top-3">
              <button
                type="button"
                className="rounded-full bg-white/95 p-2 text-zinc-700 shadow transition hover:bg-white"
                aria-label="Действия с товаром"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setMenuOpen((prev) => !prev);
                }}
              >
                <MoreHorizontal size={16} />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 min-w-[150px] rounded-lg border bg-white p-1 text-xs shadow-xl md:right-0">
                  <button
                    type="button"
                    className="block w-full rounded px-3 py-2 text-left uppercase tracking-[0.12em] hover:bg-zinc-100"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setMenuOpen(false);
                      onEdit(product);
                    }}
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    className="block w-full rounded px-3 py-2 text-left uppercase tracking-[0.12em] text-red-600 hover:bg-red-50"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setMenuOpen(false);
                      onDelete(product.id);
                    }}
                  >
                    Удалить
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          {!imageError ? (
            <Image
              src={product.images[0]}
              alt={`${product.name} DALA`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              onError={() => setImageError(true)}
            />
        ) : (
          <div className="h-full w-full bg-[#EFE7DD]" />
        )}

          <div className="absolute bottom-4 left-4 right-4 hidden opacity-0 transition duration-300 group-hover:opacity-100 md:block">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                addItem({
                  productId: product.id,
                  name: product.name,
                  image: product.images[0],
                  price: product.price,
                  quantity: 1,
                  size: selectedSize,
                });
              }}
              className="w-full border border-white bg-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-white backdrop-blur"
            >
              В КОРЗИНУ
            </button>
          </div>
      </div>
      <div className="py-3 text-left">
        <h3 className="font-serif text-[16px] leading-tight">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-[11px] text-[var(--color-on-surface-2)]">{product.description}</p>
        <p className="mt-2 text-[15px]">{product.price.toLocaleString("ru-RU")} ₸</p>
      </div>
    </motion.article>
  );
}

export function CatalogPageContent({ initialIsAdmin = false }: { initialIsAdmin?: boolean }) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryValue>("ALL");
  const [sort, setSort] = useState<SortValue>("NEW");
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createMessage, setCreateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) throw new Error("products request failed");
        const data = await response.json();
        const normalized = normalizeProducts(data);
        setProducts(normalized.length ? normalized : FALLBACK_PRODUCTS);
      } catch {
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => setIsAdmin(Boolean(data?.isAdmin)))
      .catch(() => setIsAdmin(false));
  }, []);

  const filteredProducts = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    const byText = products.filter((product) => {
      if (!loweredQuery) return true;
      return (
        product.name.toLowerCase().includes(loweredQuery) ||
        product.description.toLowerCase().includes(loweredQuery)
      );
    });

    const byCategory =
      category === "ALL" ? byText : byText.filter((product) => product.category === category);

    return [...byCategory].sort((a, b) => {
      if (sort === "PRICE") return a.price - b.price;
      return Number(b.new) - Number(a.new);
    });
  }, [category, query, sort, products]);

  const resetFilters = () => {
    setQuery("");
    setCategory("ALL");
    setSort("NEW");
  };

  const canManageCatalog = false;
  const productKey = `${query}|${category}|${sort}`;
  const categories = [
    { value: "ALL" as CategoryValue, label: t("catalogAll").toUpperCase() },
    { value: "KAMZOL" as CategoryValue, label: t("catalogKamzol").toUpperCase() },
    { value: "CHAPAN" as CategoryValue, label: t("catalogChapan").toUpperCase() },
    { value: "DRESS" as CategoryValue, label: t("catalogDress").toUpperCase() },
    { value: "ACCESSORIES" as CategoryValue, label: t("catalogAccessories").toUpperCase() },
    { value: "HEADWEAR" as CategoryValue, label: t("catalogHeadwear").toUpperCase() },
    { value: "ВЕРХНЯЯ ОДЕЖДА" as CategoryValue, label: "ВЕРХНЯЯ ОДЕЖДА" },
  ];

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setCreateForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.images[0] ?? "",
    });
    setCreateMessage(null);
    setIsCreateOpen(true);
  };

  const deleteProduct = async (id: string) => {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    const updated = await fetch("/api/products").then((res) => res.json());
    setProducts(normalizeProducts(updated));
  };

  return (
    <section className="bg-[#FFF8F1]">
      <div className="container-dala max-w-[1440px] pb-24 pt-10">
        <div className="mb-8">
          <p className="gold-label">{t("catalogHeritageLabel").toUpperCase()}</p>
          <h1 className="mt-3 font-serif text-5xl md:text-[48px]">{t("catalogTitle")}</h1>
          <p className="mt-2 text-sm text-[var(--color-on-surface-2)]">
            {t("catalogFound")} {filteredProducts.length} {t("catalogItems")}
          </p>
          {canManageCatalog ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setCreateForm({ name: "", description: "", price: 0, image: "" });
                  setCreateMessage(null);
                  setIsCreateOpen(true);
                }}
                className="inline-flex max-w-full items-center justify-center self-start whitespace-nowrap rounded-full bg-black px-5 py-3 text-xs uppercase tracking-[0.16em] text-white transition hover:bg-[#222] md:px-6 md:py-2.5"
              >
                {t("catalogCreateProduct")}
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-4 border-b border-[var(--color-on-surface)] pb-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("catalogSearchPlaceholder")}
            className="w-full bg-transparent py-[12px] text-sm outline-none placeholder:text-[13px] placeholder:text-[var(--color-on-surface-2)]"
          />
          <Search size={18} />
        </div>

        <div className="relative mb-10 mt-3 border-y border-[rgba(30,27,21,0.15)] py-4 md:mb-12 md:py-[14px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative">
              <div className="grid grid-cols-2 gap-2 md:flex md:flex-nowrap md:gap-8 md:overflow-x-auto md:pr-10 md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden">
                {categories.map((item) => {
                  const active = category === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => setCategory(item.value)}
                      className={`relative rounded-full border px-2 py-2 text-center text-[11px] uppercase tracking-[0.08em] transition-colors duration-200 md:whitespace-nowrap md:rounded-none md:border-0 md:px-0 md:py-0 md:text-[12px] md:tracking-[0.12em] ${
                        active
                          ? "border-[#1E1B15] text-[#1E1B15] md:border-0"
                          : "border-[#D9D1C5] text-[#888888] hover:text-[#1E1B15] md:border-0"
                      }`}
                    >
                      {item.label}
                      <motion.span
                        className="absolute -bottom-1 left-0 hidden h-px bg-[#C9A96E] md:block"
                        initial={false}
                        animate={{ width: active ? "100%" : "0%" }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-start gap-2 md:justify-end md:gap-6">
              {[
                { value: "NEW" as SortValue, label: t("catalogNew").toUpperCase() },
                { value: "PRICE" as SortValue, label: t("catalogPrice").toUpperCase() },
              ].map((item) => {
                const active = sort === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setSort(item.value)}
                    className={`relative rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.08em] transition-colors duration-200 md:rounded-none md:border-0 md:px-0 md:py-0 md:text-[12px] md:tracking-[0.12em] ${
                      active
                        ? "border-[#1E1B15] text-[#1E1B15] md:border-0"
                        : "border-[#D9D1C5] text-[#888888] hover:text-[#1E1B15] md:border-0"
                    }`}
                  >
                    {item.label}
                    <motion.span
                      className="absolute -bottom-1 left-0 hidden h-px bg-[#C9A96E] md:block"
                      initial={false}
                      animate={{ width: active ? "100%" : "0%" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="animate-pulse">
                  <div className="aspect-[3/4] bg-zinc-200" />
                  <div className="mt-3 h-4 w-2/3 bg-zinc-200" />
                  <div className="mt-2 h-3 w-full bg-zinc-200" />
                  <div className="mt-2 h-4 w-1/3 bg-zinc-200" />
                </div>
              ))}
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="py-24 text-center"
            >
              <p className="font-serif text-3xl">Ничего не найдено</p>
              <p className="mt-3 text-sm text-[var(--color-on-surface-2)]">Попробуйте изменить параметры поиска</p>
              <button onClick={resetFilters} className="mt-4 text-sm underline underline-offset-4">
                Сбросить фильтры
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={productKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductCardCatalog product={product} isAdmin={canManageCatalog} onEdit={openEdit} onDelete={deleteProduct} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {canManageCatalog && isCreateOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-0 md:items-center md:p-4"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl md:h-auto md:max-w-xl md:rounded-2xl md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Admin Quick Create</p>
                <h2 className="mt-1 font-serif text-3xl md:text-4xl">{editingId ? "Редактировать товар" : "Новый товар"}</h2>
              </div>
              <button
                type="button"
                className="rounded-full border p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-black"
                onClick={() => setIsCreateOpen(false)}
                aria-label="Закрыть окно"
              >
                <X size={16} />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!createForm.name.trim() || !createForm.description.trim() || createForm.price <= 0) {
                  setCreateMessage({ type: "error", text: "Заполни название, описание и цену." });
                  return;
                }

                setIsSaving(true);
                setCreateMessage(null);
                const endpoint = editingId ? `/api/products/${editingId}` : "/api/products";
                const response = await fetch(endpoint, {
                  method: editingId ? "PUT" : "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: createForm.name.trim(),
                    description: createForm.description.trim(),
                    price: Number(createForm.price),
                    images: createForm.image ? [createForm.image] : ["/placeholder-product.svg"],
                    category: "KAMZOL",
                    material: "Premium textile",
                    sizes: ["M"],
                    is_new: true,
                    new: true,
                    featured: false,
                  }),
                });

                if (!response.ok) {
                  setCreateMessage({ type: "error", text: "Ошибка сохранения. Попробуй снова." });
                  setIsSaving(false);
                  return;
                }

                setCreateMessage({ type: "success", text: editingId ? "Товар обновлен." : "Товар добавлен." });
                setCreateForm({ name: "", description: "", price: 0, image: "" });
                setEditingId(null);
                await fetch("/api/products")
                  .then((res) => res.json())
                  .then((data) => setProducts(normalizeProducts(data)))
                  .catch(() => setProducts([]));
                setIsSaving(false);
              }}
            >
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-zinc-500">Фото</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-[11px] file:uppercase file:tracking-[0.12em] file:text-white"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const body = new FormData();
                    body.append("file", file);
                    body.append("folder", "products");
                    body.append("filePrefix", "catalog");
                    const response = await fetch("/api/upload", { method: "POST", body });
                    const data = await response.json();
                    if (data.url) {
                      setCreateForm((prev) => ({ ...prev, image: data.url }));
                    } else {
                      setCreateMessage({ type: "error", text: "Не удалось загрузить фото." });
                    }
                  }}
                />
                {createForm.image ? (
                  <div className="mt-3">
                    <img src={createForm.image} alt="" className="h-28 w-24 rounded-md object-cover" />
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-zinc-500">Название</label>
                <input
                  type="text"
                  placeholder="Например: Royal Chapan"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-3 text-sm outline-none focus:border-black"
                  value={createForm.name}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-zinc-500">Цена</label>
                <input
                  type="number"
                  min={0}
                  placeholder="250000"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-3 text-sm outline-none focus:border-black"
                  value={createForm.price || ""}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
                />
                <p className="mt-1 text-xs text-zinc-500">
                  {Number(createForm.price) > 0 ? `${Number(createForm.price).toLocaleString("ru-RU")} ₸` : ""}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.14em] text-zinc-500">Описание</label>
                <textarea
                  rows={4}
                  placeholder="Краткое описание товара..."
                  className="w-full rounded-lg border border-zinc-300 px-3 py-3 text-sm outline-none focus:border-black"
                  value={createForm.description}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>

              {createMessage ? (
                <p className={`text-sm ${createMessage.type === "success" ? "text-emerald-700" : "text-red-600"}`}>
                  {createMessage.text}
                </p>
              ) : null}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-black px-6 py-3 text-xs uppercase tracking-[0.16em] text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Сохранение..." : editingId ? "Сохранить" : "Создать"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingId(null);
                    setCreateForm({ name: "", description: "", price: 0, image: "" });
                  }}
                  className="rounded-full border border-zinc-400 px-6 py-3 text-xs uppercase tracking-[0.16em] text-zinc-700 transition hover:bg-zinc-100"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
