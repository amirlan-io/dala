import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/json-store";
import { requireAdminSession } from "@/lib/admin-api";
import { sanitizePayload } from "@/lib/sanitize";

const HERO_PATH = "data/hero.json";

export async function GET() {
  const hero = await readJsonFile(HERO_PATH, {
    title: "",
    subtitle: "",
    ctaText: "",
    image: "",
    visible: true,
  });
  return NextResponse.json(hero);
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const payload = sanitizePayload(await request.json());
  await writeJsonFile(HERO_PATH, payload);
  return NextResponse.json({ ok: true });
}
