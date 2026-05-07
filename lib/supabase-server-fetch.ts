import dns from "node:dns";

/**
 * Vercel / Node can fail Supabase storage uploads with "TypeError: fetch failed"
 * when the default DNS order prefers IPv6. Prefer IPv4 first (Node 17+).
 */
if (typeof process !== "undefined" && process.versions?.node) {
  try {
    dns.setDefaultResultOrder("ipv4first");
  } catch {
    // ignore
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function isAbortError(e: unknown) {
  return e instanceof Error && (e.name === "AbortError" || e.message.includes("aborted"));
}

/**
 * Retries transient network failures from undici/fetch (used by @supabase/supabase-js).
 */
export function createResilientServerFetch(maxAttempts = 4) {
  const resilientFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
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
        console.error(`[supabase-fetch] attempt ${attempt}/${maxAttempts} failed:`, msg, cause);
        if (attempt < maxAttempts) await sleep(200 * attempt * attempt);
      } finally {
        if (timer) clearTimeout(timer);
      }
    }
    throw lastError;
  };

  return resilientFetch;
}
