import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import { rateLimited } from "@/lib/ratelimit";
import { alertCoach, growthBySlug, mark, sourceFor, upsertLead } from "@/lib/growth/core";
import { readPerson } from "@/lib/growth/person";

/** Book a discovery conversation. The booking joins the same lead record (same email, WhatsApp number as backup). */
export async function POST(req: Request) {
  if (await rateLimited("disc", 12)) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const g = await growthBySlug(String(body.slug || ""));
  if (!g) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const p = readPerson(body, { phone: true });
  if ("error" in p) return NextResponse.json({ error: p.error }, { status: 400 });
  try {
    const lead = await upsertLead(g.userId, { ...p.person, source: await sourceFor(g.userId, String(body.src || "")), consent: true });
    const slot = await store.tx(async (t) => {
      const s = await t.get("slots", String(body.slotId || ""));
      if (!s || s.userId !== g.userId) throw new Error("That time isn't available");
      if (s.leadId && s.leadId !== lead.id) throw new Error("That time was just booked. Pick another.");
      if (new Date(String(s.startsAt)).getTime() < Date.now()) throw new Error("That time has passed");
      const cur = await t.get("crm", lead.id);
      const prev = cur?.slotId && cur.slotId !== s.id ? await t.get("slots", String(cur.slotId)) : null;
      if (prev && !(cur?.m as Record<string, string> | undefined)?.callAttended && new Date(String(prev.startsAt)).getTime() > Date.now()) t.update("slots", prev.id, { leadId: undefined, bookedAt: undefined });
      t.update("slots", s.id, { leadId: lead.id, bookedAt: new Date().toISOString() });
      t.update("crm", lead.id, { callAt: s.startsAt, callLink: s.link || g.callLink || "", slotId: s.id });
      return s;
    });
    const fresh = await mark(g.userId, lead.id, "callBooked", { eventAt: String(slot.startsAt), ctxKey: String(slot.id), refire: true });
    await alertCoach(g.userId, `Discovery call ${fresh ? "booked" : "rescheduled"}: ${lead.name} on ${new Date(String(slot.startsAt)).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST. Open the call card in Growth › Leads.`);
    return NextResponse.json({ ok: true, startsAt: slot.startsAt, link: slot.link || g.callLink || "" });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
