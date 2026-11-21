import "server-only";
import crypto from "node:crypto";
import { id, now, store } from "../db";
import { automatedEmail } from "../automation";
import { onPurchase, upsertLead, mark, getGrowth } from "../growth/core";

/**
 * Razorpay, in the coach's own account. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET (test keys first, then live)
 * and RAZORPAY_WEBHOOK_SECRET. Without keys the Enrol page falls back to the existing test checkout.
 */
export const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const auth = () => "Basic " + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");

async function rzp<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: auth(), "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { error?: { description?: string } }).error?.description || `Razorpay error ${r.status}`);
  return j as T;
}

export type RzpOrder = { id: string; amount: number; currency: string; notes?: Record<string, string> };
export type RzpPayment = { id: string; order_id: string; amount: number; status: string; method?: string; email?: string; contact?: string; notes?: Record<string, string> };

export const createOrder = (amountRupees: number, notes: Record<string, string>) =>
  rzp<RzpOrder>("/orders", { amount: Math.round(amountRupees * 100), currency: "INR", receipt: `hos_${id()}`.slice(0, 40), notes });

export const fetchPayment = (paymentId: string) => rzp<RzpPayment>(`/payments/${encodeURIComponent(paymentId)}`);

export const refundPayment = (paymentId: string, amountRupees?: number) =>
  rzp<{ id: string; status: string }>(`/payments/${encodeURIComponent(paymentId)}/refund`, amountRupees ? { amount: Math.round(amountRupees * 100) } : {});

const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

/** Checkout handler signature: HMAC_SHA256(order_id|payment_id, key_secret). */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const exp = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${orderId}|${paymentId}`).digest("hex");
  return safeEq(exp, String(signature || ""));
}

/** Webhook signature: HMAC_SHA256(raw body, webhook secret). */
export function verifyWebhookSignature(raw: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const exp = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  return safeEq(exp, String(signature || ""));
}

type Buyer = { name: string; email: string; phone?: string };

/**
 * A captured payment for the programme. Idempotent (keyed on the Razorpay payment id), so the browser
 * callback and the webhook can both call it. Records the sale, emails the receipt, then onPurchase()
 * enrols the learner, creates the portal login and starts the "Payment successful" workflow.
 */
export async function recordProgrammePayment(o: { creatorId: string; mangoId: string; paymentId: string; orderId?: string; amountPaise: number; method?: string; buyer: Buyer }) {
  const amount = Math.round(o.amountPaise) / 100;
  const out = await store.tx(async (t) => {
    const dup = await t.find("sales", [["userId", o.creatorId], ["paymentId", o.paymentId]], { limit: 1 });
    if (dup.length) return { fresh: false, saleId: String(dup[0].id), title: String(dup[0].mango) };
    const mango = await t.get("mangoes", o.mangoId);
    if (!mango) throw new Error("Programme not found");
    const saleId = id();
    t.set("sales", saleId, {
      userId: o.creatorId, createdAt: now(), customer: o.buyer.name, email: o.buyer.email.toLowerCase(), phone: o.buyer.phone || "",
      mango: mango.title, mangoId: mango.id, amount, quantity: 1, cycle: "One-time", method: `Razorpay${o.method ? ` · ${o.method}` : ""}`,
      status: "Success", paymentId: o.paymentId, orderId: o.orderId, expires: null,
    });
    t.set("notifications", id(), { userId: o.creatorId, createdAt: now(), read: false, text: `New sale: ${o.buyer.name} bought ${String(mango.title)} for ₹${amount.toLocaleString("en-IN")}` });
    return { fresh: true, saleId, title: String(mango.title) };
  });
  if (out.fresh) {
    await automatedEmail(o.creatorId, "Confirmation Email on Mango Purchase", o.buyer.email, { name: o.buyer.name, mango: out.title, amount: `₹${amount.toLocaleString("en-IN")}` }, {
      subject: `Receipt: ${out.title}`,
      body: `Hi {name},\n\nThank you. We received {amount} for "{mango}".\nPayment ID: ${o.paymentId}\n\nYour portal login details follow in a separate email.\n\n— {creator}`,
    });
    await onPurchase(o.creatorId, o.mangoId, o.buyer).catch(() => {});
  }
  return out;
}

/** Payment pending or failed: mark "enrolment started", which runs the "Enrolment started but unpaid" reminders. */
export async function recordUnpaid(creatorId: string, buyer: Partial<Buyer> & { email: string }, detail: string) {
  const g = await getGrowth(creatorId);
  if (!g) return;
  const lead = await upsertLead(creatorId, { name: buyer.name, email: buyer.email, phone: buyer.phone, source: "checkout" });
  await mark(creatorId, lead.id, "enrolStarted", { detail });
}
