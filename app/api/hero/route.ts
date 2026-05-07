import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api";
import { sanitizePayload } from "@/lib/sanitize";
import { getSupabaseClients } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const clients = getSupabaseClients();
  if (!clients) {
    return NextResponse.json({
      id: "default",
      title: "",
      subtitle: "",
      image_url: "",
    });
  }

  const { data, error } = await clients.supabase
    .from("hero_settings")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) {
    return NextResponse.json({
      id: "default",
      title: "",
      subtitle: "",
      image_url: "",
    });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;
  const clients = getSupabaseClients();
  if (!clients) return NextResponse.json({ error: "Supabase env is not configured" }, { status: 500 });

  const payload = sanitizePayload(await request.json()) as Record<string, unknown>;
  const { id, ...values } = payload;
  const upsertPayload = {
    id: typeof id === "string" && id.length > 0 ? id : "default",
    title: String(values.title ?? ""),
    subtitle: String(values.subtitle ?? ""),
    image_url: String(values.image_url ?? ""),
  };

  const { data, error } = await clients.supabaseAdmin
    .from("hero_settings")
    .upsert(upsertPayload)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
