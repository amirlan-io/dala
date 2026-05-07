import { createClient } from "@supabase/supabase-js";
import { createResilientServerFetch } from "@/lib/supabase-server-fetch";

const resilientFetch = createResilientServerFetch();

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

function readSupabaseEnv() {
  // Prefer server-only names first so Vercel injects them at runtime (NEXT_PUBLIC_* is build-inlined on client).
  const publicUrl = normalizeEnv(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalizeEnv(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const serviceRoleKey = normalizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return { publicUrl, anonKey, serviceRoleKey };
}

export function getSupabaseConfigIssue() {
  const { publicUrl, anonKey, serviceRoleKey } = readSupabaseEnv();
  if (!publicUrl) {
    return "No Supabase URL in this deployment. In Vercel → Project that owns this domain → Settings → Environment Variables add SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) = https://…supabase.co for Production, Save, then Redeploy (Deployments → … → Redeploy).";
  }
  if (!hasValidHttpUrl(publicUrl)) return "Invalid Supabase URL format (must be https://…supabase.co)";
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
