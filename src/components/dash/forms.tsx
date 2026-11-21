"use client";
import { useState } from "react";
import { Btn, Drawer, Field, Toggle, areaCls, inputCls } from "./kit";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "multi" | "date" | "datetime-local" | "time" | "toggle" | "email" | "url" | "color";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  show?: (d: Record<string, unknown>) => boolean;
};

export function FormFields({ fields, data, set }: { fields: FieldDef[]; data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      {fields.filter((f) => !f.show || f.show(data)).map((f) => {
        const v = data[f.key];
        let input: React.ReactNode;
        if (f.type === "textarea") input = <textarea className={`${areaCls} min-h-24`} placeholder={f.placeholder} maxLength={f.maxLength} value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)} />;
        else if (f.type === "select")
          input = (
            <select className={inputCls} value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)}>
              <option value="">{f.placeholder || "Select…"}</option>
              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          );
        else if (f.type === "multi") {
          const arr = (Array.isArray(v) ? v : []) as string[];
          input = f.options?.length ? (
            <div className="flex flex-wrap gap-2">
              {f.options.map((o) => {
                const on = arr.includes(o);
                return (
                  <button type="button" key={o} onClick={() => set(f.key, on ? arr.filter((x) => x !== o) : [...arr, o])} className={`rounded-md border px-3 py-1.5 text-[13px] transition ${on ? "border-[#f2962c] bg-[#fdefdf] text-[#c7740f]" : "border-[#e1e1e1] text-[#4a4a59] hover:border-[#bfbfbf]"}`}>
                    {on ? "✓ " : ""}{o}
                  </button>
                );
              })}
            </div>
          ) : <p className="text-[13px] text-[#9b9bab]">Nothing to link yet.</p>;
        } else if (f.type === "toggle") input = <div className="pt-0.5"><Toggle on={Boolean(v)} onChange={(x) => set(f.key, x)} label={f.label} /></div>;
        else
          input = (
            <div className="relative">
              <input
                className={`${inputCls} ${f.type === "color" ? "h-10 p-1" : ""}`}
                type={f.type || "text"}
                min={f.min}
                max={f.max}
                maxLength={f.maxLength}
                placeholder={f.placeholder}
                value={v === undefined || v === null ? "" : String(v)}
                onChange={(e) => set(f.key, e.target.value)}
              />
              {f.maxLength && f.type !== "number" && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9b9bab]">{String(v ?? "").length} / {f.maxLength}</span>}
            </div>
          );
        return <Field key={f.key} label={f.label} hint={f.hint} required={f.required}>{input}</Field>;
      })}
    </div>
  );
}

export function validate(fields: FieldDef[], data: Record<string, unknown>): string | null {
  for (const f of fields) {
    if (f.show && !f.show(data)) continue;
    const v = data[f.key];
    if (f.required && (v === undefined || v === "" || (Array.isArray(v) && !v.length))) return `${f.label} is required`;
    if (f.type === "email" && v && !/^\S+@\S+\.\S+$/.test(String(v))) return `${f.label} must be a valid email`;
    if (f.type === "url" && v && !/^https?:\/\//.test(String(v))) return `${f.label} must start with http:// or https://`;
    if (f.type === "number" && v !== "" && v !== undefined) {
      const n = Number(v);
      if (Number.isNaN(n)) return `${f.label} must be a number`;
      if (f.min !== undefined && n < f.min) return `${f.label} must be at least ${f.min}`;
      if (f.max !== undefined && n > f.max) return `${f.label} must be at most ${f.max}`;
    }
  }
  return null;
}

/** Drawer + fields + validation + submit button. `onSubmit` returns an error string to show, or nothing. */
export function FormDrawer({
  title,
  fields,
  initial,
  submitLabel = "Submit",
  onSubmit,
  onClose,
  intro,
}: {
  title: string;
  fields: FieldDef[];
  initial?: Record<string, unknown>;
  submitLabel?: string;
  onSubmit: (data: Record<string, unknown>) => Promise<string | void> | string | void;
  onClose: () => void;
  intro?: React.ReactNode;
}) {
  const [data, setData] = useState<Record<string, unknown>>(() => ({ ...initial }));
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: unknown) => setData((d) => ({ ...d, [k]: v }));

  async function submit() {
    const e = validate(fields, data);
    if (e) return setErr(e);
    const clean: Record<string, unknown> = { ...data };
    for (const f of fields) if (f.type === "number" && clean[f.key] !== "" && clean[f.key] !== undefined) clean[f.key] = Number(clean[f.key]);
    setBusy(true);
    try {
      const r = await onSubmit(clean);
      if (typeof r === "string") setErr(r);
      else onClose();
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer title={title} onClose={onClose} footer={
      <div className="flex items-center gap-3">
        <Btn onClick={submit} disabled={busy}>{busy ? "Saving…" : submitLabel}</Btn>
        {err && <span className="text-[13px] text-[#ff4d4f]">{err}</span>}
      </div>
    }>
      {intro && <div className="mb-4">{intro}</div>}
      <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <FormFields fields={fields} data={data} set={set} />
        <button hidden />
      </form>
    </Drawer>
  );
}
