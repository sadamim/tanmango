"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { fmtDate, toast, useCollection } from "@/lib/client";
import { Btn, Confirm, Modal, Panel, Pill, RowAction, Title, inputCls } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";
import { useMangoTitles } from "@/components/dash/hooks";

function NewCourse({ onClose }: { onClose: () => void }) {
  const col = useCollection("courses");
  const mangoes = useMangoTitles();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [linked, setLinked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Create new course" onClose={onClose}>
      <p className="text-[18px] font-semibold">How about a working title?</p>
      <p className="mt-1 text-[13px] text-[#6b6b7b]">It&apos;s ok if you can&apos;t think of a good title now. You can change it later.</p>
      <div className="relative mt-4"><input autoFocus className={inputCls} maxLength={100} placeholder="e.g. Learn Aquascaping from Scratch" value={title} onChange={(e) => setTitle(e.target.value)} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9b9bab]">{100 - title.length}</span></div>
      <p className="mb-2 mt-4 text-[13px] font-medium">Link mangoes to this course</p>
      <div className="flex flex-wrap gap-2">
        {mangoes.length === 0 && <p className="text-[13px] text-[#9b9bab]">No mangoes yet — you can link them later.</p>}
        {mangoes.map((m) => (
          <button key={m} onClick={() => setLinked((l) => (l.includes(m) ? l.filter((x) => x !== m) : [...l, m]))} className={`rounded-md border px-3 py-1.5 text-[13px] ${linked.includes(m) ? "border-[#f2962c] bg-[#fdefdf] text-[#c7740f]" : "border-[#e1e1e1] text-[#4a4a59]"}`}>{linked.includes(m) ? "✓ " : ""}{m}</button>
        ))}
      </div>
      <Btn
        className="mt-6 w-full"
        disabled={!title.trim() || busy}
        onClick={async () => {
          setBusy(true);
          const row = await col.create({ title: title.trim(), mangoes: linked, published: false, sections: [{ id: crypto.randomUUID(), title: "Section 1", chapters: [] }] });
          toast("Course created");
          router.push(`/web/dashboard/courses/${row.id}`);
        }}
      >
        Continue
      </Btn>
    </Modal>
  );
}

function Inner() {
  const col = useCollection("courses");
  const params = useSearchParams();
  const [create, setCreate] = useState(false);
  const [del, setDel] = useState<string | null>(null);
  useEffect(() => { if (params.get("new") === "1") setCreate(true); }, [params]);

  return (
    <Panel className="p-5">
      <Title right={col.rows.length > 0 && <Btn icon="plus" onClick={() => setCreate(true)}>Create course</Btn>}>Courses</Title>
      {col.rows.length === 0 && !col.loading ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Icon name="courses" className="h-12 w-12 text-[#0f0f0f]" />
          <p className="mt-3 text-[16px] font-semibold">Your courses will appear here soon...</p>
          <p className="mt-1 text-[13px] text-[#6b6b7b]">To create a new course, simply click</p>
          <Btn className="mt-4" icon="plus" onClick={() => setCreate(true)}>Create course</Btn>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {col.rows.map((c, i) => {
            const chapters = ((c.sections as { chapters: unknown[] }[]) || []).reduce((a, s) => a + s.chapters.length, 0);
            return (
              <div key={c.id} className="animate-rise group overflow-hidden rounded-[10px] border border-[#ededed] bg-white" style={{ ["--delay" as string]: `${i * 0.04}s` }}>
                <Link href={`/web/dashboard/courses/${c.id}`} className={`relative grid aspect-video place-items-center bg-gradient-to-br ${["from-orange-400 to-rose-500", "from-indigo-500 to-violet-600", "from-emerald-500 to-teal-600"][i % 3]}`}>
                  <Icon name="courses" className="h-10 w-10 text-white/90 transition group-hover:scale-110" />
                  <span className="absolute left-3 top-3"><Pill tone={c.published ? "green" : "grey"}>{c.published ? "Published" : "Draft"}</Pill></span>
                </Link>
                <div className="p-4">
                  <p className="truncate font-semibold">{String(c.title)}</p>
                  <p className="mt-0.5 text-[12px] text-[#6b6b7b]">{chapters} chapters · {((c.mangoes as string[]) || []).length} mangoes · {fmtDate(c.createdAt)}</p>
                  <div className="mt-3 flex gap-1.5">
                    <Link href={`/web/dashboard/courses/${c.id}`}><Btn variant="outline" className="h-8 px-3 text-[13px]">Edit course</Btn></Link>
                    <Link href={`/web/courses/${c.id}`}><Btn variant="outline" className="h-8 px-3 text-[13px]">Preview</Btn></Link>
                    <span className="ml-auto"><RowAction icon="trash" title="Delete course" danger onClick={() => setDel(c.id)} /></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {create && <NewCourse onClose={() => setCreate(false)} />}
      {del && <Confirm title="Delete course?" text="All sections and chapters will be deleted." onOk={async () => { await col.remove(del); toast("Course deleted"); }} onClose={() => setDel(null)} />}
    </Panel>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
