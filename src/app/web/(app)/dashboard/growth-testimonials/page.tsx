"use client";
import { useState } from "react";
import { copy, fmtDate, toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, Note, Panel, Pill, Title } from "@/components/dash/kit";
import { origin, useGrowthDoc } from "@/components/growth/shared";

const Q = ["What was the situation before?", "What changed for you?", "What would you tell someone considering it?"];

export default function Testimonials() {
  const { g, ready } = useGrowthDoc();
  const col = useCollection("testimonials");
  const [del, setDel] = useState<Row | null>(null);
  if (!ready) return <div className="h-40 animate-pulse rounded-lg bg-white" />;
  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <Title sub="Asked automatically after the programme, with a permission tick. Only real, named outcomes with permission are shown publicly.">Testimonials</Title>
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-[#f7f7f8] px-3 py-2 text-[13px]"><span className="font-medium">Public proof page:</span><code>{origin()}/stories/{g!.slug}</code><Btn variant="outline" className="!h-7 !px-2 text-[12px]" onClick={() => copy(`${origin()}/stories/${g!.slug}`)}>Copy</Btn></div>
        <div className="mt-3"><Note tone="blue">Approve a testimonial to show it on the Stories page. Ones without a permission tick can never be approved.</Note></div>
      </Panel>
      {col.rows.length === 0 && !col.loading && <Panel className="p-10 text-center text-[#6b6b7b]">No testimonials yet.</Panel>}
      {col.rows.map((t) => (
        <Panel key={t.id} className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2"><p className="font-semibold">{String(t.name)}</p><span className="text-[12.5px] text-[#6b6b7b]">{fmtDate(t.createdAt)}</span>{t.permission ? <Pill>Permission given</Pill> : <Pill tone="red">No permission</Pill>}{t.status === "approved" && <Pill tone="blue">Public</Pill>}</div>
            <div className="flex gap-2">
              <Btn variant={t.status === "approved" ? "outline" : "orange"} disabled={!t.permission} onClick={async () => { await col.update(t.id, { status: t.status === "approved" ? "received" : "approved" }); toast(t.status === "approved" ? "Hidden" : "Now public"); }}>{t.status === "approved" ? "Hide" : "Approve"}</Btn>
              <Btn variant="danger" onClick={() => setDel(t)}>Delete</Btn>
            </div>
          </div>
          <div className="mt-3 space-y-2 text-[14px]">
            {((t.answers as string[]) || []).map((a, i) => a ? <div key={i}><p className="text-[12px] text-[#6b6b7b]">{Q[i]}</p><p>{a}</p></div> : null)}
            {t.voiceUrl ? <p><a className="text-[#1677ff] underline" href={String(t.voiceUrl)} target="_blank" rel="noreferrer">Voice note</a></p> : null}
          </div>
        </Panel>
      ))}
      {del && <Confirm title="Delete this testimonial?" text="This can't be undone." onOk={() => col.remove(del.id)} onClose={() => setDel(null)} />}
    </div>
  );
}
