import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/ratelimit";
import { onCheckoutStarted } from "@/lib/growth/core";
import { getCoach } from "@/lib/coach/server";
import { createOrder, razorpayConfigured } from "@/lib/coach/razorpay";

/**
 * Start paying for the programme. The amount always comes from the programme mango on the server.
 * With Razorpay keys → a Razorpay order for Checkout. Without → { test: true } and the page uses the test checkout.
 */
export async function POST(req: Request) {
  if (await rateLimited("coach-order", 10)) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || "").trim().slice(0, 80);
  const email = String(b.email || "").trim().toLowerCase().slice(0, 120);
  const phone = String(b.whatsapp || b.phone || "").replace(/\D/g, "").slice(-10);
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter your name and a valid email" }, { status: 400 });

  const coach = await getCoach();
  if (!coach.creatorId || !coach.mangoId || coach.amount == null) {
    return NextResponse.json({ error: "Enrolment isn't open yet: choose the programme mango in Growth settings." }, { status: 503 });
  }
  await onCheckoutStarted(coach.creatorId, coach.mangoId, { name, email, phone }).catch(() => {});

  if (!razorpayConfigured()) return NextResponse.json({ test: true, mangoId: coach.mangoId, amount: coach.amount });

  try {
    const order = await createOrder(coach.amount, { creatorId: coach.creatorId, mangoId: coach.mangoId, name, email, phone, gstin: String(b.gstin || "").slice(0, 20) });
    return NextResponse.json({ keyId: process.env.RAZORPAY_KEY_ID, id: order.id, amount: order.amount, currency: order.currency, programme: coach.programme.name, prefill: { name, email, contact: phone } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
