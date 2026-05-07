import type { Product } from "@/lib/types";

/** Дефолтный ряд размеров для каталога. */
export const STANDARD_PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const ORDER: Record<string, number> = Object.fromEntries(
  STANDARD_PRODUCT_SIZES.map((s, i) => [s, i]),
);

/**
 * Для модалок заказа: полный стандартный ряд + кастомные размеры из товара.
 */
export function sizesForShopUi(product: Product): string[] {
  const fromDb = product.sizes.map((s) => String(s).trim()).filter(Boolean);
  const merged = new Set<string>([...STANDARD_PRODUCT_SIZES, ...fromDb]);
  return [...merged].sort((a, b) => {
    const oa = ORDER[a];
    const ob = ORDER[b];
    if (oa !== undefined && ob !== undefined) return oa - ob;
    if (oa !== undefined) return -1;
    if (ob !== undefined) return 1;
    return a.localeCompare(b, "ru");
  });
}
