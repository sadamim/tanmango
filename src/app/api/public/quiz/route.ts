import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import { rateLimited } from "@/lib/ratelimit";
import { alertCoach, describeResult, growthBySlug, mark, sourceFor, upsertLead } from "@/lib/growth/core";
import { DEFAULT_PATTERNS, DEFAULT_RULES, scorePatternCheck } from "@/lib/growth/model";
import { readPerson } from "@/lib/growth/person";

/** Pattern Check submission: score it, save everything on the lead's record, alert the coach. */
export async function POST(req: Request) {
  if (await rateLimited("quiz", 12)) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const g = await growthBySlug(String(body.slug || ""));
  if (!g) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const p = readPerson(body, { phone: true });
  if ("error" in p) return NextResponse.json({ error: p.error }, { status: 400 });

  const patterns = g.quiz?.patterns?.length ? g.quiz.patterns : DEFAULT_PATTERNS;
  const rules = g.quiz?.rules || DEFAULT_RULES;
  const raw = (body.picked && typeof body.picked === "object" ? body.picked : {}) as Record<string, unknown>;
  const picked: Record<string, string[]> = {};
  let count = 0;
  for (const pat of patterns) {
    const ids = new Set(pat.bullets.map((b) => b.id));
    picked[pat.id] = (Array.isArray(raw[pat.id]) ? (raw[pat.id] as unknown[]) : []).map(String).filter((x) => ids.has(x));
    count += picked[pat.id].length;
  }
  if (!count) return NextResponse.json({ error: "Pick at least one statement that sounds like you" }, { status: 400 });

  const result = scorePatternCheck(patterns, picked, rules);
  const lead = await upsertLead(g.userId, { ...p.person, source: await sourceFor(g.userId, String(body.src || "")), consent: true });
  const retest = Boolean(lead.m?.completed);
  await store.write([{ type: "update", coll: "crm", id: lead.id, patch: { pattern: retest ? { ...(lead.pattern || { ...result, picked }), retest: { ...result, picked } } : { ...result, picked } } }]);
  const fresh = await mark(g.userId, lead.id, "pattern");
  if (fresh || retest) {
    await alertCoach(g.userId, `${retest ? "Retest" : "New lead"}: ${lead.name}, ${describeResult(g, result)}${lead.source && lead.source !== "direct" ? `, from ${lead.source}` : ""}.`);
  }
  return NextResponse.json({ ok: true, leadId: lead.id, result });
}
