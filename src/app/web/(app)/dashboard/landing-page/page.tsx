"use client";
import { useState } from "react";
import { copy, toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, EmptyBox, Field, Gate, Panel, Pill, RowAction, Title, Toggle, areaCls, inputCls } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";
import SiteRender, { type Block } from "@/components/dash/SiteRender";

const KINDS: Block["kind"][] = ["hero", "text", "features", "testimonial", "faq", "cta"];

function Builder({ site, onBack }: { site: Row; onBack: () => void }) {
  const col = useCollection("sites");
  const [blocks, setBlocks] = useState<Block[]>((site.blocks as Block[]) || []);
  const [name, setName] = useState(String(site.name));
  const [color, setColor] = useState(String(site.color || "#f2962c"));
  const [sel, setSel] = useState<string | null>(blocks[0]?.id || null);
  const cur = blocks.find((b) => b.id === sel);
  const upd = (patch: Partial<Block>) => setBlocks((bs) => bs.map((b) => (b.id === sel ? { ...b, ...patch } : b)));
  const move = (i: number, d: number) => setBlocks((bs) => { const a = [...bs]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-md border border-[#e1e1e1] bg-white" aria-label="Back"><Icon name="chevron" className="h-4 w-4 rotate-90" /></button>
        <input className="h-9 flex-1 rounded-md border border-transparent bg-transparent px-2 text-[20px] font-semibold outline-none focus:border-[#e1e1e1] focus:bg-white" value={name} onChange={(e) => setName(e.target.value)} aria-label="Website name" />
        <a href={`/site/${site.slug}`} target="_blank" rel="noreferrer"><Btn variant="outline" icon="eye">View live</Btn></a>
        <Btn onClick={async () => { await col.update(site.id, { name, color, blocks }); toast("Website saved"); }}>Save</Btn>
      </div>
      <div className="grid gap-4 lg:grid-cols-[260px_1fr_320px]">
        <Panel className="h-fit p-3">
          <p className="px-1 pb-2 text-[12px] font-semibold uppercase text-[#6b6b7b]">Sections</p>
          {blocks.map((b, i) => (
            <div key={b.id} className={`mb-1 flex items-center gap-1 rounded-md px-2 py-2 text-[13px] ${sel === b.id ? "bg-[#fdefdf] text-[#c7740f]" : "hover:bg-[#f7f7f7]"}`}>
              <button className="flex-1 text-left capitalize" onClick={() => setSel(b.id)}>{b.kind}{b.title ? ` — ${b.title}` : ""}</button>
              <button aria-label="Move up" onClick={() => move(i, -1)}>↑</button>
              <button aria-label="Move down" onClick={() => move(i, 1)}>↓</button>
              <button aria-label="Remove" className="text-[#ff4d4f]" onClick={() => setBlocks((bs) => bs.filter((x) => x.id !== b.id))}>×</button>
            </div>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {KINDS.map((k) => <button key={k} onClick={() => { const nb: Block = { id: crypto.randomUUID(), kind: k, title: k === "hero" ? "Your big promise" : k[0].toUpperCase() + k.slice(1), body: "", button: k === "hero" || k === "cta" ? "Get started" : undefined }; setBlocks((bs) => [...bs, nb]); setSel(nb.id); }} className="rounded-md border border-dashed border-[#d9d9d9] py-1.5 text-[12px] capitalize hover:border-[#f2962c] hover:text-[#f2962c]">+ {k}</button>)}
          </div>
        </Panel>
        <Panel className="overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto"><SiteRender blocks={blocks} color={color} /></div>
        </Panel>
        <Panel className="h-fit space-y-3 p-4">
          <Field label="Brand colour"><input type="color" className={`${inputCls} p-1`} value={color} onChange={(e) => setColor(e.target.value)} /></Field>
          {cur ? (
            <>
              <p className="text-[13px] font-semibold capitalize">Edit {cur.kind}</p>
              <Field label="Heading"><input className={inputCls} value={cur.title || ""} onChange={(e) => upd({ title: e.target.value })} /></Field>
              <Field label="Text"><textarea className={`${areaCls} min-h-20`} value={cur.body || ""} onChange={(e) => upd({ body: e.target.value })} /></Field>
              {(cur.kind === "features" || cur.kind === "faq") && <Field label={cur.kind === "faq" ? "Q|A pairs (one per line, Question|Answer)" : "Items (one per line)"}><textarea className={`${areaCls} min-h-24`} value={cur.items || ""} onChange={(e) => upd({ items: e.target.value })} /></Field>}
              {(cur.kind === "hero" || cur.kind === "cta") && (
                <>
                  <Field label="Button label"><input className={inputCls} value={cur.button || ""} onChange={(e) => upd({ button: e.target.value })} /></Field>
                  <Field label="Button link" hint="e.g. a checkout or Mango Page link"><input className={inputCls} placeholder="https://…" value={cur.link || ""} onChange={(e) => upd({ link: e.target.value })} /></Field>
                </>
              )}
            </>
          ) : <p className="text-[13px] text-[#9b9bab]">Select a section to edit it.</p>}
        </Panel>
      </div>
    </div>
  );
}

function Sites() {
  const col = useCollection("sites");
  const [open, setOpen] = useState<Row | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  if (open) return <Builder site={col.rows.find((r) => r.id === open.id) || open} onBack={() => setOpen(null)} />;
  return (
    <Panel className="p-5">
      <Title right={<Btn icon="plus" onClick={async () => {
        const slug = `site-${Math.random().toString(36).slice(2, 7)}`;
        const row = await col.create({ name: "My website", slug, color: "#f2962c", published: false, blocks: [
          { id: crypto.randomUUID(), kind: "hero", title: "Transform your life in 30 days", body: "Join thousands of learners in my flagship program.", button: "Join now" },
          { id: crypto.randomUUID(), kind: "features", title: "What you'll get", items: "Weekly live sessions\nRecorded lessons\nPrivate community" },
          { id: crypto.randomUUID(), kind: "cta", title: "Ready to start?", button: "Get started" },
        ] });
        setOpen(row);
      }}>Create website</Btn>}>Website Builder</Title>
      {col.rows.length === 0 && !col.loading ? <EmptyBox title="No websites yet" text="Build a multi-section website with your brand colours and publish it on its own link." /> : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {col.rows.map((s) => (
            <div key={s.id} className="rounded-[10px] border border-[#ededed] p-4">
              <div className="h-24 rounded-md" style={{ background: `linear-gradient(135deg, ${String(s.color)}, #1d0f08)` }} />
              <div className="mt-3 flex items-center justify-between"><p className="font-semibold">{String(s.name)}</p><Pill tone={s.published ? "green" : "grey"}>{s.published ? "Live" : "Draft"}</Pill></div>
              <p className="text-[12px] text-[#6b6b7b]">/site/{String(s.slug)}</p>
              <div className="mt-3 flex items-center gap-1.5">
                <Btn className="h-8 px-3 text-[13px]" onClick={() => setOpen(s)}>Edit</Btn>
                <label className="flex items-center gap-1.5 text-[12px]"><Toggle on={Boolean(s.published)} onChange={async (v) => { await col.update(s.id, { published: v }); toast(v ? "Website published" : "Website unpublished"); }} />Publish</label>
                <span className="ml-auto flex gap-1.5"><RowAction icon="link" title="Copy link" onClick={() => copy(`${location.origin}/site/${s.slug}`)} /><RowAction icon="trash" title="Delete" danger onClick={() => setDel(s)} /></span>
              </div>
            </div>
          ))}
        </div>
      )}
      {del && <Confirm title="Delete website?" text="Its public link will stop working." onOk={async () => { await col.remove(del.id); toast("Website deleted"); }} onClose={() => setDel(null)} />}
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="landing-page" title="Website Builder"><Sites /></Gate>;
}
