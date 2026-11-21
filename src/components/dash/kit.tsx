"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ago, useMe } from "@/lib/client";
import { Icon } from "./icons";
import { dash, isLocked } from "./nav";

/* ---------- layout ---------- */

export function Panel({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <section className={`animate-rise rounded-[10px] border border-[#ededed] bg-white ${className}`} style={{ ["--delay" as string]: `${delay}s` }}>
      {children}
    </section>
  );
}

export function Title({ children, sub, right }: { children: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-[20px] font-semibold leading-tight text-[#0f0f0f]">{children}</h2>
        {sub && <div className="mt-1 text-[12px] text-[#6b6b7b]">{sub}</div>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

export function Updated({ at }: { at: number }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);
  return <span>Last updated {ago(at)}.</span>;
}

/* ---------- buttons & inputs ---------- */

type BtnVariant = "orange" | "black" | "outline" | "ghost" | "danger" | "soft";
export function Btn({ children, variant = "orange", className = "", icon, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; icon?: string }) {
  const v: Record<BtnVariant, string> = {
    orange: "bg-[#f2962c] text-white hover:bg-[#e8861a] disabled:bg-[#f6c48b]",
    black: "bg-black text-white hover:bg-[#262626] disabled:bg-black/40",
    outline: "border border-[#d9d9d9] bg-white text-[#0f0f0f] hover:border-[#f2962c] hover:text-[#f2962c] disabled:text-black/30",
    ghost: "text-[#0f0f0f] hover:bg-black/5",
    danger: "border border-[#ffccc7] bg-[#fff2f0] text-[#ff4d4f] hover:bg-[#ffe5e2] disabled:opacity-50",
    soft: "bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e8e8e8] disabled:text-black/30",
  };
  return (
    <button {...rest} className={`inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md px-4 text-[14px] transition active:scale-[0.98] disabled:cursor-not-allowed ${v[variant]} ${className}`}>
      {icon && <Icon name={icon} className="h-4 w-4" />}
      {children}
    </button>
  );
}

export const inputCls =
  "h-10 w-full rounded-md border border-[#e1e1e1] bg-white px-3 text-[14px] outline-none transition placeholder:text-[#9b9bab] focus:border-[#f2962c] focus:ring-2 focus:ring-[#f2962c]/15";
export const areaCls =
  "w-full rounded-md border border-[#e1e1e1] bg-white px-3 py-2 text-[14px] outline-none transition placeholder:text-[#9b9bab] focus:border-[#f2962c] focus:ring-2 focus:ring-[#f2962c]/15";

export function Search({ value, onChange, placeholder, className = "" }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  return (
    <label className={`flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-md border border-[#e1e1e1] bg-white px-3 focus-within:border-[#f2962c] ${className}`}>
      <Icon name="search" className="h-4 w-4 text-[#9b9bab]" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#9b9bab]" />
    </label>
  );
}

export function DateRange({ from, to, onChange, type = "date" }: { from: string; to: string; onChange: (from: string, to: string) => void; type?: "date" | "month" }) {
  return (
    <div className="flex h-10 items-center gap-1 rounded-md border border-[#e1e1e1] bg-white px-2 text-[13px]">
      <input type={type} value={from} max={to || undefined} onChange={(e) => onChange(e.target.value, to)} className="w-[118px] bg-transparent outline-none" aria-label="Start" />
      <span className="text-[#9b9bab]">→</span>
      <input type={type} value={to} min={from || undefined} onChange={(e) => onChange(from, e.target.value)} className="w-[118px] bg-transparent outline-none" aria-label="End" />
      <Icon name="calendar" className="h-4 w-4 text-[#9b9bab]" />
    </div>
  );
}

export function Select({ value, onChange, options, className = "" }: { value: string; onChange: (v: string) => void; options: (string | [string, string])[]; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`h-10 rounded-md border border-[#e1e1e1] bg-white px-3 text-[14px] outline-none focus:border-[#f2962c] ${className}`}>
      {options.map((o) => {
        const [v, l] = Array.isArray(o) ? o : [o, o];
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
}

export function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)} className={`relative h-[22px] w-[44px] shrink-0 rounded-full transition-colors duration-300 disabled:opacity-50 ${on ? "bg-[#f2962c]" : "bg-[#bfbfbf]"}`}>
      <span className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all duration-300 [transition-timing-function:var(--ease-out-expo)] ${on ? "left-[24px]" : "left-[2px]"}`} />
    </button>
  );
}

export function Field({ label, hint, children, required }: { label: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#0f0f0f]">{label}{required && <span className="text-[#ff4d4f]"> *</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-[#6b6b7b]">{hint}</span>}
    </label>
  );
}

/* ---------- small display ---------- */

export function Pill({ tone = "green", children }: { tone?: "green" | "grey" | "red" | "orange" | "blue"; children: React.ReactNode }) {
  const t = { green: "bg-[#00a400] text-white", grey: "bg-[#8c8c8c] text-white", red: "bg-[#ff4d4f] text-white", orange: "bg-[#f2962c] text-white", blue: "bg-[#1677ff] text-white" }[tone];
  return <span className={`inline-flex h-5 items-center rounded-[25px] px-2 text-[10px] font-semibold uppercase tracking-wide ${t}`}>{children}</span>;
}

export function Note({ tone = "orange", children }: { tone?: "orange" | "yellow" | "blue"; children: React.ReactNode }) {
  const t = { orange: "bg-[#fdefdf] text-[#0f0f0f]", yellow: "border border-[#ffe58f] bg-[#fffbe6] text-[#0f0f0f]", blue: "bg-[#e6f4ff] text-[#0f0f0f]" }[tone];
  return (
    <div className={`flex items-start gap-2 rounded-md px-3 py-2 text-[12.5px] ${t}`}>
      <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-[#f2962c]" />
      <div>{children}</div>
    </div>
  );
}

export function StatCard({ label, value, sub, icon, delay = 0 }: { label: string; value: React.ReactNode; sub?: React.ReactNode; icon?: string; delay?: number }) {
  return (
    <div className="animate-rise flex min-w-[180px] flex-1 items-start gap-3 rounded-[10px] border border-[#ededed] bg-white p-4" style={{ ["--delay" as string]: `${delay}s` }}>
      {icon && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fdefdf] text-[#f2962c]"><Icon name={icon} className="h-5 w-5" /></span>}
      <div className="min-w-0">
        <p className="text-[12px] text-[#6b6b7b]">{label}</p>
        <p className="mt-0.5 text-[22px] font-semibold text-[#f2962c]">{value}</p>
        {sub && <p className="text-[11px] text-[#9b9bab]">{sub}</p>}
      </div>
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, locked = [] }: { tabs: T[]; value: T; onChange: (t: T) => void; locked?: T[] }) {
  return (
    <div className="flex gap-6 overflow-x-auto border-b border-[#ededed]">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} className={`relative flex shrink-0 items-center gap-1 pb-2.5 pt-1 text-[14px] transition-colors ${t === value ? "text-[#f2962c]" : "text-[#4a4a59] hover:text-[#0f0f0f]"}`}>
          {t}
          {locked.includes(t) && <Icon name="lock" className="h-3.5 w-3.5 text-[#f2962c]" />}
          <span className={`absolute inset-x-0 bottom-0 h-[2px] bg-[#f2962c] transition-transform duration-300 ${t === value ? "scale-x-100" : "scale-x-0"}`} />
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="inline-flex rounded-md border border-[#e1e1e1] bg-white p-0.5">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={`h-8 rounded px-3.5 text-[13px] transition ${o === value ? "bg-[#fdefdf] font-medium text-[#f2962c]" : "text-[#4a4a59] hover:text-[#0f0f0f]"}`}>{o}</button>
      ))}
    </div>
  );
}

