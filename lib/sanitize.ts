import DOMPurify from "isomorphic-dompurify";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export function sanitizeText(value: string): string {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

export function sanitizePayload<T extends JsonValue>(value: T): T {
  if (typeof value === "string") {
    return sanitizeText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizePayload(item)) as T;
  }

  if (value && typeof value === "object") {
    const output: Record<string, JsonValue> = {};
    for (const [key, entry] of Object.entries(value)) {
      output[key] = sanitizePayload(entry as JsonValue);
    }
    return output as T;
  }

  return value;
}
