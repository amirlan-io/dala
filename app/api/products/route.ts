import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api";
import { sanitizePayload } from "@/lib/sanitize";
import { getSupabaseClients } from "@/lib/supabase";

export async function GET(request: Request) {
  const clients = getSupabaseClients();
  if (!clients) return NextResponse.json([], { status: 200 });

  const { searchParams } = new URL(request.url);
  const includeHidden = searchParams.get("includeHidden") === "true";
  if (includeHidden) {
    const unauthorized = await requireAdminSession();
    if (unauthorized) return unauthorized;
  }

  const query = clients.supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;
  const clients = getSupabaseClients();
  if (!clients) return NextResponse.json({ error: "Supabase env is not configured" }, { status: 500 });

  const payload = sanitizePayload(await request.json()) as Record<string, unknown>;
  const { data, error } = await clients.supabaseAdmin
    .from("products")
    .insert({
      ...payload,
      is_new: payload.is_new ?? payload.new ?? false,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
