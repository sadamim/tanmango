import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import { rateLimited } from "@/lib/ratelimit";
import { alertCoach, growthBySlug, mark, sourceFor, upsertLead } from "@/lib/growth/core";
import { readPerson } from "@/lib/growth/person";

/** Register for a free masterclass with a numbered seat. Joins the lead's existing record. */
export async function POST(req: Request) {
  if (await rateLimited("mc", 12)) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const g = await growthBySlug(String(body.slug || ""));
  if (!g) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const p = readPerson(body, { phone: true });
  if ("error" in p) return NextResponse.json({ error: p.error }, { status: 400 });
  const mc = await store.get("masterclasses", String(body.masterclassId || ""));
  if (!mc || mc.userId !== g.userId || mc.published === false) return NextResponse.json({ error: "This masterclass isn't available" }, { status: 404 });
  const end = new Date(String(mc.startsAt)).getTime() + Number(mc.duration || 120) * 60000;
  if (end < Date.now()) return NextResponse.json({ error: "This masterclass has already happened" }, { status: 400 });

  try {
    const lead = await upsertLead(g.userId, { ...p.person, source: await sourceFor(g.userId, String(body.src || "")), consent: true });
    const seat = await store.tx(async (t) => {
      const cur = await t.get("crm", lead.id);
      if (cur?.masterclassId === mc.id && cur.seat) return Number(cur.seat);
      const regs = await t.find("crm", [["userId", g.userId], ["masterclassId", mc.id]]);
      if (mc.seats && regs.length >= Number(mc.seats)) throw new Error("Sorry, every seat is taken");
      const used = new Set(regs.map((r) => Number(r.seat)));
      let n = 1;
      while (used.has(n)) n++;
      t.update("crm", lead.id, { masterclassId: mc.id, seat: n });
      return n;
    });
    const fresh = await mark(g.userId, lead.id, "mcRegistered", { eventAt: String(mc.startsAt), ctxKey: mc.id, refire: true, extra: { masterclassId: mc.id } });
    if (fresh) await alertCoach(g.userId, `Masterclass registration: ${lead.name} took seat ${seat} for ${mc.title}.`);
    return NextResponse.json({ ok: true, seat, title: mc.title, startsAt: mc.startsAt, joinLink: mc.joinLink || "" });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
