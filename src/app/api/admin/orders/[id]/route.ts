import { NextResponse } from "next/server";
import { now, store } from "@/lib/db";
import { deny, logAudit, notify, requireAdmin } from "@/lib/admin";
import { fireFlow, findLead, upsertLead } from "@/lib/growth/core";
import { razorpayConfigured, refundPayment } from "@/lib/coach/razorpay";

/**
 * Refund an order (or restore it).
 * Razorpay orders (they carry `paymentId`) are refunded through Razorpay first; if that fails nothing changes.
 * A refunded programme order also pauses the learner's portal access and sends the "Refund processed"
 * email + WhatsApp. Restoring re-opens the portal.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return deny();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body.status !== "Refunded" && body.status !== "Success") return NextResponse.json({ error: "Status must be Refunded or Success" }, { status: 400 });

  const sale = await store.get("sales", id);
  if (!sale) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (sale.status === body.status) return NextResponse.json({ error: `Order is already ${String(sale.status).toLowerCase()}` }, { status: 400 });

  // 1. Move the money first (Razorpay orders only).
  let refundId: string | undefined;
  if (body.status === "Refunded" && sale.paymentId && razorpayConfigured()) {
    try {
      const amt = Number(body.amount) > 0 ? Math.min(Number(body.amount), Number(sale.amount || 0)) : undefined;
      refundId = (await refundPayment(String(sale.paymentId), amt)).id;
    } catch (e) {
      return NextResponse.json({ error: `Razorpay refund failed: ${(e as Error).message}` }, { status: 502 });
    }
  }

  try {
    await store.tx(async (t) => {
      const s = await t.get("sales", id);
      if (!s) throw new Error("Order not found");
      const before = s.status;
      t.update("sales", id, { status: body.status, updatedAt: now(), adminNote: String(body.note || "").slice(0, 200) || undefined, ...(refundId ? { refundId } : {}) });
      const amt = `₹${Number(s.amount || 0).toLocaleString("en-IN")}`;
      notify(t, String(s.userId), body.status === "Refunded" ? `Order refunded: ${String(s.customer)} · ${String(s.mango)} · ${amt}` : `Order restored: ${String(s.customer)} · ${String(s.mango)} · ${amt}`);
      logAudit(t, admin, body.status === "Refunded" ? "order.refund" : "order.restore", `${String(s.customer)} · ${String(s.mango)}`, `${amt}, was ${String(before)}${refundId ? `, Razorpay ${refundId}` : ""}`);
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  // 2. Portal access + learner confirmation (never blocks the refund itself).
  try {
    const cid = String(sale.userId);
    const email = String(sale.email || "").toLowerCase();
    const [g] = await store.find("growth", [["userId", cid]], { limit: 1 });
    if (email && g && g.programmeMango === sale.mangoId) {
      const [enr] = await store.find("enrolments", [["userId", cid], ["email", email]], { limit: 1 });
      if (enr) await store.write([{ type: "update", coll: "enrolments", id: enr.id, patch: { status: body.status === "Refunded" ? "paused" : "active" } }]);
      if (body.status === "Refunded") {
        const lead = (await findLead(cid, email)) || (await upsertLead(cid, { name: String(sale.customer || email), email, phone: String(sale.phone || "") }));
        await fireFlow(cid, "refund", lead, { key: `refund:${id}`, extra: { amount: `₹${Number(sale.amount || 0).toLocaleString("en-IN")}`, refund_id: refundId || "" } });
      }
    }
  } catch {
    /* ignore */
  }
  return NextResponse.json({ ok: true, refundId });
}
