import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api";
import { sanitizePayload } from "@/lib/sanitize";
import { getSupabaseClients, getSupabaseConfigIssue } from "@/lib/supabase";

/** Supabase stack uses `node:dns` — Edge runtime would crash and return HTML __next_error__ instead of JSON. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toSlug(value: unknown) {
  const source = String(value ?? "")
    .trim()
    .toLowerCase();
  const slug = source
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `product-${Date.now()}`;
}

export async function GET(request: Request) {
  const clients = getSupabaseClients();
  if (!clients) return NextResponse.json([], { status: 200 });

  const { searchParams } = new URL(request.url);
  const includeHidden = searchParams.get("includeHidden") === "true";
  if (includeHidden) {
    const unauthorized = await requireAdminSession();
    if (unauthorized) return unauthorized;
  }

  const query = clients.supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error("[api/products][GET] Supabase error:", error.message);
    return NextResponse.json([], { status: 200 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  try {
    const unauthorized = await requireAdminSession();
    if (unauthorized) return unauthorized;
    const clients = getSupabaseClients();
    if (!clients) {
      return NextResponse.json(
        { error: `Supabase env is not configured: ${getSupabaseConfigIssue() ?? "unknown issue"}` },
        { status: 500 },
      );
    }

    const payload = sanitizePayload(await request.json()) as Record<string, unknown>;
    const slug = toSlug(payload.slug ?? payload.name);
    const priceNum = Number(payload.price ?? 0);
    const insertPayload = {
      slug,
      name: String(payload.name ?? "").trim(),
      description: String(payload.description ?? "").trim(),
      price: Math.round(priceNum),
      category: String(payload.category ?? "ACCESSORIES"),
      images: Array.isArray(payload.images) ? payload.images : [],
      is_new: Boolean(payload.is_new ?? payload.new ?? false),
    };

    if (!insertPayload.name || !insertPayload.category || !Number.isFinite(priceNum) || insertPayload.price <= 0) {
      return NextResponse.json({ error: "Invalid product payload" }, { status: 400 });
    }

    const runInsert = async (slugValue: string) =>
      clients.supabaseAdmin.from("products").insert({ ...insertPayload, slug: slugValue }).select("*").single();

    let { data, error } = await runInsert(insertPayload.slug);

    const isUniqueSlug =
      error &&
      (error.code === "23505" || String(error.message).toLowerCase().includes("duplicate"));

    if (isUniqueSlug) {
      const retry = await runInsert(`${insertPayload.slug}-${Date.now()}`);
      data = retry.data;
      error = retry.error;
    }

    if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[api/products][POST] unhandled error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message || "Products create internal error" }, { status: 500 });
  }
}
