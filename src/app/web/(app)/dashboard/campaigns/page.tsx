"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { fmtDateTime, toast, useCollection, useMe, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, DateRange, EmptySearch, Modal, Panel, Pill, RowAction, Search, Tabs, Title, Walkthrough, type Col } from "@/components/dash/kit";
import { FormDrawer } from "@/components/dash/forms";
import { Icon } from "@/components/dash/icons";
import { inRange, useCustomers, useMangoTitles } from "@/components/dash/hooks";
import { isLocked } from "@/components/dash/nav";

type Kind = "Email" | "WhatsApp" | "Notification";

function Inner() {
  const { me } = useMe();
  const col = useCollection("broadcasts");
  const unsub = useCollection("unsubscribed");
  const { list: customers } = useCustomers();
  const mangoes = useMangoTitles();
  const params = useSearchParams();
  const [tab, setTab] = useState<"Published" | "Templates">("Published");
  const [q, setQ] = useState("");
  const [range, setRange] = useState<[string, string]>(["", ""]);
  const [choose, setChoose] = useState(false);
  const [compose, setCompose] = useState<{ kind: Kind; init?: Row } | null>(null);
  const [view, setView] = useState<Row | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  useEffect(() => { if (params.get("new") === "1") setChoose(true); }, [params]);

  const published = col.rows.filter((b) => !b.isTemplate);
  const sum = (k: Kind) => published.filter((b) => b.kind === k).length;
  const rows = useMemo(() => col.rows.filter((b) => (tab === "Templates" ? b.isTemplate : !b.isTemplate)).filter((b) => String(b.name).toLowerCase().includes(q.toLowerCase())).filter((b) => inRange(String(b.sendAt || b.createdAt), range[0], range[1])), [col.rows, tab, q, range]);

  const audience = (ms: string[]) => {
    const blocked = new Set(unsub.rows.map((u) => String(u.email)));
    return new Set(customers.filter((c) => c.status === "Active" && (!ms.length || ms.includes(c.mango)) && !blocked.has(c.email)).map((c) => c.email)).size;
  };

  const cols: Col<Row>[] = [
    { key: "name", label: "Broadcast", render: (r) => <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-md bg-[#fdefdf] text-[#f2962c]"><Icon name={r.kind === "Email" ? "messages" : r.kind === "WhatsApp" ? "send" : "bell"} className="h-4 w-4" /></span><div><p className="font-medium">{String(r.name)}</p><p className="text-[12px] text-[#6b6b7b]">{String(r.kind)} · {String(r.recipients ?? 0)} recipients</p></div></div> },
    { key: "mangoes", label: "Mangoes", render: (r) => ((r.mangoes as string[]) || []).join(", ") || "All customers" },
    { key: "time", label: "Time", render: (r) => fmtDateTime(String(r.sendAt || r.createdAt)), sort: (a, b) => String(a.sendAt || a.createdAt).localeCompare(String(b.sendAt || b.createdAt)) },
    { key: "status", label: "Status", render: (r) => (r.isTemplate ? <Pill tone="blue">Template</Pill> : new Date(String(r.sendAt || r.createdAt)).getTime() > Date.now() ? <Pill tone="orange">Scheduled</Pill> : <Pill>Sent</Pill>) },
    { key: "a", label: "", render: (r) => <div className="flex justify-end gap-1.5"><RowAction icon="eye" title="View" onClick={() => setView(r)} />{r.isTemplate ? <RowAction icon="send" title="Use template" onClick={() => setCompose({ kind: r.kind as Kind, init: r })} /> : null}<RowAction icon="trash" title="Delete" danger onClick={() => setDel(r)} /></div> },
  ];

  return (
    <>
      <Walkthrough title="Create marketing broadcasts" />
      <Panel className="p-5">
        <Title>Broadcasts Overview</Title>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[10px] border border-[#ededed] p-4"><p className="text-[12px] text-[#6b6b7b]">Total Broadcasts</p><p className="text-[24px] font-semibold text-[#f2962c]">{published.length}</p></div>
          {([["Notification", "Click rate (%)"], ["Email", "Open rate (%)"], ["WhatsApp", "Seen rate (%)"]] as [Kind, string][]).map(([k, r]) => (
            <div key={k} className="grid grid-cols-2 rounded-[10px] border border-[#ededed] p-4">
              <div><p className="text-[12px] text-[#6b6b7b]">{k === "Notification" ? "Notifications" : `${k}s`}</p><p className="text-[22px] font-semibold">{sum(k)}</p></div>
              <div><p className="text-[12px] text-[#6b6b7b]">{r}</p><p className="text-[22px] font-semibold">0</p></div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-[#9b9bab]">Open, click and seen rates need a delivery provider; they stay at 0 in this clone.</p>
      </Panel>
      <Panel className="mt-5 p-5" delay={0.06}>
        <Title right={<Btn variant="black" icon="plus" onClick={() => setChoose(true)}>Create Broadcast</Btn>}>Broadcasts</Title>
        <div className="mt-3"><Tabs tabs={["Published", "Templates"]} value={tab} onChange={setTab} /></div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Search value={q} onChange={setQ} placeholder="Search by broadcast name" />
          <DateRange from={range[0]} to={range[1]} onChange={(a, b) => setRange([a, b])} />
        </div>
        <div className="mt-3">
          <DataTable cols={cols} rows={rows} loading={col.loading} empty={<EmptySearch title="No broadcasts found" text={<>Sorry, we didn&apos;t find any matching results<br />Find by broadcast name or selecting a date range</>} />} />
        </div>
      </Panel>

      {choose && (
        <Modal title="Create Broadcast" onClose={() => setChoose(false)}>
          <div className="space-y-2">
            {([["Email", "Engage your audience with a customized email broadcast", "messages"], ["WhatsApp", "Reach your audience directly on their phones with a WhatsApp broadcast", "send"], ["Notification", "Reach your audience directly on their phones with a Notification broadcast", "bell"]] as [Kind, string, string][]).map(([k, d, i]) => {
              const locked = k === "WhatsApp" && isLocked("whatsapp-broadcast", me.plan);
              return (
                <button key={k} disabled={locked} onClick={() => { setChoose(false); setCompose({ kind: k }); }} className="flex w-full items-start gap-3 rounded-[10px] border border-[#ededed] p-4 text-left transition hover:border-[#f2962c] disabled:cursor-not-allowed disabled:opacity-60">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fdefdf] text-[#f2962c]"><Icon name={i} className="h-5 w-5" /></span>
                  <span><b className="flex items-center gap-1.5 text-[15px]">{k} Broadcast{locked && <Icon name="lock" className="h-3.5 w-3.5 text-[#f2962c]" />}</b><span className="text-[13px] text-[#6b6b7b]">{locked ? "Upgrade to Pro to send WhatsApp broadcasts." : d}</span></span>
                </button>
              );
            })}
          </div>
        </Modal>
      )}
      {compose && (
        <FormDrawer
          title={`${compose.kind} Broadcast`}
          fields={[
            { key: "name", label: "Broadcast name", required: true, maxLength: 80 },
            { key: "mangoes", label: "Send to customers of (leave empty for all)", type: "multi", options: mangoes },
            { key: "subject", label: "Subject", required: compose.kind === "Email", show: () => compose.kind !== "WhatsApp" },
            { key: "body", label: "Message", type: "textarea", required: true, hint: "Use {name} to personalise." },
            { key: "button", label: "Button label (optional)", show: () => compose.kind !== "WhatsApp" },
            { key: "link", label: "Button link (optional)", type: "url", show: () => compose.kind !== "WhatsApp" },
            { key: "schedule", label: "Schedule for later", type: "toggle" },
            { key: "sendAt", label: "Send at", type: "datetime-local", required: true, show: (d) => Boolean(d.schedule) },
            { key: "saveTemplate", label: "Also save as a template", type: "toggle" },
          ]}
          initial={{ mangoes: [], ...(compose.init ? { name: String(compose.init.name), subject: compose.init.subject, body: compose.init.body, mangoes: compose.init.mangoes } : {}) }}
          submitLabel="Publish"
          onClose={() => setCompose(null)}
          onSubmit={async (d) => {
            const ms = (d.mangoes as string[]) || [];
            const n = audience(ms);
            if (!n) return "No active customers in this audience yet (unsubscribed users are excluded).";
            if (d.schedule && new Date(String(d.sendAt)).getTime() < Date.now()) return "Scheduled time must be in the future";
            const base = { kind: compose.kind, name: d.name, mangoes: ms, subject: d.subject, body: d.body, button: d.button, link: d.link };
            await col.create({ ...base, recipients: n, sendAt: d.schedule ? new Date(String(d.sendAt)).toISOString() : new Date().toISOString() });
            if (d.saveTemplate) await col.create({ ...base, isTemplate: true });
            toast(d.schedule ? "Broadcast scheduled" : `Broadcast sent to ${n} customer${n === 1 ? "" : "s"}`);
          }}
          intro={<p className="rounded-md bg-[#e6f4ff] px-3 py-2 text-[12px] text-[#0f0f0f]">No email/WhatsApp provider is connected in this clone, so broadcasts are recorded with their recipient count but not delivered.</p>}
        />
      )}
      {view && (
        <Modal title={String(view.name)} onClose={() => setView(null)} wide>
          <p className="text-[12px] text-[#6b6b7b]">{String(view.kind)} · {String(view.recipients ?? "-")} recipients · {fmtDateTime(String(view.sendAt || view.createdAt))}</p>
          {view.subject ? <p className="mt-3 font-semibold">{String(view.subject)}</p> : null}
          <p className="mt-2 whitespace-pre-wrap rounded-md bg-[#f7f7f8] p-4 text-[14px]">{String(view.body)}</p>
        </Modal>
      )}
      {del && <Confirm title="Delete broadcast?" text="This removes it from your list." onOk={async () => { await col.remove(del.id); toast("Broadcast deleted"); }} onClose={() => setDel(null)} />}
    </>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
