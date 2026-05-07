import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/json-store";
import { requireAdminSession } from "@/lib/admin-api";
import { sanitizePayload } from "@/lib/sanitize";

const ORDERS_PATH = "data/orders.json";
type OrderRecord = { id: string; [key: string]: unknown };

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const orders = await readJsonFile<OrderRecord[]>(ORDERS_PATH, []);
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const payload = sanitizePayload(await request.json());
  const orders = await readJsonFile<OrderRecord[]>(ORDERS_PATH, []);
  const nextOrder = { id: crypto.randomUUID(), ...payload };
  await writeJsonFile(ORDERS_PATH, [nextOrder, ...orders]);
  return NextResponse.json(nextOrder, { status: 201 });
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const payload = sanitizePayload(await request.json());
  const orders = await readJsonFile<OrderRecord[]>(ORDERS_PATH, []);
  const updated = orders.map((order) =>
    order.id === payload.id ? { ...order, ...payload } : order,
  );
  await writeJsonFile(ORDERS_PATH, updated);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const orders = await readJsonFile<OrderRecord[]>(ORDERS_PATH, []);
  const updated = orders.filter((item) => item.id !== id);
  await writeJsonFile(ORDERS_PATH, updated);
  return NextResponse.json({ ok: true });
}
