import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import { clearFailedAttempts, isRateLimited, registerFailedAttempt } from "@/lib/rate-limit";

const TOO_MANY_ATTEMPTS_MESSAGE = "Too many login attempts. Please try again in 15 minutes.";

function readHeaderValue(headers: unknown, key: string): string | undefined {
  if (!headers || typeof headers !== "object") return undefined;

  if (typeof (headers as { get?: unknown }).get === "function") {
    return (headers as Headers).get(key) ?? undefined;
  }

  const value = (headers as Record<string, unknown>)[key] ?? (headers as Record<string, unknown>)[key.toLowerCase()];
  if (Array.isArray(value)) return String(value[0] ?? "");
  return typeof value === "string" ? value : undefined;
}

function getClientIp(req: unknown): string {
  const headers = (req as { headers?: unknown })?.headers;
  const forwardedFor = readHeaderValue(headers, "x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return readHeaderValue(headers, "x-real-ip") || "unknown";
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;
        const clientIp = getClientIp(req);
        if (isRateLimited(clientIp)) {
          console.warn(`[auth] Too many failed attempts for IP ${clientIp}`);
          throw new Error(TOO_MANY_ATTEMPTS_MESSAGE);
        }

        const email = String(credentials.email ?? "").trim().toLowerCase();
        const password = String(credentials.password ?? "").trim();
        const adminEmail = String(process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

        const passwordHash = String(process.env.ADMIN_PASSWORD_HASH ?? "").trim();
        let isValidPassword = false;

        if (passwordHash) {
          isValidPassword = await bcrypt.compare(password, passwordHash);
        } else {
          const fallbackPassword = String(process.env.ADMIN_PASSWORD ?? "").trim();
          isValidPassword = Boolean(fallbackPassword) && password === fallbackPassword;
        }

        if (email === adminEmail && isValidPassword) {
          clearFailedAttempts(clientIp);
          return { id: "admin", email };
        }

        registerFailedAttempt(clientIp);
        console.warn(`[auth] Failed login attempt for ${email || "unknown email"} from IP ${clientIp}`);
        return null;
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
