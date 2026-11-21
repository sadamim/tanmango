"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { fmtDateTime, toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, DateRange, EmptyBox, Panel, Pill, RowAction, Tabs, Title } from "@/components/dash/kit";
import { FormDrawer, type FieldDef } from "@/components/dash/forms";
import { Walkthrough } from "@/components/dash/kit";
import { useMangoTitles, inRange } from "@/components/dash/hooks";

const TZ = ["(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi (India Standard Time)", "(UTC+00:00) London", "(UTC-05:00) New York", "(UTC+04:00) Dubai", "(UTC+08:00) Singapore"];

function endOf(w: Row) {
  return new Date(String(w.startsAt)).getTime() + (Number(w.hours || 0) * 60 + Number(w.minutes || 0)) * 60000;
}

function Inner() {
  const col = useCollection("workshops");
  const mangoes = useMangoTitles();
  const params = useSearchParams();
  const [tab, setTab] = useState<"Upcoming" | "Completed">("Upcoming");
  const [range, setRange] = useState<[string, string]>(["", ""]);
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  useEffect(() => { if (params.get("new") === "1") setEdit("new"); }, [params]);

  const fields: FieldDef[] = [
    { key: "title", label: "Title", required: true, placeholder: "Add title", maxLength: 100 },
    { key: "thumbnail", label: "Thumbnail", type: "url", placeholder: "https://…/thumbnail.jpg", hint: "Images should be horizontal. Recommended size is 1280x720px" },
    { key: "platform", label: "Meeting platform", type: "select", options: ["Custom Meeting Platform (like Google Meet, Zoom, etc.)", "TagMango Live (in-app)"], required: true },
    { key: "link", label: "External meeting link", type: "url", placeholder: "Enter external meeting link", show: (d) => String(d.platform || "").startsWith("Custom"), required: true },
    { key: "timezone", label: "Select timezone for selecting the slots below", type: "select", options: TZ, required: true },
    { key: "startsAt", label: "Start date & time", type: "datetime-local", required: true },
    { key: "hours", label: "Duration — hours", type: "number", min: 0, max: 12 },
    { key: "minutes", label: "Duration — minutes", type: "number", min: 0, max: 59 },
    { key: "recurring", label: "Recurring workshop", type: "toggle" },
    { key: "repeat", label: "Repeat", type: "select", options: ["Daily", "Weekly", "Monthly"], show: (d) => Boolean(d.recurring), required: true },
    { key: "occurrences", label: "Number of sessions", type: "number", min: 2, max: 52, show: (d) => Boolean(d.recurring), required: true },
    { key: "mangoes", label: "Link mango here", type: "multi", options: mangoes },
    { key: "exclude", label: "Exclude common customers from other mangoes (optional)", type: "multi", options: mangoes },
    { key: "upsell", label: "Mango you want to upsell in this session (optional)", type: "select", options: mangoes },
    { key: "description", label: "Description", type: "textarea", placeholder: "Add description (optional)" },
  ];

  const rows = useMemo(() => {
    const now = Date.now();
    return col.rows
      .filter((w) => (tab === "Upcoming" ? endOf(w) >= now : endOf(w) < now))
      .filter((w) => inRange(String(w.startsAt), range[0], range[1]))
      .sort((a, b) => (tab === "Upcoming" ? 1 : -1) * String(a.startsAt).localeCompare(String(b.startsAt)));
  }, [col.rows, tab, range]);

  async function save(d: Record<string, unknown>) {
    const total = Number(d.hours || 0) * 60 + Number(d.minutes || 0);
    if (total < 15) return "Duration must be at least 15 minutes";
    if (edit === "new" && new Date(String(d.startsAt)).getTime() < Date.now()) return "Start time must be in the future";
    const base = { ...d, hours: Number(d.hours || 0), minutes: Number(d.minutes || 0) };
    if (edit !== "new" && edit) {
      await col.update(edit.id, base);
      toast("Workshop updated");
      return;
    }
    const n = d.recurring ? Number(d.occurrences || 2) : 1;
    const step = d.repeat === "Daily" ? 1 : d.repeat === "Monthly" ? 30 : 7;
    const seriesId = crypto.randomUUID();
    for (let k = 0; k < n; k++) {
      const start = new Date(new Date(String(d.startsAt)).getTime() + k * step * 864e5);
      const local = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      await col.create({ ...base, startsAt: local, seriesId: n > 1 ? seriesId : undefined, session: n > 1 ? k + 1 : undefined });
    }
    toast(n > 1 ? `${n} workshop sessions scheduled` : "Workshop scheduled");
  }

  return (
    <>
      <Walkthrough title="Learn how to host workshop for your audience" />
      <Panel className="p-5">
        <Title>Workshops</Title>
        <div className="mt-3"><Tabs tabs={["Upcoming", "Completed"]} value={tab} onChange={setTab} /></div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <DateRange from={range[0]} to={range[1]} onChange={(a, b) => setRange([a, b])} />
          {(range[0] || range[1]) && <Btn variant="soft" onClick={() => setRange(["", ""])}>Clear</Btn>}
          <Btn variant="black" className="ml-auto" onClick={() => setEdit("new")}>Schedule a workshop</Btn>
        </div>
        {rows.length === 0 && !col.loading ? (
          <EmptyBox
            title={tab === "Upcoming" ? "You do not have any upcoming workshops yet..." : "No completed workshops yet"}
            text={tab === "Upcoming" ? <>To schedule single or recurring workshops, simply click <button className="text-[#1677ff]" onClick={() => setEdit("new")}>schedule a workshop</button></> : "Workshops move here after they end."}
          />
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((w, i) => {
              const live = new Date(String(w.startsAt)).getTime() <= Date.now() && endOf(w) >= Date.now();
              return (
                <div key={w.id} className="animate-rise overflow-hidden rounded-[10px] border border-[#ededed] bg-white" style={{ ["--delay" as string]: `${i * 0.04}s` }}>
                  <div className="relative aspect-[16/7] bg-gradient-to-br from-[#2b1149] to-[#f2962c]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {w.thumbnail ? <img src={String(w.thumbnail)} alt="" className="h-full w-full object-cover" /> : null}
                    <span className="absolute left-3 top-3">{live ? <Pill tone="red">Live now</Pill> : tab === "Completed" ? <Pill tone="grey">Completed</Pill> : <Pill tone="blue">Upcoming</Pill>}</span>
                    {w.session ? <span className="absolute right-3 top-3 rounded bg-black/50 px-2 text-[11px] text-white">Session {String(w.session)}</span> : null}
                  </div>
                  <div className="p-4">
                    <p className="truncate font-semibold">{String(w.title)}</p>
                    <p className="mt-0.5 text-[12px] text-[#6b6b7b]">{fmtDateTime(String(w.startsAt))} · {Number(w.hours) ? `${w.hours} hr ` : ""}{Number(w.minutes) ? `${w.minutes} min` : ""}</p>
                    <p className="mt-1 truncate text-[12px] text-[#6b6b7b]">{((w.mangoes as string[]) || []).join(", ") || "No mango linked"}</p>
                    <div className="mt-3 flex gap-1.5">
                      {w.link ? <a href={String(w.link)} target="_blank" rel="noreferrer"><Btn className="h-8 px-3 text-[13px]">{live ? "Join now" : "Open link"}</Btn></a> : null}
                      <span className="ml-auto flex gap-1.5">
                        <RowAction icon="edit" title="Edit / reschedule" onClick={() => setEdit(w)} />
                        <RowAction icon="trash" title="Cancel workshop" danger onClick={() => setDel(w)} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
      {edit && (
        <FormDrawer
          title={edit === "new" ? "Create Workshop" : "Edit Workshop"}
          fields={fields}
          initial={edit === "new" ? { platform: "Custom Meeting Platform (like Google Meet, Zoom, etc.)", timezone: TZ[0], hours: 1, minutes: 0, mangoes: [], exclude: [] } : edit}
          submitLabel={edit === "new" ? "Continue" : "Save"}
          onSubmit={save}
          onClose={() => setEdit(null)}
        />
      )}
      {del && <Confirm title="Cancel this workshop?" text={<>“{String(del.title)}” will be removed and won&apos;t appear to customers.</>} okLabel="Cancel workshop" onOk={async () => { await col.remove(del.id); toast("Workshop cancelled"); }} onClose={() => setDel(null)} />}
    </>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
