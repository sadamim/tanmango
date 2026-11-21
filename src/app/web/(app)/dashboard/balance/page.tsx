"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { downloadCsv, fmtDate, inr, patchMe, toast, useMe } from "@/lib/client";
import { Btn, DataTable, DateRange, Drawer, EmptySearch, Field, Panel, Pill, Segmented, Title, Updated, Walkthrough, inputCls, type Col } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";
import { inRange, useMoney } from "@/components/dash/hooks";

type Line = { id: string; createdAt: string; desc: string; debit: number; credit: number; balance: number; status: string };

function KycDrawer({ onClose }: { onClose: () => void }) {
  const { me, setMe } = useMe();
  const [pan, setPan] = useState("");
  const [legal, setLegal] = useState(me.name);
  const [holder, setHolder] = useState(me.bank?.holder || me.name);
  const [account, setAccount] = useState("");
  const [confirmAcc, setConfirmAcc] = useState("");
  const [ifsc, setIfsc] = useState(me.bank?.ifsc || "");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!me.kycDone && me.kyc?.status !== "pending") {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) return toast("Enter a valid PAN (e.g. ABCDE1234F)", "err");
      if (legal.trim().length < 3) return toast("Enter your name as on PAN", "err");
    }
    if (account || !me.bank) {
      if (account !== confirmAcc) return toast("Account numbers don't match", "err");
    }
    setBusy(true);
    try {
      const body: Record<string, unknown> = {};
      if (!me.kycDone && me.kyc?.status !== "pending") body.kyc = { pan, legalName: legal };
      if (account || !me.bank) body.bank = { holder, account, ifsc };
      const r = await patchMe(body);
      setMe(r.user);
      toast(r.user.kyc?.status === "pending" ? "Submitted — we will verify your KYC shortly" : "KYC & bank details saved");
      onClose();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer title="KYC & Bank details" onClose={onClose} footer={<Btn onClick={submit} disabled={busy}>{busy ? "Saving…" : "Submit"}</Btn>}>
      <div className="space-y-6">
        <section className="space-y-3">
          <p className="flex items-center gap-2 text-[15px] font-semibold">1. KYC verification {me.kycDone && <Pill>Verified</Pill>}{!me.kycDone && me.kyc?.status === "pending" && <Pill tone="orange">Under review</Pill>}{me.kyc?.status === "rejected" && <Pill tone="red">Rejected</Pill>}</p>
          {me.kyc?.status === "rejected" && me.kyc.note && <p className="text-[13px] text-[#cf1322]">Reason: {me.kyc.note}</p>}
          {!me.kycDone && me.kyc?.status !== "pending" && (
            <>
              <Field label="Name as on PAN" required><input className={inputCls} value={legal} onChange={(e) => setLegal(e.target.value)} /></Field>
              <Field label="PAN number" required hint="Format ABCDE1234F. Your PAN is stored securely and reviewed before payouts."><input className={`${inputCls} uppercase`} maxLength={10} placeholder="ABCDE1234F" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} /></Field>
            </>
          )}
        </section>
        <section className="space-y-3">
          <p className="flex items-center gap-2 text-[15px] font-semibold">2. Bank account {me.bank && <Pill>Added</Pill>}</p>
          {me.bank && <p className="rounded-md bg-[#f7f7f8] px-3 py-2 text-[13px]">{me.bank.holder} · A/C ••••{me.bank.account.slice(-4)} · {me.bank.ifsc}</p>}
          <Field label="Account holder name" required><input className={inputCls} value={holder} onChange={(e) => setHolder(e.target.value)} /></Field>
          <Field label="Account number" required={!me.bank}><input className={inputCls} inputMode="numeric" placeholder={me.bank ? "Leave blank to keep current" : "9–18 digits"} value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))} /></Field>
          <Field label="Confirm account number" required={!me.bank}><input className={inputCls} inputMode="numeric" value={confirmAcc} onChange={(e) => setConfirmAcc(e.target.value.replace(/\D/g, ""))} /></Field>
          <Field label="IFSC code" required><input className={`${inputCls} uppercase`} maxLength={11} placeholder="HDFC0001234" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} /></Field>
        </section>
      </div>
    </Drawer>
  );
}

function WithdrawDrawer({ max, onClose }: { max: number; onClose: () => void }) {
  const { me } = useMe();
  const { withdrawals } = useMoney();
  const [amt, setAmt] = useState("");
  return (
    <Drawer title="Request withdrawal" onClose={onClose} footer={<Btn onClick={async () => {
      const n = Number(amt);
      if (!n || n < 100) return toast("Minimum withdrawal is ₹100", "err");
      if (n > max) return toast("Amount is more than your withdrawable balance", "err");
      await withdrawals.create({ amount: n, account: me.bank!.account, status: "Processing" });
      toast("Withdrawal requested");
      onClose();
    }}>Request withdrawal</Btn>}>
      <p className="text-[14px]">Withdrawable balance: <b>{inr(max)}</b></p>
      <p className="mt-1 text-[13px] text-[#6b6b7b]">To {me.bank!.holder}, A/C ••••{me.bank!.account.slice(-4)} ({me.bank!.ifsc})</p>
      <div className="mt-4"><Field label="Amount (₹)" required><input autoFocus type="number" min={100} className={inputCls} value={amt} onChange={(e) => setAmt(e.target.value)} /></Field></div>
      <button className="mt-2 text-[13px] text-[#1677ff]" onClick={() => setAmt(String(Math.floor(max)))}>Withdraw full balance</button>
    </Drawer>
  );
}

