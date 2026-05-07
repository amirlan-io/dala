import { createClient } from "@supabase/supabase-js";

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!hasValidHttpUrl(supabaseUrl) || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return null;
  }

  const verifiedUrl = supabaseUrl as string;
  const verifiedAnonKey = supabaseAnonKey as string;
  const verifiedServiceRoleKey = supabaseServiceRoleKey as string;

  const supabase = createClient(verifiedUrl, verifiedAnonKey);
  const supabaseAdmin = createClient(verifiedUrl, verifiedServiceRoleKey, {
    auth: { persistSession: false },
  });

  return { supabase, supabaseAdmin };
}
