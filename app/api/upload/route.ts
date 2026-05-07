import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { requireAdminSession } from "@/lib/admin-api";
import { getSupabaseClients } from "@/lib/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;
  const clients = getSupabaseClients();

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

  if (clients) {
    const { error } = await clients.supabaseAdmin.storage
      .from("products")
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (!error) {
      const {
        data: { publicUrl },
      } = clients.supabaseAdmin.storage.from("products").getPublicUrl(fileName);

      return NextResponse.json({ url: publicUrl });
    }

    console.error("[api/upload] Supabase upload failed, fallback to local:", error.message);
  } else {
    console.error("[api/upload] Supabase env not configured, fallback to local upload");
  }

  // Fallback: local upload keeps admin flow working even if Supabase is unavailable.
  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), bytes);
  return NextResponse.json({ url: `/uploads/products/${fileName}` });
}
