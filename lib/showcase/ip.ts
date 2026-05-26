import { createHash } from "crypto";

/**
 * One-way SHA-256 hash of a client IP.
 * Raw IPs are never written to the database.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) {
    throw new Error("IP_HASH_SALT is required");
  }
  return createHash("sha256")
    .update(ip + salt)
    .digest("hex");
}

/**
 * Extract client IP from Next.js request headers.
 * Handles Vercel's x-forwarded-for correctly.
 */
export function getClientIp(headers: Headers): string {
  const realIp = headers.get("x-real-ip")?.trim();
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return realIp || forwarded || "unknown";
}