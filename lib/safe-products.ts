import { Product } from "@/lib/types";

const ALLOWED_CATEGORIES = new Set<Product["category"]>([
  "KAMZOL",
  "CHAPAN",
  "DRESS",
  "ACCESSORIES",
  "HEADWEAR",
  "ВЕРХНЯЯ ОДЕЖДА",
]);

export function normalizeProducts(payload: unknown): Product[] {
  if (!Array.isArray(payload)) return [];

  return payload.map((item, index) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};

    const imageList = Array.isArray(record.images)
      ? record.images.filter((img): img is string => typeof img === "string" && img.length > 0)
      : [];
    const sizeList = Array.isArray(record.sizes)
      ? record.sizes.filter((size): size is string => typeof size === "string" && size.length > 0)
      : [];
    const category = typeof record.category === "string" && ALLOWED_CATEGORIES.has(record.category as Product["category"])
      ? (record.category as Product["category"])
      : "ACCESSORIES";

    return {
      id: typeof record.id === "string" && record.id ? record.id : `fallback-${index}`,
      slug: typeof record.slug === "string" && record.slug ? record.slug : `product-${index}`,
      name: typeof record.name === "string" && record.name ? record.name : "Product",
      category,
      price: typeof record.price === "number" && Number.isFinite(record.price) ? record.price : 0,
      currency: "KZT",
      material: typeof record.material === "string" && record.material ? record.material : "Premium Textile",
      description: typeof record.description === "string" ? record.description : "",
      sizes: sizeList.length ? sizeList : ["M"],
      images: imageList.length ? imageList : ["/placeholder-product.svg"],
      fittingImage: typeof record.fittingImage === "string" ? record.fittingImage : undefined,
      featured: Boolean(record.featured),
      new: Boolean(record.new),
    };
  });
}
