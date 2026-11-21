"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast, useCollection } from "@/lib/client";
import { Btn, Field, Modal, Panel, Title, Toggle, areaCls, inputCls } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";
import { useMangoTitles } from "@/components/dash/hooks";

type Chapter = { id: string; title: string; type: "Video" | "Audio" | "PDF" | "Text" | "Assignment"; url?: string; text?: string; free?: boolean };
type Section = { id: string; title: string; chapters: Chapter[] };

export default function CourseEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const col = useCollection("courses");
  const mangoes = useMangoTitles();
  const course = col.rows.find((c) => c.id === id);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [linked, setLinked] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [drip, setDrip] = useState("All at once");
  const [sections, setSections] = useState<Section[]>([]);
  const [chapter, setChapter] = useState<{ sid: string; ch: Chapter } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (course && !loaded) {
      setTitle(String(course.title));
      setDesc(String(course.description || ""));
      setLinked((course.mangoes as string[]) || []);
      setPublished(Boolean(course.published));
      setDrip(String(course.drip || "All at once"));
      setSections((course.sections as Section[]) || []);
      setLoaded(true);
    }
  }, [course, loaded]);

  const touch = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setDirty(true); };

  async function save(extra: Record<string, unknown> = {}) {
    if (!title.trim()) return toast("Course title is required", "err");
    await col.update(id, { title: title.trim(), description: desc, mangoes: linked, published, drip, sections, ...extra });
    setDirty(false);
    toast("Course saved");
  }

  if (col.loading) return <div className="h-40 animate-pulse rounded-[10px] bg-white" />;
  if (!course) return <Panel className="p-8 text-center"><p>Course not found.</p><Link href="/web/dashboard/courses" className="text-[#1677ff]">Back to courses</Link></Panel>;

  const chapters = sections.reduce((a, s) => a + s.chapters.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/web/dashboard/courses" className="grid h-9 w-9 place-items-center rounded-md border border-[#e1e1e1] bg-white" aria-label="Back"><Icon name="chevron" className="h-4 w-4 rotate-90" /></Link>
        <h1 className="flex-1 truncate text-[20px] font-semibold">{title || "Untitled course"}</h1>
        <label className="flex items-center gap-2 text-[14px]">Publish <Toggle on={published} onChange={async (v) => { setPublished(v); await save({ published: v }); }} /></label>
        <Link href={`/web/courses/${id}`}><Btn variant="outline" icon="eye">Preview</Btn></Link>
        <Btn onClick={() => save()} disabled={!dirty}>{dirty ? "Save changes" : "Saved"}</Btn>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Panel className="p-5">
          <Title sub={`${sections.length} sections · ${chapters} chapters`} right={<Btn variant="black" icon="plus" onClick={() => { setSections((s) => [...s, { id: crypto.randomUUID(), title: `Section ${s.length + 1}`, chapters: [] }]); setDirty(true); }}>Add section</Btn>}>Curriculum</Title>
          <div className="mt-4 space-y-3">
            {sections.map((s, si) => (
              <div key={s.id} className="animate-soft-fade rounded-[10px] border border-[#ededed]">
                <div className="flex items-center gap-2 border-b border-[#f0f0f0] bg-[#fafafa] px-3 py-2">
                  <input className="flex-1 bg-transparent text-[14px] font-semibold outline-none" value={s.title} onChange={(e) => { const v = e.target.value; setSections((x) => x.map((y) => (y.id === s.id ? { ...y, title: v } : y))); setDirty(true); }} aria-label="Section title" />
                  <button title="Move up" disabled={si === 0} className="px-1 text-[#6b6b7b] disabled:opacity-30" onClick={() => { setSections((x) => { const a = [...x]; [a[si - 1], a[si]] = [a[si], a[si - 1]]; return a; }); setDirty(true); }}>↑</button>
                  <button title="Move down" disabled={si === sections.length - 1} className="px-1 text-[#6b6b7b] disabled:opacity-30" onClick={() => { setSections((x) => { const a = [...x]; [a[si + 1], a[si]] = [a[si], a[si + 1]]; return a; }); setDirty(true); }}>↓</button>
                  <button title="Delete section" className="px-1 text-[#ff4d4f]" onClick={() => { setSections((x) => x.filter((y) => y.id !== s.id)); setDirty(true); }}><Icon name="trash" className="h-4 w-4" /></button>
                </div>
                <div className="divide-y divide-[#f0f0f0]">
                  {s.chapters.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 text-[14px]">
                      <span className="grid h-7 w-7 place-items-center rounded bg-[#fdefdf] text-[10px] font-semibold text-[#c7740f]">{c.type.slice(0, 3).toUpperCase()}</span>
                      <span className="flex-1 truncate">{c.title}</span>
                      {c.free && <span className="rounded bg-[#e6f4ff] px-1.5 text-[11px] text-[#1677ff]">Free preview</span>}
                      <button className="text-[#6b6b7b] hover:text-[#f2962c]" title="Edit chapter" onClick={() => setChapter({ sid: s.id, ch: c })}><Icon name="edit" className="h-4 w-4" /></button>
                      <button className="text-[#6b6b7b] hover:text-[#ff4d4f]" title="Delete chapter" onClick={() => { setSections((x) => x.map((y) => (y.id === s.id ? { ...y, chapters: y.chapters.filter((z) => z.id !== c.id) } : y))); setDirty(true); }}><Icon name="trash" className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <button className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] text-[#f2962c]" onClick={() => setChapter({ sid: s.id, ch: { id: crypto.randomUUID(), title: "", type: "Video" } })}><Icon name="plus" className="h-4 w-4" />Add chapter</button>
                </div>
              </div>
            ))}
            {sections.length === 0 && <p className="py-8 text-center text-[13px] text-[#9b9bab]">Add a section to start building your course.</p>}
          </div>
        </Panel>

        <Panel className="h-fit space-y-4 p-5" delay={0.05}>
          <p className="text-[16px] font-semibold">Course details</p>
          <Field label="Title" required><input className={inputCls} maxLength={100} value={title} onChange={(e) => touch(setTitle)(e.target.value)} /></Field>
          <Field label="Description"><textarea className={`${areaCls} min-h-24`} value={desc} onChange={(e) => touch(setDesc)(e.target.value)} /></Field>
          <Field label="Content release">
            <select className={inputCls} value={drip} onChange={(e) => touch(setDrip)(e.target.value)}>{["All at once", "Weekly drip (one section per week)", "Daily drip (one section per day)"].map((d) => <option key={d}>{d}</option>)}</select>
          </Field>
          <Field label="Linked mangoes" hint="Buyers of these mangoes get access to this course.">
            <div className="flex flex-wrap gap-2">
              {mangoes.length === 0 && <span className="text-[13px] text-[#9b9bab]">No mangoes yet</span>}
              {mangoes.map((m) => <button key={m} type="button" onClick={() => touch(setLinked)(linked.includes(m) ? linked.filter((x) => x !== m) : [...linked, m])} className={`rounded-md border px-2.5 py-1 text-[12px] ${linked.includes(m) ? "border-[#f2962c] bg-[#fdefdf] text-[#c7740f]" : "border-[#e1e1e1] text-[#4a4a59]"}`}>{linked.includes(m) ? "✓ " : ""}{m}</button>)}
            </div>
          </Field>
        </Panel>
      </div>

      {chapter && (
        <Modal title={chapter.ch.title ? "Edit chapter" : "Add chapter"} onClose={() => setChapter(null)}>
          <ChapterForm
            ch={chapter.ch}
            onSave={(ch) => {
              setSections((x) => x.map((s) => (s.id !== chapter.sid ? s : { ...s, chapters: s.chapters.some((c) => c.id === ch.id) ? s.chapters.map((c) => (c.id === ch.id ? ch : c)) : [...s.chapters, ch] })));
              setDirty(true);
              setChapter(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function ChapterForm({ ch, onSave }: { ch: Chapter; onSave: (c: Chapter) => void }) {
  const [c, setC] = useState<Chapter>(ch);
  const needsUrl = c.type !== "Text" && c.type !== "Assignment";
  return (
    <div className="space-y-4">
      <Field label="Chapter title" required><input autoFocus className={inputCls} value={c.title} onChange={(e) => setC({ ...c, title: e.target.value })} /></Field>
      <Field label="Type">
        <div className="flex flex-wrap gap-2">{(["Video", "Audio", "PDF", "Text", "Assignment"] as const).map((t) => <button key={t} type="button" onClick={() => setC({ ...c, type: t })} className={`h-8 rounded-md border px-3 text-[13px] ${c.type === t ? "border-[#0f0f0f] bg-[#0f0f0f] text-white" : "border-[#e1e1e1]"}`}>{t}</button>)}</div>
      </Field>
      {needsUrl && <Field label={`${c.type} URL`} hint="YouTube/Vimeo link, a file URL, or a link from TagMango Cloud."><input className={inputCls} placeholder="https://…" value={c.url || ""} onChange={(e) => setC({ ...c, url: e.target.value })} /></Field>}
      <Field label={c.type === "Assignment" ? "Assignment instructions" : "Notes / text content"}><textarea className={`${areaCls} min-h-24`} value={c.text || ""} onChange={(e) => setC({ ...c, text: e.target.value })} /></Field>
      <label className="flex items-center justify-between text-[14px]">Free preview (visible without purchase)<Toggle on={Boolean(c.free)} onChange={(v) => setC({ ...c, free: v })} /></label>
      <Btn
        className="w-full"
        onClick={() => {
          if (!c.title.trim()) return toast("Chapter title is required", "err");
          if (needsUrl && c.url && !/^https?:\/\//.test(c.url)) return toast("URL must start with http(s)://", "err");
          onSave({ ...c, title: c.title.trim() });
        }}
      >
        Save chapter
      </Btn>
    </div>
  );
}
