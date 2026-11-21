"use client";
import { useMemo, useState } from "react";
import { copy, downloadCsv, inr, toast } from "@/lib/client";
import { adminAct, useAdminData } from "@/lib/adminClient";
import type { AWithdrawal } from "@/lib/adminTypes";
import { Btn, DataTable, EmptySearch, Field, Modal, Panel, Pill, Search, StatCard, Tabs, inputCls, type Col } from "@/components/dash/kit";
import { ErrorBox, PageHead, when } from "@/components/admin/ui";

type Tab = "Processing" | "Paid" | "Rejected" | "All";

export default function Withdrawals() {
  const { data, loading, error, reload } = useAdminData<{ withdrawals: AWithdrawal[] }>("/api/admin/withdrawals");
  const [tab, setTab] = useState<Tab>("Processing");
  const [q, setQ] = useState("");
  const [act, setAct] = useState<{ w: AWithdrawal; to: "Paid" | "Rejected" | "Processing" } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const all = useMemo(() => data?.withdrawals || [], [data]);
  const sum = (s: string) => all.filter((w) => w.status === s).reduce((a, w) => a + w.amount, 0);
  const rows = useMemo(() => all.filter((w) => tab === "All" || w.status === tab).filter((w) => `${w.creator} ${w.creatorEmail} ${w.holder}`.toLowerCase().includes(q.toLowerCase())), [all, tab, q]);

  async function submit() {
    if (!act) return;
    if (act.to === "Rejected" && !note.trim()) return toast("Enter a reason for rejecting", "err");
    setBusy(true);
    try {
      await adminAct("PATCH", `/api/admin/withdrawals/${act.w.id}`, { status: act.to, note });
      toast(act.to === "Paid" ? "Marked as paid — creator notified" : act.to === "Rejected" ? "Withdrawal rejected — amount returned to balance" : "Moved back to processing");
      setAct(null);
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  const cols: Col<AWithdrawal>[] = [
    { key: "d", label: "Requested", render: (w) => <span className="whitespace-nowrap">{when(w.createdAt)}</span>, sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { key: "c", label: "Creator", render: (w) => <div><p className="font-medium">{w.creator}</p><p className="text-[12px] text-[#6b6b7b]">{w.creatorEmail}</p></div> },
    { key: "amt", label: "Amount", render: (w) => <b className="text-[15px]">{inr(w.amount)}</b>, sort: (a, b) => a.amount - b.amount },
    {
      key: "bank",
      label: "Pay to",
      render: (w) => (
        <div className="text-[13px]">
          <p>{w.holder || "—"}</p>
          <button className="text-left text-[#1677ff] hover:underline" title="Copy account number" onClick={() => copy(w.account, "Account number")}>A/C {w.account || "—"}</button>
          <p className="text-[12px] text-[#6b6b7b]">{w.ifsc}</p>
        </div>
      ),
    },
    { key: "kyc", label: "KYC", render: (w) => (w.kycDone ? <Pill>Verified</Pill> : <Pill tone="red">Not verified</Pill>) },
    { key: "s", label: "Status", render: (w) => <div><Pill tone={w.status === "Paid" ? "green" : w.status === "Rejected" ? "red" : "orange"}>{w.status}</Pill>{w.adminNote && <p className="mt-1 max-w-[180px] truncate text-[11px] text-[#6b6b7b]" title={w.adminNote}>{w.adminNote}</p>}</div> },
    {
      key: "a",
      label: "Actions",
      render: (w) =>
        w.status === "Processing" ? (
          <div className="flex gap-1.5">
            <Btn className="h-8 px-3 text-[13px]" onClick={() => { setNote(""); setAct({ w, to: "Paid" }); }}>Mark paid</Btn>
            <Btn variant="danger" className="h-8 px-3 text-[13px]" onClick={() => { setNote(""); setAct({ w, to: "Rejected" }); }}>Reject</Btn>
          </div>
        ) : (
          <Btn variant="outline" className="h-8 px-3 text-[13px]" onClick={() => { setNote(""); setAct({ w, to: "Processing" }); }}>Reopen</Btn>
        ),
    },
  ];

  if (error && !data) return <ErrorBox message={error} retry={reload} />;

  return (
    <>
      <PageHead title="Withdrawals" sub="Review payout requests, transfer the money to the creator's bank account, then mark them paid." right={<Btn variant="outline" icon="download" disabled={!rows.length} onClick={() => downloadCsv("withdrawals.csv", ["Requested", "Creator", "Email", "Amount", "Holder", "Account", "IFSC", "Status", "Note"], rows.map((w) => [w.createdAt, w.creator, w.creatorEmail, w.amount, w.holder, w.account, w.ifsc, w.status, w.adminNote || ""]))}>Export CSV</Btn>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <StatCard icon="download" label="Awaiting payout" value={inr(sum("Processing"))} sub={`${all.filter((w) => w.status === "Processing").length} requests`} />
        <StatCard icon="check" label="Paid out" value={inr(sum("Paid"))} sub={`${all.filter((w) => w.status === "Paid").length} requests`} delay={0.04} />
        <StatCard icon="close" label="Rejected" value={inr(sum("Rejected"))} sub={`${all.filter((w) => w.status === "Rejected").length} requests`} delay={0.08} />
      </div>
      <Panel className="p-5">
        <Tabs tabs={["Processing", "Paid", "Rejected", "All"]} value={tab} onChange={setTab} />
        <div className="mt-4 flex"><Search value={q} onChange={setQ} placeholder="Search by creator or account holder" /></div>
        <div className="mt-3"><DataTable cols={cols} rows={rows} loading={loading} empty={<EmptySearch title={tab === "Processing" ? "No withdrawals waiting" : "Nothing here"} text={tab === "Processing" ? "New payout requests from creators appear here." : undefined} />} /></div>
      </Panel>

      {act && (
        <Modal title={act.to === "Paid" ? "Mark as paid" : act.to === "Rejected" ? "Reject withdrawal" : "Reopen withdrawal"} onClose={() => setAct(null)}>
          <div className="rounded-lg bg-[#f7f7f8] p-3 text-[13px]">
            <p><b>{inr(act.w.amount)}</b> to {act.w.holder || act.w.creator}</p>
            <p className="text-[#6b6b7b]">A/C {act.w.account} · {act.w.ifsc}</p>
          </div>
          {act.to === "Paid" && !act.w.kycDone && <p className="mt-3 rounded-lg bg-[#fff2f0] px-3 py-2 text-[13px] text-[#cf1322]">This creator hasn&apos;t completed KYC. Verify them from the Creators page first — paying out is blocked until then.</p>}
          {act.to !== "Processing" && (
            <div className="mt-4">
              <Field label={act.to === "Paid" ? "Bank reference / UTR (optional)" : "Reason (shown to the creator)"} required={act.to === "Rejected"}>
                <input autoFocus className={inputCls} value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder={act.to === "Paid" ? "e.g. UTR 4032xxxxxx" : "e.g. Account name doesn't match KYC"} />
              </Field>
            </div>
          )}
          {act.to === "Processing" && <p className="mt-3 text-[13px] text-[#4a4a59]">Moves it back to the queue. {act.w.status === "Rejected" ? "The amount is deducted from the creator's balance again." : ""}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={() => setAct(null)}>Cancel</Btn>
            <Btn variant={act.to === "Rejected" ? "danger" : "orange"} disabled={busy} onClick={submit}>{busy ? "Saving…" : act.to === "Paid" ? "Confirm payout" : act.to === "Rejected" ? "Reject" : "Reopen"}</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}
