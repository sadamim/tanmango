"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useCollection } from "@/lib/client";
import { Btn, Panel } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";

type Chapter = { id: string; title: string; type: string; url?: string; text?: string };
type Section = { id: string; title: string; chapters: Chapter[] };

function embed(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

/** Learner view of a course (creator preview). Progress is remembered per browser. */
export default function CoursePlayer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const col = useCollection("courses");
  const course = col.rows.find((c) => c.id === id);
  const sections = ((course?.sections as Section[]) || []).filter((s) => s.chapters.length);
  const all = sections.flatMap((s) => s.chapters);
  const [cur, setCur] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(`tm:progress:${id}`) || "[]")); } catch {}
  }, [id]);
  useEffect(() => { if (!cur && all[0]) setCur(all[0].id); }, [all, cur]);

  const mark = (cid: string) => {
    const next = done.includes(cid) ? done.filter((x) => x !== cid) : [...done, cid];
    setDone(next);
    try { localStorage.setItem(`tm:progress:${id}`, JSON.stringify(next)); } catch {}
  };

  if (col.loading) return <div className="mx-auto h-64 max-w-6xl animate-pulse rounded-[10px] bg-white" />;
  if (!course) return <Panel className="mx-auto max-w-xl p-8 text-center">Course not found. <Link href="/web/courses" className="text-[#1677ff]">Back</Link></Panel>;
  const ch = all.find((c) => c.id === cur);
  const pct = all.length ? Math.round((done.filter((d) => all.some((c) => c.id === d)).length / all.length) * 100) : 0;
  const src = ch?.url ? embed(ch.url) : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="flex items-center gap-3"><Link href="/web/courses" className="grid h-9 w-9 place-items-center rounded-md border border-[#e1e1e1] bg-white" aria-label="Back"><Icon name="chevron" className="h-4 w-4 rotate-90" /></Link><h1 className="text-[20px] font-semibold">{String(course.title)}</h1>{!course.published && <span className="rounded bg-[#f2f2f2] px-2 text-[12px]">Draft preview</span>}</div>
        <Panel className="overflow-hidden">
          {!ch ? <p className="p-10 text-center text-[14px] text-[#6b6b7b]">This course has no chapters yet.</p> : (
            <>
              <div className="grid aspect-video place-items-center bg-black text-white">
                {src ? <iframe src={src} title={ch.title} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> :
                  ch.type === "Video" && ch.url ? <video src={ch.url} controls className="h-full w-full" /> :
                  ch.type === "Audio" && ch.url ? <audio src={ch.url} controls /> :
                  ch.url ? <a href={ch.url} target="_blank" rel="noreferrer" className="rounded-md bg-white px-4 py-2 text-[#0f0f0f]">Open {ch.type}</a> :
                  <span className="text-[14px] text-white/70">{ch.type} chapter</span>}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[18px] font-semibold">{ch.title}</p><Btn variant={done.includes(ch.id) ? "outline" : "orange"} icon="check" onClick={() => mark(ch.id)}>{done.includes(ch.id) ? "Completed" : "Mark as complete"}</Btn></div>
                {ch.text && <p className="mt-3 whitespace-pre-wrap text-[14px] text-[#4a4a59]">{ch.text}</p>}
              </div>
            </>
          )}
        </Panel>
      </div>
      <Panel className="h-fit p-4">
        <p className="text-[13px] font-medium">Your progress · {pct}%</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded bg-[#f2f2f2]"><div className="h-full bg-[#00a400] transition-all" style={{ width: `${pct}%` }} /></div>
        <div className="mt-4 space-y-3">
          {sections.map((s) => (
            <div key={s.id}>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#6b6b7b]">{s.title}</p>
              {s.chapters.map((c) => (
                <button key={c.id} onClick={() => setCur(c.id)} className={`mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] ${cur === c.id ? "bg-[#fdefdf] text-[#c7740f]" : "hover:bg-[#f7f7f7]"}`}>
                  <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] ${done.includes(c.id) ? "bg-[#00a400] text-white" : "border border-[#bfbfbf]"}`}>{done.includes(c.id) ? "✓" : ""}</span>
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
