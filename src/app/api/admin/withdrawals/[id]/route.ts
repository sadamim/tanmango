import { NextResponse } from "next/server";
import { asUser, now, store } from "@/lib/db";
import { deny, logAudit, notify, requireAdmin } from "@/lib/admin";

const STATUSES = ["Processing", "Paid", "Rejected"];

/** Approve (mark paid, with a bank reference) or reject a payout request. Rejected requests return to the creator's balance. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return deny();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const note = String(body.note || "").trim().slice(0, 200);
  if (body.status === "Rejected" && !note) return NextResponse.json({ error: "Enter a reason for rejecting this withdrawal" }, { status: 400 });
  try {
    await store.tx(async (t) => {
      const w = await t.get("withdrawals", id);
      if (!w) throw new Error("Withdrawal not found");
      const uRaw = await t.get("users", String(w.userId));
      const u = uRaw ? asUser(uRaw) : null;
      if (body.status === "Paid" && !(u?.kycDone || u?.kyc?.status === "verified")) throw new Error("This creator hasn't completed KYC — verify them before paying out");
      const before = String(w.status || "Processing");
      if (before === body.status) throw new Error(`Already ${before.toLowerCase()}`);
      if (before === "Paid") throw new Error("A paid withdrawal can't be changed");
      t.update("withdrawals", id, { status: body.status, adminNote: note || undefined, processedAt: body.status === "Processing" ? undefined : now(), processedBy: admin.email });
      const amt = `₹${Number(w.amount || 0).toLocaleString("en-IN")}`;
      if (body.status === "Paid") notify(t, String(w.userId), `Your withdrawal of ${amt} has been paid${note ? ` (ref: ${note})` : ""}.`);
      if (body.status === "Rejected") notify(t, String(w.userId), `Your withdrawal of ${amt} was rejected: ${note}. The amount is back in your balance.`);
      logAudit(t, admin, `withdrawal.${body.status.toLowerCase()}`, `${u?.name || "creator"} · ${amt}`, note || `was ${before}`);
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
