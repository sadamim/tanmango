import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/growth/Public";
import { growthBySlug } from "@/lib/growth/core";
import { store } from "@/lib/db";
import type { Lead } from "@/lib/growth/model";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your Pattern Check result", robots: { index: false } };

export default async function Result({ params }: { params: Promise<{ slug: string; leadId: string }> }) {
  const { slug, leadId } = await params;
  const g = await growthBySlug(slug);
  const lead = (await store.get("crm", leadId)) as unknown as Lead | null;
  if (!g || !lead || lead.userId !== g.userId || !lead.pattern) notFound();
  const r = lead.pattern;
  const patterns = g.quiz?.patterns || [];
  const nm = (id?: string) => patterns.find((p) => p.id === id);
  const prim = nm(r.primary);
  return (
    <PublicShell coach={g.coachName} programme={g.programme}>
      <p className="text-center text-[13px] uppercase tracking-wider text-[#888]">Your result, {lead.name.split(" ")[0]}</p>
      <h1 className="mt-2 text-center text-[32px] font-semibold leading-tight">{prim?.name}</h1>
      <p className="mt-1 text-center text-[14px] text-[#666]">{r.type}{r.secondary ? ` with ${nm(r.secondary)?.name}` : ""}{r.third ? ` and ${nm(r.third)?.name}` : ""}</p>
      {prim?.blurb && <p className="mt-4 text-center text-[16px] text-[#444]">{prim.blurb}</p>}
      {r.flag && <p className="mt-4 rounded-lg bg-[#f1efe8] p-3 text-center text-[14px] text-[#555]">{r.flag === "low" ? "None of the four patterns stands out strongly for you right now. That is useful to know too." : "All four patterns showed up strongly. You are carrying a lot. Be gentle with yourself."}</p>}
      <div className="mt-6 space-y-3">
        {patterns.map((p) => (
          <div key={p.id}>
            <div className="flex justify-between text-[14px]"><span className={p.id === r.primary ? "font-semibold" : ""}>{p.name}</span><b>{r.pct[p.id] ?? 0}%</b></div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e8e8e2]"><div className="h-full rounded-full bg-[#111]" style={{ width: `${r.pct[p.id] ?? 0}%` }} /></div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-[14px] text-[#555]">We&apos;ve emailed your result to {lead.email}.</p>
      <div className="mt-6 space-y-2">
        <Link href={`/m/${slug}`} className="block rounded-lg bg-[#111] px-5 py-3 text-center font-semibold text-white">Join the free masterclass</Link>
        <Link href={`/call/${slug}?e=${encodeURIComponent(lead.email)}`} className="block rounded-lg border border-[#ccc] bg-white px-5 py-3 text-center">Book a one-to-one conversation</Link>
      </div>
    </PublicShell>
  );
}
