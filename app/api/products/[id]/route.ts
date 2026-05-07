import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api";
import { sanitizePayload } from "@/lib/sanitize";
import { getSupabaseClients } from "@/lib/supabase";

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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;
  const clients = getSupabaseClients();
  if (!clients) return NextResponse.json({ error: "Supabase env is not configured" }, { status: 500 });

  const { id } = await params;
  const payload = sanitizePayload(await request.json()) as Record<string, unknown>;
  const slug = payload.slug ? toSlug(payload.slug) : payload.name ? toSlug(payload.name) : undefined;
  const updatePayload: Record<string, unknown> = {};

  if (slug) updatePayload.slug = slug;
  if (payload.name !== undefined) updatePayload.name = String(payload.name ?? "").trim();
  if (payload.description !== undefined) updatePayload.description = String(payload.description ?? "").trim();
  if (payload.price !== undefined) updatePayload.price = Number(payload.price ?? 0);
  if (payload.category !== undefined) updatePayload.category = String(payload.category ?? "ACCESSORIES");
  if (payload.images !== undefined) updatePayload.images = Array.isArray(payload.images) ? payload.images : [];
  if (payload.is_new !== undefined || payload.new !== undefined) {
    updatePayload.is_new = Boolean(payload.is_new ?? payload.new ?? false);
  }

  const { data, error } = await clients.supabaseAdmin
    .from("products")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;
  const clients = getSupabaseClients();
  if (!clients) return NextResponse.json({ error: "Supabase env is not configured" }, { status: 500 });

  const { id } = await params;
  const { error } = await clients.supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
