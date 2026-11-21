import { NextResponse } from "next/server";
import { id, now, store } from "@/lib/db";
import { rateLimited } from "@/lib/ratelimit";
import { alertCoach, growthBySlug, mark } from "@/lib/growth/core";

/** A learner's testimonial, with an explicit permission tick. Only approved, permitted ones are shown publicly. */
export async function POST(req: Request) {
  if (await rateLimited("testi", 6)) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const g = await growthBySlug(String(body.slug || ""));
  if (!g) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const lead = await store.get("crm", String(body.l || ""));
  if (!lead || lead.userId !== g.userId) return NextResponse.json({ error: "This link isn't valid" }, { status: 400 });
  const a = (Array.isArray(body.answers) ? body.answers : []).slice(0, 3).map((x: unknown) => String(x || "").trim().slice(0, 1500));
  const voiceUrl = String(body.voiceUrl || "").trim().slice(0, 300);
  if (!a.some(Boolean) && !voiceUrl) return NextResponse.json({ error: "Please share at least one answer or a voice-note link" }, { status: 400 });
  if (voiceUrl && !/^https?:\/\//.test(voiceUrl)) return NextResponse.json({ error: "Voice-note link must start with http" }, { status: 400 });
  await store.write([{ type: "set", coll: "testimonials", id: id(), data: { userId: g.userId, createdAt: now(), leadId: lead.id, name: lead.name, answers: a, voiceUrl, permission: Boolean(body.permission), status: "received", featured: false } }]);
  await mark(g.userId, String(lead.id), "testimonial");
  await alertCoach(g.userId, `New testimonial from ${lead.name}${body.permission ? " (permission given)" : " (no permission to publish)"}.`);
  return NextResponse.json({ ok: true });
}
