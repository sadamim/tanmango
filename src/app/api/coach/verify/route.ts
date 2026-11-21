import { NextResponse } from "next/server";
import { fetchPayment, razorpayConfigured, recordProgrammePayment, recordUnpaid, verifyCheckoutSignature } from "@/lib/coach/razorpay";

/**
 * Called by the Enrol page after Razorpay Checkout returns. Checks the signature, re-reads the payment from
 * Razorpay (never trusting the browser), then records it. The webhook does the same, so either may arrive first.
 */
export async function POST(req: Request) {
  if (!razorpayConfigured()) return NextResponse.json({ error: "Razorpay isn't configured" }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const orderId = String(b.razorpay_order_id || "");
  const paymentId = String(b.razorpay_payment_id || "");
  if (!verifyCheckoutSignature(orderId, paymentId, String(b.razorpay_signature || ""))) return NextResponse.json({ error: "Payment could not be verified" }, { status: 400 });

  try {
    const p = await fetchPayment(paymentId);
    const n = p.notes || {};
    if (!n.creatorId || !n.mangoId) return NextResponse.json({ error: "Unknown order" }, { status: 400 });
    const buyer = { name: n.name || p.email || "Learner", email: (n.email || p.email || "").toLowerCase(), phone: n.phone || p.contact || "" };
    if (p.status === "captured" || p.status === "authorized") {
      const r = await recordProgrammePayment({ creatorId: n.creatorId, mangoId: n.mangoId, paymentId: p.id, orderId: p.order_id, amountPaise: p.amount, method: p.method, buyer });
      return NextResponse.json({ ok: true, status: "paid", saleId: r.saleId, paymentId: p.id });
    }
    await recordUnpaid(n.creatorId, buyer, `payment ${p.status}`);
    return NextResponse.json({ ok: true, status: p.status === "failed" ? "failed" : "pending", paymentId: p.id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