/* ---------- empty states ---------- */

export function EmptyBox({ title, text, action }: { title: string; text?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <svg viewBox="0 0 96 80" className="h-20 w-24" aria-hidden>
        <ellipse cx="48" cy="70" rx="34" ry="6" fill="#f2f2f2" />
        <path d="M18 30 48 18l30 12v30L48 72 18 60Z" fill="#fafafa" stroke="#d9d9d9" strokeWidth="1.5" />
        <path d="M18 30 48 42l30-12M48 42v30" fill="none" stroke="#d9d9d9" strokeWidth="1.5" />
        <path d="M18 30 8 20l30-12 10 10M78 30l10-10-30-12-10 10" fill="#fff" stroke="#d9d9d9" strokeWidth="1.5" />
      </svg>
      <p className="mt-3 text-[15px] font-medium text-[#0f0f0f]">{title}</p>
      {text && <p className="mt-1 max-w-md text-[13px] text-[#6b6b7b]">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function EmptySearch({ title, text }: { title: string; text?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <svg viewBox="0 0 96 96" className="h-24 w-24" aria-hidden>
        <circle cx="48" cy="48" r="40" fill="#f1f6ff" />
        <circle cx="44" cy="42" r="18" fill="#fff" stroke="#9fb7e0" strokeWidth="3" />
        <path d="m57 55 14 14" stroke="#f2962c" strokeWidth="6" strokeLinecap="round" />
        <circle cx="38" cy="38" r="3" fill="#cfe0ff" />
      </svg>
      <p className="mt-3 text-[15px] font-medium text-[#0f0f0f]">{title}</p>
      {text && <div className="mt-1 max-w-md text-[13px] text-[#6b6b7b]">{text}</div>}
    </div>
  );
}

/* ---------- table ---------- */

export type Col<T> = { key: string; label: React.ReactNode; render?: (r: T) => React.ReactNode; className?: string; sort?: (a: T, b: T) => number };

export function DataTable<T extends { id: string }>({
  cols,
  rows,
  loading,
  empty,
  pageSize = 10,
  selectable,
  selected,
  onSelect,
}: {
  cols: Col<T>[];
  rows: T[];
  loading?: boolean;
  empty: React.ReactNode;
  pageSize?: number;
  selectable?: boolean;
  selected?: string[];
  onSelect?: (ids: string[]) => void;
}) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const c = cols.find((x) => x.key === sort.key);
    return c?.sort ? [...rows].sort((a, b) => c.sort!(a, b) * sort.dir) : rows;
  }, [rows, sort, cols]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const cur = Math.min(page, pages);
  const view = sorted.slice((cur - 1) * pageSize, cur * pageSize);
  const sel = selected || [];
  const allOn = view.length > 0 && view.every((r) => sel.includes(r.id));

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {selectable && (
                <th className="w-10 px-4 py-4">
                  <input type="checkbox" className="h-4 w-4 accent-[#f2962c]" checked={allOn} onChange={() => onSelect?.(allOn ? sel.filter((id) => !view.some((r) => r.id === id)) : [...new Set([...sel, ...view.map((r) => r.id)])])} aria-label="Select all" />
                </th>
              )}
              {cols.map((c) => (
                <th key={c.key} className={`px-4 py-4 text-[14px] font-medium text-[#0f0f0f] ${c.className ?? ""}`}>
                  {c.sort ? (
                    <button className="inline-flex items-center gap-1" onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 }))}>
                      {c.label}
                      <span className="flex flex-col text-[8px] leading-[6px] text-[#bfbfbf]"><span className={sort?.key === c.key && sort.dir === 1 ? "text-[#f2962c]" : ""}>▲</span><span className={sort?.key === c.key && sort.dir === -1 ? "text-[#f2962c]" : ""}>▼</span></span>
                    </button>
                  ) : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [0, 1, 2].map((i) => (
                <tr key={i}><td colSpan={cols.length + (selectable ? 1 : 0)} className="px-4 py-3"><div className="h-6 animate-pulse rounded bg-[#f2f2f2]" /></td></tr>
              ))
            ) : view.length === 0 ? (
              <tr><td colSpan={cols.length + (selectable ? 1 : 0)}>{empty}</td></tr>
            ) : (
              view.map((r, i) => (
                <tr key={r.id} className="animate-soft-fade border-b border-[#f0f0f0] transition-colors last:border-0 hover:bg-[#fafafa]" style={{ ["--delay" as string]: `${Math.min(i, 10) * 0.025}s` }}>
                  {selectable && (
                    <td className="px-4 py-3"><input type="checkbox" className="h-4 w-4 accent-[#f2962c]" checked={sel.includes(r.id)} onChange={() => onSelect?.(sel.includes(r.id) ? sel.filter((x) => x !== r.id) : [...sel, r.id])} aria-label="Select row" /></td>
                  )}
                  {cols.map((c) => (
                    <td key={c.key} className={`px-4 py-3 align-middle text-[#0f0f0f] ${c.className ?? ""}`}>{c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? "-")}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && (
        <div className="flex items-center justify-end gap-1 px-4 py-3 text-[13px]">
          <button disabled={cur <= 1} onClick={() => setPage(cur - 1)} className="grid h-8 w-8 place-items-center rounded-md text-[#4a4a59] hover:bg-black/5 disabled:opacity-30" aria-label="Previous page">‹</button>
          {Array.from({ length: pages }, (_, i) => i + 1).slice(Math.max(0, cur - 3), Math.max(0, cur - 3) + 5).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`h-8 min-w-8 rounded-md border px-2 ${p === cur ? "border-[#f2962c] text-[#f2962c]" : "border-transparent text-[#4a4a59] hover:bg-black/5"}`}>{p}</button>
          ))}
          <button disabled={cur >= pages} onClick={() => setPage(cur + 1)} className="grid h-8 w-8 place-items-center rounded-md text-[#4a4a59] hover:bg-black/5 disabled:opacity-30" aria-label="Next page">›</button>
        </div>
      )}
    </div>
  );
}

