import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api";
import { getSupabaseClients } from "@/lib/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;
  const clients = getSupabaseClients();
  if (!clients) return NextResponse.json({ error: "Supabase env is not configured" }, { status: 500 });

  const form = await request.formData();
  const file = form.get("file");
  const filePrefix = String(form.get("filePrefix") ?? "")
    .replace(/[^\w-]/g, "")
    .slice(0, 64);
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  const fileName = `${Date.now()}-${filePrefix ? `${filePrefix}-` : ""}${sanitizedName}`;

  const { error } = await clients.supabaseAdmin.storage
    .from("products")
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const {
    data: { publicUrl },
  } = clients.supabaseAdmin.storage.from("products").getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl });
}
