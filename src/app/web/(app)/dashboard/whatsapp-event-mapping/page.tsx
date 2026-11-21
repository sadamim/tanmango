"use client";
import { patchMe, toast, useCollection, useMe } from "@/lib/client";
import { Gate, Panel, Title, Toggle } from "@/components/dash/kit";

const EVENTS = [
  "Mango purchase confirmation",
  "Purchase drop-off reminder",
  "Subscription expiring in 1 day",
  "Workshop scheduled",
  "Workshop reminder — 24 hours",
  "Workshop reminder — 30 minutes",
  "Workshop rescheduled",
  "Workshop cancelled",
  "1-1 consultation booked",
  "1-1 consultation reminder — 30 minutes",
  "Course 100% completed",
];

function Mapping() {
  const { me, setMe } = useMe();
  const templates = useCollection("waTemplates");
  const map = (me.settings?.waEvents || {}) as Record<string, { template?: string; on?: boolean }>;
  async function set(ev: string, patch: { template?: string; on?: boolean }) {
    const r = await patchMe({ settings: { waEvents: { ...map, [ev]: { ...map[ev], ...patch } } } });
    setMe(r.user);
    toast("Saved");
  }
  return (
    <Panel className="p-5">
      <Title sub="Pick which WhatsApp template is sent for each event.">Events Personalisation</Title>
      <div className="mt-4 divide-y divide-[#f0f0f0] rounded-[10px] border border-[#ededed]">
        {EVENTS.map((ev) => (
          <div key={ev} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="min-w-[220px] flex-1 text-[14px]">{ev}</span>
            <select className="h-9 min-w-[220px] rounded-md border border-[#e1e1e1] px-2 text-[13px]" value={map[ev]?.template || ""} onChange={(e) => set(ev, { template: e.target.value, on: Boolean(e.target.value) })}>
              <option value="">{templates.rows.length ? "No template" : "Create a template first"}</option>
              {templates.rows.map((t) => <option key={t.id} value={String(t.name)}>{String(t.name)}</option>)}
            </select>
            <Toggle on={Boolean(map[ev]?.on && map[ev]?.template)} disabled={!map[ev]?.template} onChange={(v) => set(ev, { on: v })} label={`Enable ${ev}`} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="whatsapp-event-mapping" title="Events Personalisation"><Mapping /></Gate>;
}
