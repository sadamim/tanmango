"use client";
import { useState } from "react";
import { toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, EmptyBox, Field, Gate, Modal, Panel, Pill, RowAction, Title, Toggle, inputCls } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";
import { useMangoTitles } from "@/components/dash/hooks";

type Step = { id: string; kind: "Course" | "Workshop" | "Task"; ref: string; days: number };

function PathEditor({ path, onClose }: { path?: Row; onClose: () => void }) {
  const col = useCollection("paths");
  const courses = useCollection("courses");
  const workshops = useCollection("workshops");
  const mangoes = useMangoTitles();
  const [name, setName] = useState(String(path?.name || ""));
  const [mango, setMango] = useState(String(path?.mango || ""));
  const [steps, setSteps] = useState<Step[]>((path?.steps as Step[]) || []);
  const refs = (k: Step["kind"]) => (k === "Course" ? courses.rows.map((c) => String(c.title)) : k === "Workshop" ? workshops.rows.map((w) => String(w.title)) : []);

  return (
    <Modal title={path ? "Edit path" : "Create path"} onClose={onClose} wide>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Path name" required><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 30-day beginner journey" /></Field>
        <Field label="Unlocked by mango"><select className={inputCls} value={mango} onChange={(e) => setMango(e.target.value)}><option value="">Select…</option>{mangoes.map((m) => <option key={m}>{m}</option>)}</select></Field>
      </div>
      <p className="mb-2 mt-5 text-[13px] font-medium">Steps (learners unlock them in order)</p>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-md border border-[#ededed] p-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#fdefdf] text-[12px] font-semibold text-[#c7740f]">{i + 1}</span>
            <select className={`${inputCls} w-32`} value={s.kind} onChange={(e) => setSteps((x) => x.map((y) => (y.id === s.id ? { ...y, kind: e.target.value as Step["kind"], ref: "" } : y)))}>{["Course", "Workshop", "Task"].map((k) => <option key={k}>{k}</option>)}</select>
            {s.kind === "Task" ? (
              <input className={`${inputCls} flex-1`} placeholder="Describe the task" value={s.ref} onChange={(e) => setSteps((x) => x.map((y) => (y.id === s.id ? { ...y, ref: e.target.value } : y)))} />
            ) : (
              <select className={`${inputCls} flex-1`} value={s.ref} onChange={(e) => setSteps((x) => x.map((y) => (y.id === s.id ? { ...y, ref: e.target.value } : y)))}><option value="">Select {s.kind.toLowerCase()}…</option>{refs(s.kind).map((r) => <option key={r}>{r}</option>)}</select>
            )}
            <label className="flex items-center gap-1 text-[12px] text-[#6b6b7b]">after<input type="number" min={0} className={`${inputCls} w-16`} value={s.days} onChange={(e) => setSteps((x) => x.map((y) => (y.id === s.id ? { ...y, days: Number(e.target.value) } : y)))} />days</label>
            <button aria-label="Remove step" className="px-2 text-[#ff4d4f]" onClick={() => setSteps((x) => x.filter((y) => y.id !== s.id))}>×</button>
          </div>
        ))}
        <Btn variant="outline" icon="plus" onClick={() => setSteps((x) => [...x, { id: crypto.randomUUID(), kind: "Course", ref: "", days: x.length ? 7 : 0 }])}>Add step</Btn>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={async () => {
          if (!name.trim()) return toast("Path name is required", "err");
          if (!steps.length || steps.some((s) => !s.ref)) return toast("Add at least one step and fill every step", "err");
          const data = { name: name.trim(), mango, steps };
          if (path) await col.update(path.id, data); else await col.create({ ...data, active: true });
          toast("Path saved");
          onClose();
        }}>Save path</Btn>
      </div>
    </Modal>
  );
}

function Paths() {
  const col = useCollection("paths");
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  return (
    <Panel className="p-5">
      <Title sub="Guide learners through courses, workshops and tasks in a set order." right={<Btn variant="black" icon="plus" onClick={() => setEdit("new")}>Create path</Btn>}>Path <Pill tone="orange">New</Pill></Title>
      {col.rows.length === 0 && !col.loading ? <EmptyBox title="No paths yet" text="Create a learning path to drip your products step by step." /> : (
        <div className="mt-4 space-y-3">
          {col.rows.map((p) => (
            <div key={p.id} className="rounded-[10px] border border-[#ededed] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="flex-1 font-semibold">{String(p.name)} <span className="font-normal text-[#6b6b7b]">· {p.mango ? String(p.mango) : "No mango"}</span></p>
                <Toggle on={Boolean(p.active)} onChange={async (v) => { await col.update(p.id, { active: v }); toast(v ? "Path activated" : "Path paused"); }} label="Active" />
                <RowAction icon="edit" title="Edit" onClick={() => setEdit(p)} />
                <RowAction icon="trash" title="Delete" danger onClick={() => setDel(p)} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1 text-[12px]">
                {((p.steps as Step[]) || []).map((s, i) => (
                  <span key={s.id} className="flex items-center gap-1">
                    {i > 0 && <Icon name="chevron" className="h-3 w-3 -rotate-90 text-[#bfbfbf]" />}
                    <span className="rounded-md bg-[#f7f7f8] px-2 py-1">{s.kind}: {s.ref}{s.days ? ` (+${s.days}d)` : ""}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {edit && <PathEditor path={edit === "new" ? undefined : edit} onClose={() => setEdit(null)} />}
      {del && <Confirm title="Delete path?" text="Learners on this path will no longer see it." onOk={async () => { await col.remove(del.id); toast("Path deleted"); }} onClose={() => setDel(null)} />}
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="path" title="Path"><Paths /></Gate>;
}
