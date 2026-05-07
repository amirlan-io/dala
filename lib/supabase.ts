import { createClient } from "@supabase/supabase-js";
import { createResilientServerFetch } from "@/lib/supabase-server-fetch";

const resilientFetch = createResilientServerFetch();

/**
 * Next.js can embed `NEXT_PUBLIC_*` at **build** time. Reading via Reflect avoids a stale
 * empty URL in API routes after you fix env in Vercel (until a no-cache redeploy).
 * Prefer server-only `SUPABASE_URL` / `SUPABASE_ANON_KEY` on Vercel for API routes.
 */
function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const raw = Reflect.get(process.env as Record<string, unknown>, key);
  return typeof raw === "string" ? raw : undefined;
}

function normalizeEnv(value: string | undefined) {
  if (!value) return "";
  return value
    .replace(/^\uFEFF/, "")
    .replace(/^[\u2022\s]+/, "")
    .trim();
}

function hasValidHttpUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Picks the first URL whose host is *.supabase.co.
 * Important: if SUPABASE_URL is a stale typo (.supabase.com) but NEXT_PUBLIC_SUPABASE_URL is correct,
 * the old code used the wrong variable first — uploads kept failing until both matched.
 */
function pickSupabaseProjectUrl(): string {
  const candidates = [getProcessEnv("NEXT_PUBLIC_SUPABASE_URL"), getProcessEnv("SUPABASE_URL")];
  for (const raw of candidates) {
    const u = normalizeEnv(raw);
    if (!u) continue;
    try {
      const host = new URL(u).hostname.toLowerCase();
      if (host.endsWith(".supabase.co")) return u;
    } catch {
      continue;
    }
  }
  return normalizeEnv(getProcessEnv("SUPABASE_URL") || getProcessEnv("NEXT_PUBLIC_SUPABASE_URL"));
}

function readSupabaseEnv() {
  const publicUrl = pickSupabaseProjectUrl();
  const anonKey = normalizeEnv(
    getProcessEnv("SUPABASE_ANON_KEY") || getProcessEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
  const serviceRoleKey = normalizeEnv(getProcessEnv("SUPABASE_SERVICE_ROLE_KEY"));
  return { publicUrl, anonKey, serviceRoleKey };
}

/** Safe summary for admin diagnostics (no full secrets). */
export function getSupabaseEnvSnapshot() {
  const { publicUrl, anonKey, serviceRoleKey } = readSupabaseEnv();
  let hostname: string | null = null;
  try {
    if (publicUrl) hostname = new URL(publicUrl).hostname;
  } catch {
    hostname = null;
  }
  return {
    hasUrl: Boolean(publicUrl),
    hostname,
    hasAnonKey: Boolean(anonKey),
    hasServiceRoleKey: Boolean(serviceRoleKey),
    anonKeyPrefix: anonKey ? `${anonKey.slice(0, 14)}…` : null,
    serviceKeyPrefix: serviceRoleKey ? `${serviceRoleKey.slice(0, 14)}…` : null,
  };
}

export function getSupabaseConfigIssue() {
  const { publicUrl, anonKey, serviceRoleKey } = readSupabaseEnv();
  if (!publicUrl) {
    return "No Supabase URL in this deployment. In Vercel → Project that owns this domain → Settings → Environment Variables add SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) = https://…supabase.co for Production, Save, then Redeploy (Deployments → … → Redeploy).";
  }
  if (!hasValidHttpUrl(publicUrl)) return "Invalid Supabase URL format (must be https://…supabase.co)";
  try {
    const host = new URL(publicUrl).hostname.toLowerCase();
    if (host.endsWith(".supabase.com") || !host.endsWith(".supabase.co")) {
      return "Supabase URL must be https://xxxx.supabase.co (not .supabase.com — common copy mistake). Copy Project URL from Supabase → Settings → API.";
    }
  } catch {
    return "Invalid Supabase URL format (must be https://…supabase.co)";
  }
  if (!anonKey) return "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)";
  if (!serviceRoleKey) return "Missing SUPABASE_SERVICE_ROLE_KEY";
  const hasNonAsciiKeyChars = [anonKey, serviceRoleKey].some((key) => /[^\x20-\x7E]/.test(key));
  if (hasNonAsciiKeyChars) return "Supabase keys contain invalid copied characters (re-copy from Supabase dashboard)";
  return null;
}

/** URL + keys for server-only fallbacks (e.g. direct Storage REST upload). */
export function getSupabaseConnectionParams(): null | { url: string; serviceRoleKey: string } {
  if (getSupabaseConfigIssue()) return null;
  const { publicUrl, serviceRoleKey } = readSupabaseEnv();
  return { url: publicUrl, serviceRoleKey };
}

export function getSupabaseClients() {
  const issue = getSupabaseConfigIssue();
  if (issue) {
    console.error("[supabase] config issue:", issue);
    return null;
  }
  const { publicUrl: supabaseUrl, anonKey: supabaseAnonKey, serviceRoleKey: supabaseServiceRoleKey } = readSupabaseEnv();

  const verifiedUrl = supabaseUrl as string;
  const verifiedAnonKey = supabaseAnonKey as string;
  const verifiedServiceRoleKey = supabaseServiceRoleKey as string;

  try {
    const supabase = createClient(verifiedUrl, verifiedAnonKey, {
      global: { fetch: resilientFetch },
    });
    const supabaseAdmin = createClient(verifiedUrl, verifiedServiceRoleKey, {
      auth: { persistSession: false },
      global: { fetch: resilientFetch },
    });

    return { supabase, supabaseAdmin };
  } catch (error) {
    console.error("[supabase] Client init failed:", error);
    return null;
  }
}
