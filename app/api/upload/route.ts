import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { requireAdminSession } from "@/lib/admin-api";
import { sanitizeText } from "@/lib/sanitize";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const form = await request.formData();
  const file = form.get("file");
  const folder = sanitizeText(String(form.get("folder") ?? ""));
  const filePrefix = sanitizeText(String(form.get("filePrefix") ?? ""));
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = file.type.split("/")[1];
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  const originalBaseName = sanitizedName.replace(/\.[^.]*$/, "").replace(/[.-]{2,}/g, "-").slice(0, 64);
  const sanitizedPrefix = filePrefix ? filePrefix.replace(/[^\w-]/g, "").slice(0, 64) : "";
  const baseName = sanitizedPrefix
    ? `${sanitizedPrefix}-${originalBaseName}-${Date.now()}`
    : `${originalBaseName || "upload"}-${Date.now()}`;

  const targetFolder = folder === "products" ? "uploads/products" : "uploads";
  const fileName = `${baseName}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", targetFolder);
  await fs.mkdir(uploadDir, { recursive: true });
  const uploadPath = path.join(uploadDir, fileName);
  await fs.writeFile(uploadPath, bytes);

  return NextResponse.json({ url: `/${targetFolder}/${fileName}` });
}
