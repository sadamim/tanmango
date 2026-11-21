/* eslint-disable @next/next/no-img-element */
import Counter from "./Counter";
import SplitHeading from "./SplitHeading";
import { Arrow, GhostButton } from "./ui";

const A = "/tagmango";
const COLS = ["portrait-col-1-v5", "portrait-col-2-v6", "portrait-col-3-v5", "portrait-col-4-v5", "portrait-col-5-v5", "portrait-col-6-v5", "portrait-col-7-v5", "portrait-col-8-v5"];

const stats = [
  { value: "10,000+", label: "Creators" },
  { value: "₹1,000 Cr+", label: "Yearly creator earnings" },
  { value: "1 Cr+", label: "Learners impacted" },
];

const delay = (s: number) => ({ ["--delay" as string]: `${s}s` });
const FADE = "linear-gradient(rgb(0,0,0) 0%, rgb(0,0,0) 52%, rgba(0,0,0,0.78) 61%, rgba(0,0,0,0.5) 69%, rgba(0,0,0,0.26) 76%, rgba(0,0,0,0.1) 82%, rgba(0,0,0,0.03) 88%, transparent 94%)";

export default function Hero() {
  return (
    <section className="relative z-10 bg-[#111111] text-white">
      <div className="absolute inset-0 overflow-hidden">
        {/* Mobile: one combined portrait image */}
        <div className="animate-column-up absolute inset-x-0 top-0 aspect-[390/420] md:hidden" style={{ maskImage: FADE, WebkitMaskImage: FADE }}>
          <img src={`${A}/hero/mobile-portraits-v5.webp`} alt="" className="h-full w-full object-cover" />
        </div>
        {/* Desktop: 8 creator columns, each rising in 60ms after the previous one */}
        <div
          className="absolute inset-x-0 top-0 hidden h-[clamp(358px,calc(232.8px+32.1vw),695px)] overflow-hidden md:flex xl:h-[calc(100vw*695/1440)]"
          style={{ maskImage: FADE, WebkitMaskImage: FADE }}
        >
          {COLS.map((c, i) => (
            <div key={c} className={`animate-column-up relative h-full flex-1 overflow-hidden ${i > 5 ? "max-lg:hidden" : ""}`} style={delay(i * 0.06)}>
              <img src={`${A}/hero/${c}.webp`} alt="" fetchPriority={i < 4 ? "high" : "auto"} className="absolute inset-0 h-full w-full origin-top scale-[1.18] object-cover" />
            </div>
          ))}
        </div>
        {/* Orange glow band along the bottom edge */}
        <div className="absolute inset-x-0 bottom-0 hidden h-[186px] bg-[length:1360px_186px] bg-bottom bg-no-repeat md:block" style={{ backgroundImage: `url(${A}/hero/glow-band-v2.webp)` }} />
        <div className="absolute inset-x-0 bottom-0 aspect-[390/110] bg-cover bg-bottom md:hidden" style={{ backgroundImage: `url(${A}/hero/glow-band-mobile.webp)` }} />
      </div>

      <div className="relative mx-auto flex min-h-[817px] max-w-5xl flex-col items-center px-4 pb-24 pt-[300px] text-center md:pt-[clamp(220px,calc(100vw*370/1440),370px)]">
        <SplitHeading
          as="h1"
          auto
          delay={0.1}
          className="font-display text-[34px] font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-[60px] lg:text-[64px]"
          segments={[{ text: "India’s Largest", br: true }, { text: "Creator Economy" }, { text: "Platform" }]}
        />
        <p className="animate-rise mt-5 max-w-2xl text-[15px] leading-[1.5] text-white/80 sm:text-[18px]" style={delay(0.34)}>
          Your all-in-one, AI-powered system. Community, courses, workshops, coaching, payments, your own app &amp; more.
        </p>

        <div className="animate-rise mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row md:gap-4" style={delay(0.42)}>
          <a
            href="/web/sign-up"
            className="bg-mango group inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_30px_-8px_rgba(255,106,0,0.7)] transition hover:brightness-110 sm:w-[200px]"
          >
            Get Started <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <GhostButton className="w-full sm:w-[200px]">Book a Demo</GhostButton>
        </div>

        <ul className="animate-rise mt-12 grid w-full max-w-2xl grid-cols-3 gap-4 md:gap-16" style={delay(0.5)}>
          {stats.map((s) => (
            <li key={s.label} className="flex flex-col items-center">
              <Counter value={s.value} className="font-display text-[20px] font-bold md:text-[24px]" />
              <span className="mt-2 text-[10px] font-medium uppercase tracking-wider text-white/50 sm:text-[11px]">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mango badge sitting on the seam */}
      <div className="pointer-events-none absolute -bottom-[31px] left-1/2 z-20 flex size-16 -translate-x-1/2 items-center justify-center rounded-full bg-[radial-gradient(64px_1006.5px_at_100%_50%,#f6bb22_0%,#fb9311_50%,#ff6a00_100%)] shadow-[0_0_40px_8px_rgba(255,106,0,0.45)]">
        <img src={`${A}/hero/mango-icon.svg`} alt="" className="h-full w-full" />
      </div>
    </section>
  );
}
