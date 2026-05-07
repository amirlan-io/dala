import { createClient } from "@supabase/supabase-js";

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
  const publicUrl = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  const anonKey = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
  const serviceRoleKey = normalizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return { publicUrl, anonKey, serviceRoleKey };
}

export function getSupabaseConfigIssue() {
  const { publicUrl, anonKey, serviceRoleKey } = readSupabaseEnv();
  if (!publicUrl) return "Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)";
  if (!hasValidHttpUrl(publicUrl)) return "Invalid NEXT_PUBLIC_SUPABASE_URL format";
  if (!anonKey) return "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)";
  if (!serviceRoleKey) return "Missing SUPABASE_SERVICE_ROLE_KEY";
  const hasNonAsciiKeyChars = [anonKey, serviceRoleKey].some((key) => /[^\x20-\x7E]/.test(key));
  if (hasNonAsciiKeyChars) return "Supabase keys contain invalid copied characters (re-copy from Supabase dashboard)";
  return null;
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
    const supabase = createClient(verifiedUrl, verifiedAnonKey);
    const supabaseAdmin = createClient(verifiedUrl, verifiedServiceRoleKey, {
      auth: { persistSession: false },
    });

    return { supabase, supabaseAdmin };
  } catch (error) {
    console.error("[supabase] Client init failed:", error);
    return null;
  }
}
