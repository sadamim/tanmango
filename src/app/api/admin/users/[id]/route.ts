import { NextResponse } from "next/server";
import { asUser, id as newId, loadSnap, now, PLANS, sha, store, type Plan } from "@/lib/db";
import { ROW_COLLECTIONS } from "@/lib/collections";
import { fileStorage } from "@/lib/store/files";
import { deny, isAdminEmail, logAudit, notify, requireAdmin } from "@/lib/admin";
import { invoiceView, orderView, publicUser, rowsOf, statsByUser, withdrawalView } from "@/lib/adminData";
import type { ACreatorDetail } from "@/lib/adminTypes";

type Ctx = { params: Promise<{ id: string }> };
const desc = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return deny();
  const { id } = await params;
  const db = await loadSnap(["sales", "withdrawals", "mangoes", "invoices", "courses", "workshops"], { sessions: true });
  const u = db.users.find((x) => x.id === id);
  if (!u) return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  const out: ACreatorDetail = {
    user: { ...publicUser(db, u, statsByUser(db)), bank: u.bank, kyc: u.kyc },
    orders: rowsOf(db, "sales").filter((s) => s.userId === id).sort(desc).slice(0, 8).map((s) => orderView(db, s)),
    withdrawals: rowsOf(db, "withdrawals").filter((w) => w.userId === id).sort(desc).slice(0, 8).map((w) => withdrawalView(db, w)),
    mangoes: rowsOf(db, "mangoes").filter((m) => m.userId === id).map((m) => ({ id: m.id, title: String(m.title), price: Number(m.price || 0), type: String(m.type || ""), active: Boolean(m.active) })),
    invoices: rowsOf(db, "invoices").filter((i) => i.userId === id).sort(desc).slice(0, 8).map((i) => invoiceView(db, i)),
    sessions: db.sessions.filter((s) => s.userId === id).length,
    courses: rowsOf(db, "courses").filter((c) => c.userId === id).length,
    workshops: rowsOf(db, "workshops").filter((w) => w.userId === id).length,
  };
  return NextResponse.json(out);
}

