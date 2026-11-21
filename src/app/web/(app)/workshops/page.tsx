"use client";
import Link from "next/link";
import { fmtDateTime, useCollection } from "@/lib/client";
import { Btn, EmptyBox, Panel, Pill, Title } from "@/components/dash/kit";

export default function WorkshopsTab() {
  const col = useCollection("workshops");
  const end = (w: Record<string, unknown>) => new Date(String(w.startsAt)).getTime() + (Number(w.hours || 0) * 60 + Number(w.minutes || 0)) * 60000;
  const rows = [...col.rows].filter((w) => end(w) >= Date.now()).sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt)));
  return (
    <div className="mx-auto max-w-5xl">
      <Panel className="p-5">
        <Title right={<Link href="/web/dashboard/workshop?new=1"><Btn variant="black">Schedule a workshop</Btn></Link>}>Upcoming workshops</Title>
        {rows.length === 0 && !col.loading ? <EmptyBox title="No upcoming workshops" text="Workshops you schedule show up here for your members." /> : (
          <div className="mt-4 space-y-3">
            {rows.map((w) => {
              const live = new Date(String(w.startsAt)).getTime() <= Date.now();
              return (
                <div key={w.id} className="flex flex-wrap items-center gap-4 rounded-[10px] border border-[#ededed] p-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-[#fdefdf] text-center text-[#c7740f]">
                    <span className="text-[11px] font-semibold uppercase">{new Date(String(w.startsAt)).toLocaleDateString("en-IN", { month: "short" })}</span>
                    <span className="-mt-1 text-[20px] font-bold">{new Date(String(w.startsAt)).getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1"><p className="truncate font-semibold">{String(w.title)}</p><p className="text-[13px] text-[#6b6b7b]">{fmtDateTime(String(w.startsAt))}</p></div>
                  {live ? <Pill tone="red">Live now</Pill> : null}
                  {w.link ? <a href={String(w.link)} target="_blank" rel="noreferrer"><Btn>{live ? "Join now" : "Join link"}</Btn></a> : null}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
