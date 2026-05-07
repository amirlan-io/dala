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

export function getSupabaseClients() {
  const supabaseUrl = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabaseServiceRoleKey = normalizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!hasValidHttpUrl(supabaseUrl) || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return null;
  }

  const hasNonAsciiKeyChars = [supabaseAnonKey, supabaseServiceRoleKey].some((key) => /[^\x20-\x7E]/.test(key));
  if (hasNonAsciiKeyChars) {
    console.error("[supabase] Invalid env key characters detected. Re-copy Supabase keys in Vercel env.");
    return null;
  }

  const verifiedUrl = supabaseUrl;
  const verifiedAnonKey = supabaseAnonKey;
  const verifiedServiceRoleKey = supabaseServiceRoleKey;

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
