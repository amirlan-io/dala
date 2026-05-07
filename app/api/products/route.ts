import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/json-store";
import { requireAdminSession } from "@/lib/admin-api";
import path from "path";
import { promises as fs } from "fs";
import { sanitizePayload } from "@/lib/sanitize";
import { PRODUCTS as FALLBACK_PRODUCTS } from "@/lib/data";

const PRODUCTS_PATH = "data/products.json";
const PRODUCTS_EXAMPLE_PATH = "data/products.example.json";
type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  [key: string]: unknown;
};

async function loadProducts(): Promise<ProductRecord[]> {
  const stored = await readJsonFile<ProductRecord[]>(PRODUCTS_PATH, []);
  if (stored.length > 0) return stored;

  const example = await readJsonFile<ProductRecord[]>(PRODUCTS_EXAMPLE_PATH, []);
  if (example.length > 0) return example;

  return FALLBACK_PRODUCTS.map((item) => ({ ...item, visible: true }));
}

export async function GET(request: Request) {
  const products = await loadProducts();
  const { searchParams } = new URL(request.url);
  const includeHidden = searchParams.get("includeHidden") === "true";

  if (includeHidden) {
    const unauthorized = await requireAdminSession();
    if (unauthorized) return unauthorized;
    return NextResponse.json(products);
  }

  return NextResponse.json(products.filter((product) => product.visible !== false));
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const payload = sanitizePayload(await request.json());
  const products = await loadProducts();

  const slug = String(payload.name ?? "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  const nextProduct = {
    id: crypto.randomUUID(),
    slug,
    currency: "KZT",
    images: [],
    sizes: [],
    featured: false,
    new: false,
    visible: true,
    ...payload,
  };

  const updated = [nextProduct, ...products];
  await writeJsonFile(PRODUCTS_PATH, updated);
  return NextResponse.json(nextProduct, { status: 201 });
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const payload = sanitizePayload(await request.json());
  const products = await loadProducts();
  const updated = products.map((product) =>
    product.id === payload.id
      ? {
          ...product,
          ...payload,
          slug:
            payload.slug ??
            String(payload.name ?? product.name)
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-"),
        }
      : product,
  );
  await writeJsonFile(PRODUCTS_PATH, updated);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const products = await loadProducts();
  const productToDelete = products.find((item) => item.id === id);
  if (productToDelete?.images && Array.isArray(productToDelete.images)) {
    await Promise.all(
      productToDelete.images.map(async (imagePath) => {
        if (typeof imagePath !== "string" || !imagePath.startsWith("/uploads/products/")) return;
        const relativeFile = imagePath.replace(/^\//, "");
        const absoluteFile = path.join(process.cwd(), "public", relativeFile);
        try {
          await fs.unlink(absoluteFile);
        } catch {
          // Ignore missing files to keep deletion idempotent.
        }
      }),
    );
  }
  const updated = products.filter((item) => item.id !== id);
  await writeJsonFile(PRODUCTS_PATH, updated);
  return NextResponse.json({ ok: true });
}
