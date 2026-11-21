import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import { rateLimited } from "@/lib/ratelimit";
import { fireFlow, mark, upsertLead } from "@/lib/growth/core";
import type { Lead } from "@/lib/growth/model";

/**
 * Webhook for comment-to-DM tools (ManyChat, WATI, Zapier, Make…): POST { key, phone, name?, platform?, keyword? }.
 * `key` is the hook key shown in Growth › Links. Creates the lead (they messaged first, so WhatsApp is opted in)
 * and starts the "Social lead" workflow.
 */
export async function POST(req: Request) {
  if (await rateLimited("hook", 60)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const key = String(body.key || "");
  const [g] = key.length > 16 ? await store.find("growth", [["hookKey", key]], { limit: 1 }) : [];
  if (!g) return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  const phone = String(body.phone || "").replace(/\D/g, "").slice(-10);
  const email = String(body.email || "").trim().toLowerCase();
  if (phone.length !== 10 && !email) return NextResponse.json({ error: "Send a phone or email" }, { status: 400 });
  const platform = String(body.platform || "Instagram").slice(0, 30);
  const lead = await upsertLead(String(g.userId), { name: String(body.name || "").slice(0, 80) || undefined, email, phone, whatsappOptIn: phone.length === 10, source: `${platform}${body.keyword ? ` · ${String(body.keyword).slice(0, 30)}` : ""}` });
  await mark(String(g.userId), lead.id, "half", { silent: true, detail: "social" });
  await fireFlow(String(g.userId), "social_lead", lead as Lead, { key: `${Date.now()}` });
  return NextResponse.json({ ok: true });
}
