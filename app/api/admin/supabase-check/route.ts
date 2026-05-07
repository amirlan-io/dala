import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getSupabaseClients,
  getSupabaseConfigIssue,
  getSupabaseEnvSnapshot,
} from "@/lib/supabase";
import { createResilientServerFetch } from "@/lib/supabase-server-fetch";

export const runtime = "nodejs";

/**
 * Admin-only diagnostics: shows what this deployment actually sees for Supabase (no secret leakage).
 * Open in browser while logged in: GET /api/admin/supabase-check
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Нужна сессия админа (войти в /admin/login)." }, { status: 401 });
  }

  const snapshot = getSupabaseEnvSnapshot();
  const configIssue = getSupabaseConfigIssue();
  const clients = getSupabaseClients();

  let reachability: { ok: boolean; httpStatus?: number; message?: string } = { ok: false };
  const fetchImpl = createResilientServerFetch(2);

  if (snapshot.hostname && snapshot.hostname.endsWith(".supabase.co")) {
    const origin = `https://${snapshot.hostname}`;
    try {
      const res = await fetchImpl(`${origin}/`, { method: "GET", signal: AbortSignal.timeout(12_000) });
      reachability = { ok: true, httpStatus: res.status };
    } catch (e) {
      reachability = {
        ok: false,
        message: e instanceof Error ? e.message : String(e),
      };
    }
  }

  return NextResponse.json({
    where: "This response is from your server — if hostname is null here, Vercel still does not pass SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL to THIS deployment.",
    vercelEnv: process.env.VERCEL_ENV ?? null,
    snapshot,
    configIssue,
    clientsOk: Boolean(clients),
    reachability,
    fix: [
      "В этом же проекте Vercel (тот, что обслуживает открытый домен): Settings → Environment Variables.",
      "Добавь дубликаты без NEXT_PUBLIC: SUPABASE_URL = тот же https://xxx.supabase.co; SUPABASE_ANON_KEY = тот же что anon (legacy или publishable).",
      "Deployments → Redeploy → сними галку Use existing Build Cache (один раз).",
    ],
  });
}
