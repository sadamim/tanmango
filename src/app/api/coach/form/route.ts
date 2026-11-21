import { NextResponse } from "next/server";
import { id, now, store } from "@/lib/db";
import { rateLimited } from "@/lib/ratelimit";
import { alertCoach, appUrl, fireFlow, logEvent, upsertLead } from "@/lib/growth/core";
import { getCoach } from "@/lib/coach/server";
import { programme } from "@/lib/coach/content";

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const clip = (v: unknown, n = 2000) => String(v ?? "").trim().slice(0, n);

/**
 * Forms on the coach website: lead magnet, application and contact.
 * Each one joins the lead record in Growth › Leads & CRM and starts its workflow (email + WhatsApp).
 */
export async function POST(req: Request) {
  if (await rateLimited("coach-form", 10)) return bad("Too many requests. Try again in a minute.", 429);
  const body = await req.json().catch(() => ({}));
  const kind = String(body.kind || "");
  const name = clip(body.name || [body.firstName, body.lastName].filter(Boolean).join(" "), 80);
  const email = clip(body.email, 120).toLowerCase();
  const phone = String(body.whatsapp || body.phone || "").replace(/\D/g, "").slice(-10);
  const optIn = Boolean(body.whatsappOptIn) || kind === "application";
  if (!/^\S+@\S+\.\S+$/.test(email)) return bad("Enter a valid email");
  if (!name && kind !== "lead") return bad("Enter your name");

  const coach = await getCoach();
  if (!coach.creatorId) return bad("This site isn't connected to a coach account yet (set COACH_SLUG).", 503);
  const cid = coach.creatorId;
  const lead = await upsertLead(cid, { name: name || email, email, phone, whatsappOptIn: optIn, source: kind === "lead" ? "lead-magnet" : `site-${kind}`, consent: Boolean(body.terms || body.consent) });

  if (kind === "lead") {
    const link = programme.resourceUrl.startsWith("/") ? appUrl() + programme.resourceUrl : programme.resourceUrl;
    await logEvent(cid, lead.id, "lead_magnet");
    await fireFlow(cid, "lead_magnet", lead, { extra: { resource_link: link } });
    return NextResponse.json({ ok: true });
  }

  if (kind === "application") {
    const answers = {
      city: clip(body.city, 80), occupation: clip(body.occupation, 120), why: clip(body.why), goal: clip(body.goal),
      source: clip(body.source, 60), cohort: clip(body.cohort, 120), live: clip(body.live, 20),
    };
    await store.write([{ type: "set", coll: "leads", id: id(), data: { userId: cid, createdAt: now(), type: "form", name, email, phone, pageTitle: "Application", mango: coach.programme.name, answers } }]);
    await logEvent(cid, lead.id, "application", answers.why.slice(0, 160));
    await fireFlow(cid, "application", lead);
    await alertCoach(cid, `New application: ${name} (${email}).`);
    return NextResponse.json({ ok: true });
  }

  if (kind === "contact") {
    const topic = clip(body.topic, 60) || "General";
    const message = clip(body.message, 4000);
    if (!message) return bad("Write a message");
    await store.write([{ type: "set", coll: "leads", id: id(), data: { userId: cid, createdAt: now(), type: "form", name, email, phone, pageTitle: `Contact · ${topic}`, message } }]);
    await logEvent(cid, lead.id, "contact", topic);
    await alertCoach(cid, `New message from ${name} (${topic}): ${message.slice(0, 140)}`);
    return NextResponse.json({ ok: true });
  }

  return bad("Unknown form");
}
