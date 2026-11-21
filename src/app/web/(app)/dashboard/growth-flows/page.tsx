"use client";
import { useEffect, useState } from "react";
import { api, toast } from "@/lib/client";
import { Btn, Note, Panel, Pill, Title, Toggle, areaCls, inputCls } from "@/components/dash/kit";
import type { FlowDef } from "@/lib/growth/model";

type Stats = { sent: number; opened: number; clicked: number; acted: number };
type Flow = FlowDef & { enabled: boolean; overrides: Record<string, { subject?: string; body?: string; off?: boolean }>; stats: Stats; stepStats: Record<string, Stats> };

const when = (m: number, rel?: string) => {
  const a = Math.abs(m);
  const t = a >= 1440 ? `${Math.round(a / 1440)} day${a >= 2880 ? "s" : ""}` : a >= 60 ? `${Math.round(a / 60)} hour${a >= 120 ? "s" : ""}` : `${a} min`;
  return m === 0 ? "Immediately" : m < 0 ? `${t} before` : `${t} after${rel ? "" : ""}`;
};
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "—");

function FlowCard({ f, reload }: { f: Flow; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [ov, setOv] = useState(f.overrides);
  const [en, setEn] = useState(f.enabled);
  const save = async (enabled = en, overrides = ov) => {
    await api("/api/growth", "POST", { action: "flow-save", flowId: f.id, enabled, overrides });
    toast("Saved");
    reload();
  };
  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#6b6b7b]">WORKFLOW {f.n}</p>
          <p className="text-[16px] font-semibold">{f.name}</p>
          <p className="text-[13px] text-[#4a4a59]">When: {f.trigger}</p>
          <p className="mt-1 text-[12px] text-[#6b6b7b]">{f.stopOn.length ? "Stops when they: " + f.stopOn.join(", ") : "Runs to the end"}{f.sales ? " · never messages anyone who has paid" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12.5px] text-[#4a4a59]">Sent <b>{f.stats.sent}</b> · Opened <b>{f.stats.opened}</b> ({pct(f.stats.opened, f.stats.sent)}) · Clicked <b>{f.stats.clicked}</b> ({pct(f.stats.clicked, f.stats.sent)}) · Acted <b>{f.stats.acted}</b> ({pct(f.stats.acted, f.stats.sent)})</span>
          <Toggle on={en} onChange={(v) => { setEn(v); save(v); }} />
        </div>
      </div>
      {f.note && <p className="mt-2 text-[12.5px] text-[#6b6b7b]">{f.note}</p>}
      {f.steps.length > 0 && <button className="mt-3 text-[13px] text-[#1677ff] underline" onClick={() => setOpen(!open)}>{open ? "Hide messages" : `Show ${f.steps.length} message${f.steps.length > 1 ? "s" : ""}`}</button>}
      {open && (
        <div className="mt-3 space-y-3">
          {f.steps.map((s) => {
            const o = ov[s.key] || {};
            const st = f.stepStats[s.key];
            const set = (patch: Record<string, unknown>) => setOv({ ...ov, [s.key]: { ...o, ...patch } });
            return (
              <div key={s.key} className={`rounded-lg border border-[#ededed] p-3 ${o.off ? "opacity-50" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><Pill tone={s.channel === "email" ? "blue" : "green"}>{s.channel}</Pill><span className="text-[13px] text-[#4a4a59]">{when(s.at, s.rel)}{s.rel ? " the event" : ""}</span></div>
                  <span className="text-[12px] text-[#6b6b7b]">sent {st.sent} · opened {st.opened} · clicked {st.clicked} · acted {st.acted}</span>
                </div>
                {s.channel === "email" && <input className={`${inputCls} mt-2`} value={o.subject ?? s.subject ?? ""} onChange={(e) => set({ subject: e.target.value })} />}
                <textarea className={`${areaCls} mt-2 min-h-24`} value={o.body ?? s.body} onChange={(e) => set({ body: e.target.value })} />
                <label className="mt-1 flex items-center gap-2 text-[12.5px]"><input type="checkbox" className="accent-[#f2962c]" checked={!!o.off} onChange={(e) => set({ off: e.target.checked })} /> Turn this message off</label>
              </div>
            );
          })}
          <div className="flex gap-2"><Btn onClick={() => save()}>Save messages</Btn><Btn variant="outline" onClick={() => { setOv({}); save(en, {}); }}>Restore defaults</Btn></div>
        </div>
      )}
    </Panel>
  );
}

export default function GrowthFlows() {
  const [flows, setFlows] = useState<Flow[] | null>(null);
  const load = () => api<{ flows: Flow[] }>("/api/growth?q=flows").then((r) => setFlows(r.flows));
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <Title sub="Each follows your real funnel, with a stop rule so nobody gets a sales message after they pay or book." right={<Btn variant="outline" onClick={async () => { const r = await api<{ sent: number }>("/api/growth", "POST", { action: "run-due" }); toast(`${r.sent} message(s) sent`); load(); }}>Send due messages now</Btn>}>Automatic workflows</Title>
        <div className="mt-3 space-y-2">
          <Note tone="blue">Messages are sent as soon as something happens. Timed ones (reminders, follow-ups) go out when the scheduler runs <code>/api/cron/run</code>, every few minutes in production. “Acted on” means the person reached the next step after the message. Cut the ones that do not work.</Note>
          <Note tone="yellow">WhatsApp only goes to people who ticked opt-in. Messages are sent through Meta&apos;s WhatsApp Cloud API when <code>WHATSAPP_TOKEN</code> is set (or Twilio when <code>TWILIO_WHATSAPP_FROM</code> is set); otherwise they are saved to the outbox. Messages outside WhatsApp&apos;s 24-hour window need Meta-approved templates, which your provider must submit.</Note>
        </div>
      </Panel>
      {flows ? flows.map((f) => <FlowCard key={f.id} f={f} reload={load} />) : <div className="h-40 animate-pulse rounded-lg bg-white" />}
    </div>
  );
}
