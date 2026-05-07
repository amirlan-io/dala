import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

const handler = NextAuth(authOptions);

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function GET(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  return handler(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    console.warn(`[auth] Rate limit hit for IP ${ip}`);
    return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
  }
  return handler(request, context);
}
