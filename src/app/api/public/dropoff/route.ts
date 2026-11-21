import { NextResponse } from "next/server";
import { id, now, store } from "@/lib/db";
import { rateLimited } from "@/lib/ratelimit";
import { onCheckoutStarted } from "@/lib/growth/core";

/** A buyer entered their details at checkout but hasn't paid yet → Leads › Drop-Offs. Cleared on purchase. */
export async function POST(req: Request) {
  if (await rateLimited("dropoff", 20)) return NextResponse.json({ ok: false }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ ok: false });
  const mango = await store.get("mangoes", String(body.mangoId || ""));
  if (!mango || !mango.active) return NextResponse.json({ ok: true });
  await store.tx(async (t) => {
    const [existing] = await t.find("leads", [["userId", mango.userId], ["type", "dropoff"], ["email", email], ["mango", mango.title]], { limit: 1 });
    if (existing) t.update("leads", existing.id, { createdAt: now() });
    else t.set("leads", id(), { userId: mango.userId, createdAt: now(), type: "dropoff", name: String(body.name || "").trim().slice(0, 80) || email, email, phone: "", mango: mango.title, pageTitle: "Checkout" });
  });
  await onCheckoutStarted(String(mango.userId), mango.id, { name: String(body.name || ""), email }).catch(() => {});
  return NextResponse.json({ ok: true });
}
