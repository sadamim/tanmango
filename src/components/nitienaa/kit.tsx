import type { ReactNode } from "react";
import Reveal from "../Reveal";
import SplitHeading, { type Segment } from "../SplitHeading";

/** Shared pieces for the Nitienaa sections of the home page, in the TagMango style. */
export const input = "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] text-ink outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100";
export const label = "mb-1.5 block text-sm font-medium text-ink";
export const mangoBtn = "bg-mango inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_30px_-8px_rgba(255,106,0,0.7)] transition hover:brightness-110 disabled:opacity-60";
export const inkBtn = "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-black disabled:opacity-60";
export const outlineBtn = "inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-[15px] font-semibold text-ink transition hover:bg-[#f4f1ec]";
export const card = "rounded-[24px] bg-white p-6 md:rounded-[32px] md:p-8";

/** Opening of a header topic: heading plus pill links to the topic's sections. */
export function TopicHead({ eyebrow, segments, sub, pills, dark = false }: { eyebrow: string; segments: Segment[]; sub: string; pills: [string, string][]; dark?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-orange-300" : "text-orange-500"}`}>{eyebrow}</p>
      <SplitHeading className={`mt-3 font-display text-[30px] font-bold leading-[1.15] tracking-tight md:text-[52px] ${dark ? "text-white" : "text-ink"}`} segments={segments} />
      <Reveal delay={0.3}>
        <p className={`mx-auto mt-4 max-w-2xl md:text-lg ${dark ? "text-white/70" : "text-ink/60"}`}>{sub}</p>
        <nav aria-label={`${eyebrow} sections`} className="mt-8 flex flex-wrap justify-center gap-2">
          {pills.map(([l, id]) => (
            <a key={id} href={`#${id}`} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${dark ? "border-white/15 bg-white/[0.06] text-white/90 hover:bg-white/[0.12]" : "border-black/10 bg-white text-ink/80 hover:text-ink"}`}>
              {l}
            </a>
          ))}
        </nav>
      </Reveal>
    </div>
  );
}

/** Top of a header-topic page, in the same style as the Pricing page hero, with links to the page's sections. */
export function PageHero({ eyebrow, segments, sub, pills }: { eyebrow: string; segments: Segment[]; sub: string; pills: [string, string][] }) {
  return (
    <section className="relative overflow-hidden bg-ink px-4 pb-20 pt-36 text-center text-white">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-72 w-[900px] -translate-x-1/2 rounded-[50%] bg-[#ff6a00]/30 blur-[90px]" />
      <p className="animate-rise relative text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">{eyebrow}</p>
      <SplitHeading as="h1" auto delay={0.1} className="relative mt-3 font-display text-[36px] font-bold leading-[1.1] tracking-tight md:text-[60px]" segments={segments} />
      <p className="animate-rise relative mx-auto mt-5 max-w-2xl text-white/70 md:text-lg" style={{ ["--delay" as string]: "0.5s" }}>{sub}</p>
      <nav aria-label={`${eyebrow} sections`} className="animate-rise relative mt-8 flex flex-wrap justify-center gap-2" style={{ ["--delay" as string]: "0.6s" }}>
        {pills.map(([l, id]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/[0.12]">
            {l}
          </a>
        ))}
      </nav>
    </section>
  );
}

/** Sub-heading for a section inside a topic. */
export function SubHead({ id, eyebrow, title, sub, dark = false, children }: { id: string; eyebrow: string; title: string; sub?: string; dark?: boolean; children?: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-28">
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-orange-300" : "text-orange-500"}`}>{eyebrow}</p>
      <h3 className={`mt-2 font-display text-[26px] font-bold leading-tight tracking-tight md:text-[36px] ${dark ? "text-white" : "text-ink"}`}>{title}</h3>
      {sub && <p className={`mt-3 max-w-2xl ${dark ? "text-white/70" : "text-ink/60"}`}>{sub}</p>}
      {children}
    </div>
  );
}

/** Grey box marking where the client's own photo goes. */
export function Photo({ label: l, className = "" }: { label: string; className?: string }) {
  return (
    <div role="img" aria-label={l} className={`grid place-items-center rounded-[24px] border border-dashed border-black/15 bg-[#f6f2ef] p-4 text-center text-xs font-medium uppercase tracking-wider text-ink/50 ${className}`}>
      {l}
    </div>
  );
}