function Inner() {
  const { me } = useMe();
  const m = useMoney();
  const params = useSearchParams();
  const [kyc, setKyc] = useState(false);
  const [wd, setWd] = useState(false);
  const [kind, setKind] = useState<"Debit" | "Credit" | "All">("All");
  const [range, setRange] = useState<[string, string]>(["", ""]);
  useEffect(() => { if (params.get("kyc") === "1") setKyc(true); }, [params]);

  const lines = useMemo(() => {
    const ev = [
      ...m.ok.map((s) => ({ id: s.id, createdAt: s.createdAt, desc: `Order — ${String(s.mango)} (${String(s.customer)})`, debit: 0, credit: m.net(s), status: Date.now() - new Date(s.createdAt).getTime() > 72 * 3600e3 ? "Settled" : "Pending (72h)" })),
      ...m.withdrawals.rows.map((w) => ({ id: w.id, createdAt: w.createdAt, desc: `Withdrawal to A/C ••••${String(w.account).slice(-4)}`, debit: Number(w.amount), credit: 0, status: String(w.status || "Processing") })),
    ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    let bal = 0;
    const out: Line[] = ev.map((e) => ({ ...e, balance: (bal += e.credit - e.debit) }));
    return out.reverse();
  }, [m]);
  const view = lines.filter((l) => (kind === "All" || (kind === "Debit" ? l.debit > 0 : l.credit > 0)) && inRange(l.createdAt, range[0], range[1]));

  const cols: Col<Line>[] = [
    { key: "d", label: "Date", render: (r) => fmtDate(r.createdAt) },
    { key: "desc", label: "Description" },
    { key: "debit", label: "Debit", render: (r) => (r.debit ? <span className="text-[#ff4d4f]">-{inr(r.debit)}</span> : "-") },
    { key: "credit", label: "Credit", render: (r) => (r.credit ? <span className="text-[#00a400]">+{inr(r.credit)}</span> : "-") },
    { key: "bal", label: "Available Balance", render: (r) => inr(r.balance) },
    { key: "s", label: "Status", render: (r) => <Pill tone={r.status === "Settled" || r.status === "Paid" ? "green" : r.status === "Rejected" ? "red" : "orange"}>{r.status}</Pill> },
  ];

  const now = new Date().toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const ready = me.kycDone && me.bank;

  return (
    <>
      <Walkthrough title="Request withdrawals" />
      <div className="mb-4"><div className="rounded-md border border-[#ffe58f] bg-[#fffbe6] px-4 py-2.5 text-[13px]"><b>Please note:</b> Earnings become Withdrawable after 72 hours due to payment gateway settlement time. And creators providing GST-based services are subject to monthly <b>GST TCS deduction</b>.</div></div>
      {!ready && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-[#2b1149] px-4 py-3 text-white">
          <span className="flex items-center gap-2 text-[14px]"><Icon name="warning" className="h-5 w-5 text-[#f2962c]" />Complete KYC and add your bank account to withdraw.</span>
          <Btn onClick={() => setKyc(true)}>Update KYC</Btn>
        </div>
      )}
      <Panel className="p-5">
        <Title right={<>{ready && <Btn variant="soft" onClick={() => setKyc(true)}>Bank details</Btn>}<Btn disabled={!m.withdrawable} onClick={() => (ready ? setWd(true) : setKyc(true))}>Request withdrawal</Btn></>}>Withdrawals</Title>
        <div className="mt-4 flex flex-wrap gap-3">
          <StatBox icon="billing" label="Total Balance" value={inr(m.total)} at={now} />
          <StatBox icon="sales" label="Withdrawable Balance" value={inr(m.withdrawable)} at={now} />
          <StatBox icon="download" label="Total Withdrawn" value={inr(m.withdrawn)} at={now} />
        </div>
      </Panel>
      <Panel className="mt-5 p-5" delay={0.06}>
        <Title>Account Statement</Title>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Segmented options={["Debit", "Credit", "All"]} value={kind} onChange={setKind} />
          <span className="text-[12px] text-[#6b6b7b]"><Updated at={m.sales.updatedAt} /></span>
          <span className="ml-auto" />
          <DateRange from={range[0]} to={range[1]} onChange={(a, b) => setRange([a, b])} />
          <Btn variant="outline" icon="download" disabled={!view.length} onClick={() => downloadCsv("account-statement.csv", ["Date", "Description", "Debit", "Credit", "Balance", "Status"], view.map((l) => [l.createdAt, l.desc, l.debit, Math.round(l.credit * 100) / 100, Math.round(l.balance * 100) / 100, l.status]))}>Download statement</Btn>
        </div>
        <div className="mt-3"><DataTable cols={cols} rows={view} loading={m.sales.loading} empty={<EmptySearch title="No withdrawals found" />} /></div>
      </Panel>
      {kyc && <KycDrawer onClose={() => setKyc(false)} />}
      {wd && <WithdrawDrawer max={m.withdrawable} onClose={() => setWd(false)} />}
    </>
  );
}

function StatBox({ icon, label, value, at }: { icon: string; label: string; value: string; at: string }) {
  return (
    <div className="animate-rise flex min-w-[220px] flex-1 items-center gap-3 rounded-[10px] border border-[#ededed] p-4">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#fdefdf] text-[#f2962c]"><Icon name={icon} className="h-5 w-5" /></span>
      <div><p className="text-[12px] text-[#6b6b7b]">{label}</p><p className="text-[22px] font-semibold text-[#f2962c]">{value}</p><p className="text-[11px] text-[#9b9bab]">Updated on {at}</p></div>
    </div>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
