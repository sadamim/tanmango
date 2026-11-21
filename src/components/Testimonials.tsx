"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import SplitHeading from "./SplitHeading";
import Reveal from "./Reveal";

const T = "/tagmango/testimonials";

const stories = [
  { stat: "₹50 L+", sub: "in 6 months", name: "Alok Taunk", role: "Mindfulness Coach", org: "The Mindful Community · 5L+ lives impacted", quote: "With TagMango, I can run courses, collect payments and gamify learners' journey without any technical hassle.", tags: ["Courses", "Payments", "Gamification"], img: "alok" },
  { stat: "₹2.5 Cr+", sub: "earned", name: "Kartika Nair", role: "Life Coach", org: "Synchro Shakti · 41K+ students", quote: "TagMango keeps our live classes, courses, and automations in one place, making the community effortless to run.", tags: ["Zoom", "Community", "Automations"], img: "kartika" },
  { stat: "70%", sub: "community retention rate", name: "Dr. Manan Vora", role: "Orthopedic Surgeon & Health Educator", org: "Pain Free Club · 5L+ lives impacted", quote: "The platform is so intuitive that even my senior members could adapt, engage and learn without any friction.", tags: ["Courses", "Community", "Gamification"], img: "manan" },
  { stat: "₹1 Cr", sub: "in 1 day", name: "Praveen Calvin", role: "Digital Coach", org: "Calzol Hub · 1M+ impacted", quote: "TagMango gave me the backend depth and scalability I was missing with other LMS platforms.", tags: ["Courses", "Community", "Automations"], img: "praveen" },
  { stat: "80%", sub: "community retention rate", name: "Manjula Ghattamaneni", role: "Wellness Coach", org: "Mann Ghatt · 6+ countries", quote: "Tasks and challenges on TagMango keep my community engaged, and they love the experience.", tags: ["Community", "Gamification", "Analytics"], img: "manjula" },
  { stat: "₹1.48 Cr", sub: "per year", name: "Kunaal Naik", role: "AI Agents Strategist", org: "Data Science Masterminds · 7+ countries", quote: "Easy payments took my community global, while built-in Zoom and automations simplified delivery.", tags: ["Payments", "Courses", "Zoom"], img: "kunaal" },
];

/* Geometry measured from tagmango.com at 1440px: a 1304×473 stage, 760×473 cards, transform-origin top-left. */
const STAGE_W = 1304;
const CARD_W = 760;
const CARD_H = 473;
type St = { x: number; y: number; sx: number; sy: number; o: number };
function stateFor(off: number): St {
  const a = Math.abs(off);
  if (a === 0) return { x: 272, y: 0, sx: 1, sy: 1, o: 1 };
  if (a === 1) return { x: off < 0 ? 120 : 1056, y: 45.5, sx: 128 / CARD_W, sy: 382 / CARD_H, o: 1 };
  if (a === 2) return { x: off < 0 ? 0 : 1208, y: 110.5, sx: 96 / CARD_W, sy: 252 / CARD_H, o: 1 };
  return { x: off < 0 ? -120 : 1328, y: 110.5, sx: 96 / CARD_W, sy: 252 / CARD_H, o: 0 };
}
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DUR = 700;

