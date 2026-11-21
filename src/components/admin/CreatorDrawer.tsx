"use client";
import { useState } from "react";
import { inr, toast } from "@/lib/client";
import { adminAct, useAdminData } from "@/lib/adminClient";
import type { ACreatorDetail } from "@/lib/adminTypes";
import { PLAN_LABEL, PLAN_ORDER, type Plan } from "@/components/dash/nav";
import { Btn, Drawer, Field, Modal, Pill, Toggle, areaCls, inputCls } from "@/components/dash/kit";
import { Initial, PlanBadge, day, when } from "./ui";

function Section({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "danger" }) {
  return (
    <section className={`rounded-[10px] border p-4 ${tone === "danger" ? "border-[#ffccc7] bg-[#fff8f7]" : "border-[#ededed]"}`}>
      <p className={`mb-3 text-[13px] font-semibold uppercase tracking-wide ${tone === "danger" ? "text-[#cf1322]" : "text-[#6b6b7b]"}`}>{title}</p>
      {children}
    </section>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-lg bg-[#f7f7f8] px-3 py-2.5"><p className="text-[11px] text-[#6b6b7b]">{label}</p><p className="text-[16px] font-semibold">{value}</p></div>;
}

export default function CreatorDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, loading, error } = useAdminData<ACreatorDetail>(`/api/admin/users/${id}`);
  const [plan, setPlan] = useState<Plan | "">("");
  const [note, setNote] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [showAcc, setShowAcc] = useState(false);
  const [busy, setBusy] = useState(false);

  const u = data?.user;
  const patch = async (body: Record<string, unknown>, ok: string) => {
    setBusy(true);
    try {
      await adminAct("PATCH", `/api/admin/users/${id}`, body);
      toast(ok);
      return true;
    } catch (e) {
      toast((e as Error).message, "err");
      return false;
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer title={u ? u.name : "Creator"} onClose={onClose} width="max-w-[720px]">
      {error && !data ? <p className="text-[14px] text-[#cf1322]">{error}</p> : loading || !u || !data ? (
        <div className="space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-[#f2f2f2]" />)}</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Initial name={u.name} size={56} />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-[20px] font-semibold">{u.name} <PlanBadge plan={u.plan} />{u.isAdmin && <Pill tone="blue">Admin</Pill>}{u.suspended && <Pill tone="red">Suspended</Pill>}</p>
              <p className="truncate text-[13px] text-[#6b6b7b]">{u.email} · +91 {u.phone}</p>
              <p className="text-[12px] text-[#9b9bab]">Joined {day(u.createdAt)} · last login {u.lastLogin ? when(u.lastLogin) : "never"} · {data.sessions} active session(s)</p>
            </div>
          </div>

          {u.suspended && <div className="rounded-lg bg-[#fff2f0] px-4 py-3 text-[13px] text-[#cf1322]"><b>Suspended:</b> {u.suspendReason}</div>}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Mini label="Orders" value={u.stats.orders} />
            <Mini label="GMV" value={inr(u.stats.gmv)} />
            <Mini label="Commission" value={inr(u.stats.commission)} />
            <Mini label="Refunded" value={u.stats.refunded} />
            <Mini label="Mangoes" value={`${u.stats.mangoes}`} />
          </div>

          <Section title="Plan">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[180px] flex-1">
                <select className={inputCls} value={plan || u.plan} onChange={(e) => setPlan(e.target.value as Plan)} aria-label="Plan">
                  {PLAN_ORDER.map((p) => <option key={p} value={p}>{PLAN_LABEL[p]}</option>)}
                </select>
              </div>
              <Btn disabled={busy || !plan || plan === u.plan} onClick={async () => { if (await patch({ plan }, `Plan changed to ${PLAN_LABEL[plan as Plan]}`)) setPlan(""); }}>Apply</Btn>
            </div>
            <p className="mt-2 text-[12px] text-[#9b9bab]">Recorded as a ₹0 “granted by admin” invoice. The creator is notified.</p>
          </Section>

          <Section title="Verification & features">
            <div className="space-y-3 text-[14px]">
              {data.user.kyc && (
                <div className="rounded-lg bg-[#f7f7f8] px-3 py-2.5 text-[13px]">
                  <p>KYC submission: <b>{data.user.kyc.status}</b> · {data.user.kyc.legalName} · PAN {data.user.kyc.pan}</p>
                  {data.user.kyc.status === "pending" && (
                    <div className="mt-2 flex gap-2">
                      <Btn disabled={busy} onClick={() => patch({ kyc: "approve" }, "KYC verified")}>Approve</Btn>
                      <Btn variant="outline" disabled={busy} onClick={() => { const n = window.prompt("Reason for rejecting?"); if (n?.trim()) patch({ kyc: "reject", kycNote: n }, "KYC rejected"); }}>Reject</Btn>
                    </div>
                  )}
                </div>
              )}
              <label className="flex items-center justify-between gap-3">KYC verified<Toggle on={u.kycDone} disabled={busy} onChange={(v) => patch({ kycDone: v }, v ? "KYC verified" : "KYC revoked")} label="KYC verified" /></label>
              <label className="flex items-center justify-between gap-3">Freedom Setup (custom domain)<Toggle on={u.whiteLabel} disabled={busy} onChange={(v) => patch({ whiteLabel: v }, v ? "Freedom Setup granted" : "Freedom Setup removed")} label="Freedom Setup" /></label>
              <div className="rounded-lg bg-[#f7f7f8] px-3 py-2.5 text-[13px]">
                {data.user.bank ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>{data.user.bank.holder} · A/C {showAcc ? data.user.bank.account : `••••${data.user.bank.account.slice(-4)}`} · {data.user.bank.ifsc}</span>
                    <button className="text-[#1677ff]" onClick={() => setShowAcc(!showAcc)}>{showAcc ? "Hide" : "Reveal"}</button>
                  </div>
                ) : <span className="text-[#9b9bab]">No bank account added</span>}
              </div>
            </div>
          </Section>

          <Section title="Account status">
            {u.isAdmin ? <p className="text-[13px] text-[#6b6b7b]">Admin accounts can&apos;t be suspended or deleted.</p> : u.suspended ? (
              <Btn variant="outline" disabled={busy} onClick={() => patch({ suspended: false }, "Creator reinstated")}>Reinstate creator</Btn>
            ) : (
              <>
                <Btn variant="danger" onClick={() => { setReason(""); setSuspendOpen(true); }}>Suspend creator…</Btn>
                <p className="mt-2 text-[12px] text-[#9b9bab]">Signs them out everywhere, blocks login, and takes their checkout, storefront and pages offline.</p>
              </>
            )}
          </Section>

          <Section title="Internal note (only admins see this)">
            <textarea className={`${areaCls} min-h-20`} value={note ?? u.adminNote} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Verified GST on call, 12 Nov" />
            <Btn variant="soft" className="mt-2" disabled={busy || note === null || note === u.adminNote} onClick={async () => { if (await patch({ adminNote: note }, "Note saved")) setNote(null); }}>Save note</Btn>
          </Section>

          <Section title="Message the creator">
            <textarea className={`${areaCls} min-h-16`} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Shows in their notification bell" maxLength={500} />
            <Btn variant="soft" className="mt-2" disabled={busy || !msg.trim()} onClick={async () => { if (await patch({ notify: msg }, "Message sent")) setMsg(""); }}>Send message</Btn>
          </Section>

          <Section title={`Recent orders (${data.orders.length})`}>
            {data.orders.length === 0 ? <p className="text-[13px] text-[#9b9bab]">No orders yet</p> : (
              <div className="divide-y divide-[#f0f0f0] text-[13px]">
                {data.orders.map((o) => <div key={o.id} className="flex items-center justify-between gap-3 py-2"><span className="min-w-0 truncate">{o.customer} · {o.mango}</span><span className="flex items-center gap-2"><b>{inr(o.amount)}</b><Pill tone={o.status === "Success" ? "green" : o.status === "Refunded" ? "red" : "orange"}>{o.status}</Pill></span></div>)}
              </div>
            )}
          </Section>

          <Section title={`Withdrawals (${data.withdrawals.length})`}>
            {data.withdrawals.length === 0 ? <p className="text-[13px] text-[#9b9bab]">None</p> : (
              <div className="divide-y divide-[#f0f0f0] text-[13px]">
                {data.withdrawals.map((w) => <div key={w.id} className="flex items-center justify-between py-2"><span>{day(w.createdAt)}</span><span className="flex items-center gap-2"><b>{inr(w.amount)}</b><Pill tone={w.status === "Paid" ? "green" : w.status === "Rejected" ? "red" : "orange"}>{w.status}</Pill></span></div>)}
              </div>
            )}
          </Section>

          <Section title={`Mangoes (${data.mangoes.length}) · ${data.courses} courses · ${data.workshops} workshops`}>
            {data.mangoes.length === 0 ? <p className="text-[13px] text-[#9b9bab]">None</p> : (
              <div className="divide-y divide-[#f0f0f0] text-[13px]">
                {data.mangoes.map((m) => <div key={m.id} className="flex items-center justify-between py-2"><span className="truncate">{m.title}</span><span className="flex items-center gap-2 text-[#6b6b7b]">{m.type === "Free" ? "Free" : inr(m.price)}<Pill tone={m.active ? "green" : "grey"}>{m.active ? "Active" : "Off"}</Pill></span></div>)}
              </div>
            )}
          </Section>

          {!u.isAdmin && (
            <Section title="Danger zone" tone="danger">
              <Btn variant="danger" onClick={() => { setTyped(""); setDeleteOpen(true); }}>Delete creator and all data…</Btn>
            </Section>
          )}
        </div>
      )}

      {suspendOpen && u && (
        <Modal title={`Suspend ${u.name}?`} onClose={() => setSuspendOpen(false)}>
          <Field label="Reason (saved in the audit log)" required><textarea autoFocus className={`${areaCls} min-h-20`} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} /></Field>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={() => setSuspendOpen(false)}>Cancel</Btn>
            <Btn variant="danger" disabled={busy || !reason.trim()} onClick={async () => { if (await patch({ suspended: true, reason }, "Creator suspended")) setSuspendOpen(false); }}>Suspend</Btn>
          </div>
        </Modal>
      )}

      {deleteOpen && u && (
        <Modal title="Delete creator permanently?" onClose={() => setDeleteOpen(false)}>
          <p className="text-[14px] text-[#4a4a59]">This removes <b>{u.name}</b>, their orders, mangoes, courses, customers and uploaded files. It can&apos;t be undone.</p>
          <Field label={<>Type <code className="rounded bg-[#f2f2f2] px-1">{u.email}</code> to confirm</>}><input autoFocus className={inputCls} value={typed} onChange={(e) => setTyped(e.target.value)} /></Field>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Btn>
            <Btn variant="danger" disabled={busy || typed.trim().toLowerCase() !== u.email.toLowerCase()} onClick={async () => {
              setBusy(true);
              try { await adminAct("DELETE", `/api/admin/users/${id}?confirm=${encodeURIComponent(typed.trim())}`); toast("Creator deleted"); onClose(); }
              catch (e) { toast((e as Error).message, "err"); }
              finally { setBusy(false); }
            }}>Delete forever</Btn>
          </div>
        </Modal>
      )}
    </Drawer>
  );
}
