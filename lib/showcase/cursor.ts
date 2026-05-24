/**
 * Feed cursor helpers.
 *
 * Trending/For-You cursor encodes: score + post_id
 * Latest cursor encodes:           created_at + post_id
 *
 * Both use Node's built-in Buffer — no external packages.
 */

// Score-based cursor (trending / for-you) 

export function encodeCursor(score: number, postId: string): string {
  return Buffer.from(`${score}:${postId}`).toString("base64url");
}

export function decodeCursor(cursor: string): { score: number; post_id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const idx = raw.indexOf(":");
    if (idx === -1) return null;
    const score   = parseFloat(raw.slice(0, idx));
    const post_id = raw.slice(idx + 1);
    if (isNaN(score) || !post_id) return null;
    return { score, post_id };
  } catch {
    return null;
  }
}

// Time-based cursor (latest feed) 

export function encodeTimeCursor(createdAt: string, postId: string): string {
  return Buffer.from(`${createdAt}:${postId}`).toString("base64url");
}

export function decodeTimeCursor(
  cursor: string
): { created_at: string; post_id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const idx = raw.lastIndexOf(":");
    if (idx === -1) return null;
    const created_at = raw.slice(0, idx);
    const post_id = raw.slice(idx + 1);
    if (!created_at || !post_id) return null;
    return { created_at, post_id };
  } catch {
    return null;
  }
}