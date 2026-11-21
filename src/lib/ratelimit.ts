import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort in-memory limiter for public endpoints. State is per server instance, so on multi-instance
 * hosting put a shared limiter (Redis, Cloud Armor, Vercel Firewall) in front for hard guarantees.
 */
const hits = new Map<string, number[]>();

export async function rateLimited(bucket: string, max: number, windowMs = 60_000) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  const key = `${bucket}:${ip}`;
  const t = Date.now();
  const recent = (hits.get(key) || []).filter((x) => t - x < windowMs);
  recent.push(t);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((x) => t - x < windowMs)) hits.delete(k);
  return recent.length > max;
}