export function RowAction({ icon, title, onClick, href, danger }: { icon: string; title: string; onClick?: () => void; href?: string; danger?: boolean }) {
  const cls = `grid h-8 w-8 place-items-center rounded-md border border-[#ededed] bg-white transition ${danger ? "text-[#ff4d4f] hover:bg-[#fff2f0]" : "text-[#4a4a59] hover:border-[#f2962c] hover:text-[#f2962c]"}`;
  if (href) return <a href={href} target="_blank" rel="noreferrer" title={title} aria-label={title} className={cls}><Icon name={icon} className="h-4 w-4" /></a>;
  return <button title={title} aria-label={title} onClick={onClick} className={cls}><Icon name={icon} className="h-4 w-4" /></button>;
}

/* ---------- overlays ---------- */

function useEsc(onClose: () => void) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", on);
      document.body.style.overflow = "";
    };
  }, [onClose]);
}

/** Right-side drawer used for every "Create …" form, like the real dashboard. */
export function Drawer({ title, onClose, children, footer, width = "max-w-[620px]", right }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; width?: string; right?: React.ReactNode }) {
  const { me } = useMe();
  useEsc(onClose);
  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/45" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`flex h-full w-full ${width} animate-[drawer-in_.35s_var(--ease-out-expo)] flex-col bg-white shadow-2xl`} role="dialog" aria-label={title}>
        <div className="flex items-center gap-3 border-b border-[#ededed] px-5 py-3.5">
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full hover:bg-black/5"><Icon name="close" className="h-5 w-5" /></button>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#dcdcdc]"><Icon name="user" className="mt-1.5 h-7 w-7 text-white" /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-[#6b6b7b]">{me.name}</p>
            <p className="truncate text-[17px] font-semibold">{title}</p>
          </div>
          {right}
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-[#ededed] px-5 py-3.5">{footer}</div>}
      </div>
      <style>{`@keyframes drawer-in{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: React.ReactNode; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEsc(onClose);
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/45 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`animate-plan-show max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${wide ? "max-w-3xl" : "max-w-md"}`} role="dialog">
        <div className="flex items-center justify-between px-6 pb-2 pt-5">
          <h3 className="text-[17px] font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-black/5"><Icon name="close" className="h-5 w-5" /></button>
        </div>
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ title, text, okLabel = "Delete", onOk, onClose, danger = true }: { title: string; text: React.ReactNode; okLabel?: string; onOk: () => Promise<void> | void; onClose: () => void; danger?: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={title} onClose={onClose}>
      <div className="text-[14px] text-[#4a4a59]">{text}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant={danger ? "danger" : "orange"} disabled={busy} onClick={async () => { setBusy(true); try { await onOk(); onClose(); } finally { setBusy(false); } }}>{busy ? "Please wait…" : okLabel}</Btn>
      </div>
    </Modal>
  );
}

/* ---------- walkthrough strip & lock ---------- */

export function Walkthrough({ title, steps }: { title: string; steps?: [string, string][] }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const slides = steps && steps.length ? steps : [[title, "A short walkthrough of this page. Use the controls on the page to create, filter and export your data."]] as [string, string][];
  return (
    <>
      <button onClick={() => { setI(0); setOpen(true); }} className="animate-soft-fade mb-4 flex h-10 w-full items-center gap-2 rounded-md bg-[#e9f1ff] px-3 text-left text-[13px] text-[#0f0f0f] transition hover:bg-[#dde9ff]">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#1677ff] text-white"><Icon name="play" className="ml-0.5 h-3 w-3" /></span>
        <span className="text-[#4a4a59]">Video walkthrough</span>
        <span className="text-[#9b9bab]">&gt;</span>
        <span className="flex-1 truncate font-medium">{title}</span>
        <span className="text-[12px] font-semibold tracking-wide text-[#1677ff]">WATCH</span>
      </button>
      {open && (
        <Modal title={title} onClose={() => setOpen(false)} wide>
          <div key={i} className="animate-soft-fade">
            <div className="grid aspect-video place-items-center rounded-lg bg-gradient-to-br from-[#1d1d1d] to-[#3a2410] text-white">
              <div className="px-8 text-center">
                <p className="text-[12px] uppercase tracking-[0.2em] text-[#f2962c]">Step {i + 1} of {slides.length}</p>
                <p className="mt-2 text-[24px] font-semibold">{slides[i][0]}</p>
              </div>
            </div>
            <p className="mt-4 text-[14px] text-[#4a4a59]">{slides[i][1]}</p>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex gap-1.5">{slides.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-[#f2962c]" : "w-1.5 bg-black/15"}`} />)}</div>
            <div className="flex gap-2">
              {i > 0 && <Btn variant="outline" onClick={() => setI(i - 1)}>Back</Btn>}
              <Btn onClick={() => (i < slides.length - 1 ? setI(i + 1) : setOpen(false))}>{i < slides.length - 1 ? "Next" : "Done"}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export function LockedCard({ title }: { title: string }) {
  return (
    <Panel className="p-5">
      <Title>{title}</Title>
      <div className="mt-4 flex flex-col items-center rounded-[10px] border border-[#ededed] px-6 py-10 text-center">
        <Icon name="lock" className="h-12 w-12 text-[#0f0f0f]" />
        <p className="mt-3 text-[22px] font-semibold">This feature is locked!</p>
        <p className="mt-2 text-[13px] text-[#4a4a59]">
          To access this premium feature, upgrade your plan from Billing &amp; Plans &gt; <Link href={dash("plans")} className="text-[#1677ff] hover:underline">Plans</Link>.
        </p>
      </div>
    </Panel>
  );
}

/** Renders the page only when the creator's plan includes the feature; otherwise the real lock screen. */
export function Gate({ feature, title, children }: { feature: string; title: string; children: React.ReactNode }) {
  const { me } = useMe();
  if (isLocked(feature, me.plan)) return <LockedCard title={title} />;
  return <>{children}</>;
}
