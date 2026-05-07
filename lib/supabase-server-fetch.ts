function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function isAbortError(e: unknown) {
  return e instanceof Error && (e.name === "AbortError" || e.message.includes("aborted"));
}

let ipv4PreferenceApplied = false;

/** Prefer IPv4 on Node (lazy — avoid top-level `import dns` breaking Edge/turbopack analyze). */
function ensureIpv4First() {
  if (ipv4PreferenceApplied) return;
  ipv4PreferenceApplied = true;
  if (typeof process === "undefined" || !process.versions?.node) return;
  try {
    // Lazy require so this module never statically imports node:dns
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dns = require("node:dns") as typeof import("node:dns");
    dns.setDefaultResultOrder("ipv4first");
  } catch {
    // Edge or restricted runtime
  }
}

/**
 * Retries transient network failures from undici/fetch (used by @supabase/supabase-js).
 */
export function createResilientServerFetch(maxAttempts = 4) {
  const resilientFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    ensureIpv4First();
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      let controller: AbortController | undefined;
      try {
        const timeoutMs = 55_000;
        const userSignal = init?.signal;
        let merged: RequestInit = { ...init };
        if (!userSignal) {
          controller = new AbortController();
          timer = setTimeout(() => controller!.abort(), timeoutMs);
          merged = { ...init, signal: controller.signal };
        }
        const response = await fetch(input, merged);
        return response;
      } catch (e) {
        lastError = e;
        if (isAbortError(e) && attempt === maxAttempts) break;
        const msg = e instanceof Error ? e.message : String(e);
        const cause =
          e instanceof Error && "cause" in e
            ? String((e as Error & { cause?: unknown }).cause ?? "")
            : "";
        if (attempt === maxAttempts) {
          console.error(`[supabase-fetch] failed after ${maxAttempts} attempts:`, msg, cause);
        }
        if (attempt < maxAttempts) await sleep(200 * attempt * attempt);
      } finally {
        if (timer) clearTimeout(timer);
      }
    }
    throw lastError;
  };

  return resilientFetch;
}