function Card({ s, off, onClick }: { s: (typeof stories)[number]; off: number; onClick: () => void }) {
  const st = stateFor(Math.max(-3, Math.min(3, off)));
  const center = off === 0;
  // Visual 32px corners and an ~8px white frame regardless of the card's scale.
  const r = `${32 / st.sx}px / ${32 / st.sy}px`;
  const ph = center
    ? { left: CARD_W - 24 - 336, top: 24, width: 336, height: CARD_H - 48, r: "24px" }
    : { left: 8 / st.sx, top: 8 / st.sy, width: CARD_W - 16 / st.sx, height: CARD_H - 16 / st.sy, r: `${24 / st.sx}px / ${24 / st.sy}px` };
  const tr = `transform ${DUR}ms ${EASE}, border-radius ${DUR}ms ${EASE}, opacity ${DUR}ms ${EASE}`;
  return (
    <div
      role={center ? undefined : "button"}
      tabIndex={center || Math.abs(off) > 2 ? -1 : 0}
      aria-label={center ? undefined : `Show ${s.name}'s story`}
      onClick={center ? undefined : onClick}
      onKeyDown={(e) => !center && (e.key === "Enter" || e.key === " ") && onClick()}
      className={`absolute left-0 top-0 overflow-hidden bg-white shadow-[0_0_10px_rgba(17,17,17,0.1)] ${center ? "z-10" : "cursor-pointer"} ${Math.abs(off) > 2 ? "pointer-events-none" : ""}`}
      style={{ width: CARD_W, height: CARD_H, borderRadius: r, opacity: st.o, transformOrigin: "0 0", transform: `translate(${st.x}px, ${st.y}px) scale(${st.sx}, ${st.sy})`, transition: tr }}
    >
      {/* text side */}
      <div className="absolute inset-y-0 left-0 flex w-[376px] flex-col p-8" style={{ opacity: center ? 1 : 0, transition: `opacity ${center ? 450 : 200}ms ${EASE} ${center ? 250 : 0}ms` }}>
        <p className="font-display text-[48px] font-bold leading-none text-[#111]">{s.stat}</p>
        <p className="mt-1 text-[15px] text-[#111]/50">{s.sub}</p>
        <p className="mt-6 font-display text-[18px] font-semibold">{s.name}</p>
        <p className="text-[14px] text-[#111]/60">{s.role}</p>
        <p className="text-[12px] text-[#111]/40">{s.org}</p>
        <div className="mt-auto">
          <span className="text-mango font-display text-[40px] leading-none">“</span>
          <p className="text-[15px] leading-relaxed text-[#111]/85">{s.quote}</p>
          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-[#111]/40">Runs on:</span>
            {s.tags.map((t) => <span key={t} className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[#111]/70">{t}</span>)}
          </div>
        </div>
      </div>
      {/* photo: fills the card when on the side, becomes the right-hand panel in the centre */}
      <div
        className="absolute overflow-hidden bg-[#f6f2ef]"
        style={{ left: ph.left, top: ph.top, width: ph.width, height: ph.height, borderRadius: ph.r, transition: `left ${DUR}ms ${EASE}, top ${DUR}ms ${EASE}, width ${DUR}ms ${EASE}, height ${DUR}ms ${EASE}, border-radius ${DUR}ms ${EASE}` }}
      >
        {/* Counter-scale so the photo keeps its real aspect ratio while the card itself is squashed. */}
        <img
          src={`${T}/${s.img}-v3.webp`}
          alt={s.name}
          draggable={false}
          className="absolute left-0 top-0 max-w-none object-cover object-center"
          style={{
            width: ph.width * st.sx,
            height: ph.height * st.sy,
            transform: `scale(${1 / st.sx}, ${1 / st.sy})`,
            transformOrigin: "0 0",
            transition: `width ${DUR}ms ${EASE}, height ${DUR}ms ${EASE}, transform ${DUR}ms ${EASE}`,
          }}
        />
        {center && (
          <span aria-hidden className="animate-soft-fade absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-black/45 text-white backdrop-blur" style={{ ["--delay" as string]: "0.4s" }}>
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor"><path d="M8 5v14l11-7Z" /></svg>
          </span>
        )}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [i, setI] = useState(0);
  const [k, setK] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  const n = stories.length;

  useEffect(() => {
    const t = setTimeout(() => setI((v) => (v + 1) % n), 6000);
    return () => clearTimeout(t);
  }, [i, n]);

  // Scale the fixed-size stage down to fit narrower screens (desktop/tablet).
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setK(Math.min(1, el.clientWidth / STAGE_W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const offset = (j: number) => {
    let off = j - i;
    if (off > n / 2) off -= n;
    if (off < -n / 2) off += n;
    return off;
  };
  const s = stories[i];

  return (
    <section className="relative isolate overflow-x-clip py-16 md:py-20 lg:py-[120px]">
      <div className="pointer-events-none absolute inset-x-0 -top-[105px] bottom-0 -z-10">
        <img src={`${T}/bg-light.webp`} alt="" className="h-full w-full object-fill" />
      </div>
      <div className="px-4 text-center">
        <SplitHeading
          className="font-display text-[32px] font-bold leading-[1.15] tracking-tight text-ink md:text-[52px]"
          segments={[{ text: "Real Coaches.", br: true }, { text: "Remarkable Growth." }]}
        />
        <Reveal delay={0.3}>
          <p className="mt-4 text-ink/60 md:text-lg">When expertise meets the right system, the results speak for themselves.</p>
        </Reveal>
      </div>

      {/* Desktop / tablet: morphing carousel */}
      <Reveal delay={0.15} className="mx-auto mt-12 hidden max-w-[1304px] px-4 md:block lg:px-0">
        <div ref={box} className="relative w-full" style={{ height: CARD_H * k }}>
          <div className="absolute left-0 top-0" style={{ width: STAGE_W, height: CARD_H, transform: `scale(${k})`, transformOrigin: "0 0" }}>
            {stories.map((st, j) => <Card key={st.name} s={st} off={offset(j)} onClick={() => setI(j)} />)}
          </div>
        </div>
      </Reveal>

      {/* Mobile: single card */}
      <div className="mx-4 mt-10 md:hidden">
        <div key={i} className="animate-soft-fade overflow-hidden rounded-[24px] bg-white p-2 shadow-[0_0_10px_rgba(17,17,17,0.1)]">
          <img src={`${T}/${s.img}-mobile-v3.webp`} alt={s.name} className="aspect-[4/3] w-full rounded-[18px] object-cover" />
          <div className="p-4">
            <p className="font-display text-[36px] font-bold leading-none">{s.stat}</p>
            <p className="text-[#111]/50">{s.sub}</p>
            <p className="mt-4 font-semibold">{s.name}</p>
            <p className="text-[13px] text-[#111]/60">{s.role} · {s.org}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-[#111]/85">“{s.quote}”</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {stories.map((st, j) => (
          <button key={st.name} aria-label={`Show story ${j + 1}`} onClick={() => setI(j)} className={`relative h-2 overflow-hidden rounded-full transition-[width,background-color] duration-[600ms] [transition-timing-function:var(--ease-out-expo)] ${j === i ? "w-20 bg-black/10" : "w-2 bg-black/15"}`}>
            {j === i && <span key={i} className="bg-mango absolute inset-y-0 left-0 animate-[grow_6s_linear_forwards]" />}
          </button>
        ))}
      </div>
      <style>{`@keyframes grow{from{width:0}to{width:100%}}`}</style>
    </section>
  );
}
