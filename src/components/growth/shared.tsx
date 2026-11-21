"use client";
import { useEffect, useState } from "react";
import { api, useCollection, type Row } from "@/lib/client";
import { Panel } from "@/components/dash/kit";

export type GrowthDoc = Row & {
  slug: string; coachName?: string; programme?: string; tagline?: string; alertEmail?: string; alertWhatsapp?: string; programmeMango?: string; kickoff?: string;
  callLink?: string; boundaryLine?: string; referralLine?: string; consentLine?: string; replayHours?: number; hookKey?: string;
  quiz?: { patterns: { id: string; name: string; blurb?: string; bullets: { id: string; text: string; score: number }[] }[]; rules: { present: number; blend: number; lowBelow: number; highFrom: number } };
  resultEmails?: Record<string, { subject?: string; body?: string; pdfUrl?: string }>;
  bio?: { headline?: string; sub?: string; buttons?: { id: string; label: string; url: string }[] };
};

/** The creator's growth settings. Created on first visit (with sample Pattern Check content). */
export function useGrowthDoc() {
  const col = useCollection<GrowthDoc>("growth");
  const [made, setMade] = useState(false);
  useEffect(() => {
    // only create the settings when there are none; otherwise the single list request above is all that's needed
    if (!col.loading && col.rows.length === 0 && !made) {
      setMade(true);
      api("/api/growth", "POST", { action: "ensure" }).then(() => col.reload());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [col.loading, col.rows.length]);
  const g = col.rows[0] as GrowthDoc | undefined;
  return { g, ready: !!g, save: async (patch: Record<string, unknown>) => (g ? col.update(g.id, patch) : undefined), reload: col.reload };
}

export const origin = () => (typeof window === "undefined" ? "" : window.location.origin);

export function Bar({ pct, tone = "#f2962c" }: { pct: number; tone?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: tone }} />
    </div>
  );
}

export function Section({ title, sub, children, right }: { title: string; sub?: React.ReactNode; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[16px] font-semibold">{title}</h3>
          {sub && <p className="mt-0.5 text-[12.5px] text-[#6b6b7b]">{sub}</p>}
        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </Panel>
  );
}

export const PATTERN_COLORS = ["#f2962c", "#1677ff", "#2e9e4f", "#a855f7", "#e11d48", "#0891b2", "#65a30d", "#db2777"];
