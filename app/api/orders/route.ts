import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api";
import { sanitizePayload } from "@/lib/sanitize";
import { getSupabaseClients } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;
  const clients = getSupabaseClients();
  if (!clients) return NextResponse.json([], { status: 200 });

  const { data, error } = await clients.supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const clients = getSupabaseClients();
  if (!clients) return NextResponse.json({ error: "Supabase env is not configured" }, { status: 500 });

  const payload = sanitizePayload(await request.json()) as Record<string, unknown>;
  const { data, error } = await clients.supabaseAdmin
    .from("orders")
    .insert(payload)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;
  const clients = getSupabaseClients();
  if (!clients) return NextResponse.json({ error: "Supabase env is not configured" }, { status: 500 });

  const payload = sanitizePayload(await request.json()) as Record<string, unknown>;
  const id = String(payload.id ?? "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { id: _, ...updatePayload } = payload;
  const { data, error } = await clients.supabaseAdmin.from("orders").update(updatePayload).eq("id", id).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;
  const clients = getSupabaseClients();
  if (!clients) return NextResponse.json({ error: "Supabase env is not configured" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await clients.supabaseAdmin.from("orders").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
