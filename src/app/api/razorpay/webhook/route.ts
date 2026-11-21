import { NextResponse } from "next/server";
import { recordProgrammePayment, recordUnpaid, verifyWebhookSignature, type RzpPayment } from "@/lib/coach/razorpay";

/**
 * Razorpay webhook (Dashboard › Settings › Webhooks): URL https://<your-domain>/api/razorpay/webhook,
 * secret = RAZORPAY_WEBHOOK_SECRET, events: payment.captured, payment.failed.
 * A captured payment triggers enrolment, the welcome flows and the portal account even if the buyer closed the tab.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature") || "")) return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  const evt = JSON.parse(raw) as { event?: string; payload?: { payment?: { entity?: RzpPayment } } };
  const p = evt.payload?.payment?.entity;
  const n = p?.notes || {};
  if (!p || !n.creatorId || !n.mangoId) return NextResponse.json({ ok: true, ignored: true });
  const buyer = { name: n.name || p.email || "Learner", email: (n.email || p.email || "").toLowerCase(), phone: n.phone || p.contact || "" };
  try {
    if (evt.event === "payment.captured") {
      await recordProgrammePayment({ creatorId: n.creatorId, mangoId: n.mangoId, paymentId: p.id, orderId: p.order_id, amountPaise: p.amount, method: p.method, buyer });
    } else if (evt.event === "payment.failed") {
      await recordUnpaid(n.creatorId, buyer, "payment failed");
    }
  } catch (e) {
    // 500 makes Razorpay retry later
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
