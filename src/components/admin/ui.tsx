"use client";
import type { Plan } from "@/components/dash/nav";

export function PageHead({ title, sub, right }: { title: string; sub?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="animate-soft-fade mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-bold leading-tight">{title}</h1>
        {sub && <p className="mt-1 text-[14px] text-[#6b6b7b]">{sub}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

const PLAN: Record<Plan, string> = {
  basic: "bg-[#f0f0f0] text-[#4a4a59]",
  pro: "bg-[#e6f4ff] text-[#0958d9]",
  advanced: "bg-[#fff1e3] text-[#c7740f]",
  ultimate: "bg-[#f3e8ff] text-[#7c3aed]",
};
export function PlanBadge({ plan }: { plan: Plan }) {
  return <span className={`inline-flex h-5 items-center rounded-full px-2.5 text-[11px] font-semibold uppercase tracking-wide ${PLAN[plan]}`}>{plan}</span>;
}

export function Initial({ name, size = 34 }: { name: string; size?: number }) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.4, background: `hsl(${hue} 55% 48%)` }}>
      {name.trim()[0]?.toUpperCase() || "?"}
    </span>
  );
}

export const when = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—");
export const day = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

export function Skeleton({ h = 120 }: { h?: number }) {
  return <div className="animate-pulse rounded-[10px] bg-white" style={{ height: h }} />;
}

export function ErrorBox({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="rounded-[10px] border border-[#ffccc7] bg-[#fff2f0] p-5 text-[14px] text-[#cf1322]">
      {message}
      {retry && <button onClick={retry} className="ml-3 underline">Retry</button>}
    </div>
  );
}