/** Admin edits: plan, suspended(+reason), kyc review, whiteLabel, adminNote, notify (send a message). */
export async function PATCH(req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return deny();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    await store.tx(async (t) => {
      const raw = await t.get("users", id);
      if (!raw) throw new Error("Creator not found");
      const u = asUser(raw);
      const patch: Record<string, unknown> = {};
      const changes: string[] = [];

      if (body.plan !== undefined) {
        if (!(PLANS as readonly string[]).includes(body.plan)) throw new Error("Unknown plan");
        const plan = body.plan as Plan;
        if (plan !== (u.plan || "basic")) {
          changes.push(`plan ${u.plan || "basic"} → ${plan}`);
          patch.plan = plan;
          // Plan changes made by an admin are recorded as a ₹0 "granted" invoice so they never count as revenue.
          t.set("invoices", newId(), { userId: u.id, createdAt: now(), number: `TM-${Date.now().toString().slice(-8)}`, product: `${plan[0].toUpperCase() + plan.slice(1)} plan`, amount: 0, status: "Granted by admin" });
          notify(t, u.id, `Your plan was changed to ${plan[0].toUpperCase() + plan.slice(1)} by TagMango.`);
        }
      }
      if (typeof body.suspended === "boolean" && body.suspended !== Boolean(u.suspended)) {
        if (isAdminEmail(u.email) || u.id === admin.id) throw new Error("Admin accounts can't be suspended");
        const reason = String(body.reason || "").trim().slice(0, 200);
        if (body.suspended && !reason) throw new Error("Enter a reason for the suspension");
        patch.suspended = body.suspended;
        patch.suspendReason = body.suspended ? reason : undefined;
        if (body.suspended) for (const s of await t.find("sessions", [["userId", u.id]])) t.delete("sessions", s.id); // sign them out everywhere
        else notify(t, u.id, "Your account has been reinstated.");
        changes.push(body.suspended ? `suspended (${reason})` : "reinstated");
      }
      // KYC review: approve / reject a submission, or revoke a verified one
      if (body.kyc === "approve" || body.kyc === "reject" || body.kyc === "revoke") {
        const note = String(body.kycNote || "").trim().slice(0, 200);
        if (body.kyc !== "approve" && !note) throw new Error("Enter a reason");
        if (body.kyc === "approve") {
          if (!u.kyc && !u.kycDone) throw new Error("This creator hasn't submitted KYC details");
          patch.kycDone = true;
          if (u.kyc) patch.kyc = { ...u.kyc, status: "verified", reviewedAt: now(), note: undefined };
          changes.push("KYC verified");
          notify(t, u.id, "Your KYC has been verified.");
        } else {
          patch.kycDone = false;
          if (u.kyc) patch.kyc = { ...u.kyc, status: "rejected", reviewedAt: now(), note };
          changes.push(`KYC ${body.kyc === "reject" ? "rejected" : "revoked"} (${note})`);
          notify(t, u.id, `Your KYC was ${body.kyc === "reject" ? "rejected" : "revoked"}: ${note}. Please resubmit your details under Withdrawals.`);
        }
      } else if (typeof body.kycDone === "boolean" && body.kycDone !== Boolean(u.kycDone)) {
        patch.kycDone = body.kycDone;
        if (u.kyc) patch.kyc = { ...u.kyc, status: body.kycDone ? "verified" : "rejected", reviewedAt: now() };
        changes.push(`KYC ${body.kycDone ? "verified" : "revoked"}`);
        notify(t, u.id, body.kycDone ? "Your KYC has been verified." : "Your KYC was revoked. Please resubmit your details under Withdrawals.");
      }
      if (typeof body.whiteLabel === "boolean" && body.whiteLabel !== Boolean(u.whiteLabel)) {
        patch.whiteLabel = body.whiteLabel;
        changes.push(`Freedom Setup ${body.whiteLabel ? "granted" : "removed"}`);
      }
      if (typeof body.adminNote === "string" && body.adminNote !== (u.adminNote || "")) {
        patch.adminNote = body.adminNote.slice(0, 1000);
        changes.push("internal note updated");
      }
      if (typeof body.notify === "string" && body.notify.trim()) {
        notify(t, u.id, `📩 ${body.notify.trim().slice(0, 500)}`);
        changes.push("message sent");
      }
      if (Object.keys(patch).length) t.update("users", u.id, patch);
      if (changes.length) logAudit(t, admin, "creator.update", `${u.name} <${u.email}>`, changes.join("; "));
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

/** Permanently delete a creator and everything they own. Requires ?confirm=<their email>. */
export async function DELETE(req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return deny();
  const { id } = await params;
  const confirm = (new URL(req.url).searchParams.get("confirm") || "").trim().toLowerCase();
  try {
    const u = await store.tx(async (t) => {
      const raw = await t.get("users", id);
      if (!raw) throw new Error("Creator not found");
      const u = asUser(raw);
      if (isAdminEmail(u.email) || u.id === admin.id) throw new Error("Admin accounts can't be deleted");
      if (confirm !== u.email.toLowerCase()) throw new Error("Type the creator's email to confirm");
      t.delete("users", id);
      t.delete("claims", sha(`email:${u.email}`));
      t.delete("claims", sha(`phone:${u.phone}`));
      t.delete("otps", sha(`otp:phone:${u.phone}`));
      t.delete("otps", sha(`otp:email:${u.email}`));
      logAudit(t, admin, "creator.delete", `${u.name} <${u.email}>`, "account and all data removed");
      return u;
    });
    // bulk clean-up happens outside the transaction (it can touch thousands of documents)
    await store.deleteWhere("sessions", [["userId", u.id]]);
    for (const c of ROW_COLLECTIONS) await store.deleteWhere(c, [["userId", u.id]]);
    await fileStorage().removeAllFor(u.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
