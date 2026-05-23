import { createHash } from "crypto";

/**
 * One-way SHA-256 hash of a client IP.
 * Raw IPs are never written to the database.
 */
export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(ip + (process.env.IP_HASH_SALT ?? "showcase-default-salt"))
    .digest("hex");
}

/**
 * Extract client IP from Next.js request headers.
 * Handles Vercel's x-forwarded-for correctly.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}