import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/ratelimit";
import { growthBySlug, mark, sourceFor, upsertLead } from "@/lib/growth/core";

/** A visitor typed an email into a funnel form but has not finished it: keep it as a "half-filled form". */
export async function POST(req: Request) {
  if (await rateLimited("partial", 20)) return NextResponse.json({ ok: false }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const g = await growthBySlug(String(body.slug || ""));
  const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
  if (!g || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ ok: false });
  const lead = await upsertLead(g.userId, { name: String(body.name || "").slice(0, 80) || undefined, email, phone: String(body.phone || ""), source: await sourceFor(g.userId, String(body.src || "")) });
  await mark(g.userId, lead.id, "half", { silent: true, detail: String(body.form || "") });
  return NextResponse.json({ ok: true });
}
