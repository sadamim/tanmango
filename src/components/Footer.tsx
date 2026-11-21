import Link from "next/link";
import { Arrow, GhostButton } from "./ui";
import SplitHeading from "./SplitHeading";
import Reveal from "./Reveal";

const links = [
  ["Skool Alternative", "https://tagmango.com/skool-alternative"],
  ["Graphy Alternative", "https://tagmango.com/graphy-alternative"],
  ["Blog", "https://tagmango.com/blog/"],
  ["Pricing", "/pricing"],
  ["Newsletter", "https://themangonetwork.substack.com/"],
  ["Support", "https://help.tagmango.com/"],
  ["Careers", "https://tagmango.notion.site/Job-Board-8851736ceeb54547b12f3a004f03c585"],
  ["Edarya", "https://www.edarya.io/"],
  ["AI Fiesta", "https://aifiesta.ai/"],
];

const C = "/tagmango/cta";
const FADE_X = "linear-gradient(90deg, transparent 0, #000 120px, #000 calc(100% - 120px), transparent 100%)";
const FADE_Y = "linear-gradient(#000 0%, #000 28%, rgba(0,0,0,0.55) 46%, rgba(0,0,0,0.22) 60%, rgba(0,0,0,0.06) 72%, transparent 82%)";

/** 11 portrait strips (152×690) that scroll forever; neighbours move in opposite directions (~16px/s, as on tagmango.com). */
function PhotoWall() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden overflow-hidden md:block" style={{ height: 781, maskImage: FADE_Y, WebkitMaskImage: FADE_Y }}>
        <div className="absolute bottom-[2px] left-1/2 top-0 w-[max(1448px,100%)] -translate-x-1/2 overflow-hidden" style={{ maskImage: FADE_X, WebkitMaskImage: FADE_X }}>
          <div className="absolute left-1/2 top-0 h-full w-[1772px] -translate-x-1/2">
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className="absolute top-0 h-full w-[152px] overflow-hidden" style={{ left: i * 162 }}>
                <div className={i % 2 ? "photo-wall-up" : "photo-wall-down"}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${C}/strip-${i}-v3.webp`} alt="" loading="lazy" className="block h-[690px] w-[152px]" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${C}/strip-${i}-v3.webp`} alt="" loading="lazy" className="block h-[690px] w-[152px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Mobile: two strips */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[calc(100vw*360/390)] justify-center gap-2 overflow-hidden md:hidden" style={{ maskImage: FADE_Y, WebkitMaskImage: FADE_Y }}>
        {["strip-m3-v1", "strip-m5-v1"].map((m, i) => (
          <div key={m} className="w-[46%] overflow-hidden">
            <div className={i ? "photo-wall-up" : "photo-wall-down"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${C}/${m}.webp`} alt="" className="block w-full" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${C}/${m}.webp`} alt="" className="block w-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const socials = [
  "M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L6 22H2.9l7.5-8.6L2.5 2h6.6l4.5 6.6L18.9 2Z",
  "M14 8V6c0-.9.6-1 1-1h3V1h-4c-4 0-5 3-5 5v2H6v4h3v11h5V12h3.5l.5-4Z",
  "M12 7a5 5 0 1 0 5 5 5 5 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm5-9.5a1.2 1.2 0 1 0 1.2 1.2A1.2 1.2 0 0 0 17 5.5ZM16 2H8a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6Z",
  "M4 9h4v12H4Zm2-6a2 2 0 1 1-2 2 2 2 0 0 1 2-2Zm4 6h4v2c.6-1 2-2.3 4-2.3 4 0 4.5 2.6 4.5 6V21h-4v-5.3c0-1.3 0-3-1.8-3S15 14 15 15.6V21h-4Z",
  "M23 7.2a3 3 0 0 0-2-2.1C19.2 4.6 12 4.6 12 4.6s-7.2 0-9 .5a3 3 0 0 0-2 2.1A31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2 2.1c1.8.5 9 .5 9 .5s7.2 0 9-.5a3 3 0 0 0 2-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15V9l6 3Z",
];

export default function Footer() {
  return (
    <section className="relative bg-white px-2 pb-2">
      <div className="relative overflow-hidden rounded-[32px] bg-ink text-white">
        <PhotoWall />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${C}/logo-desktop-v5.webp`} alt="" aria-hidden className="pointer-events-none absolute left-1/2 top-[646px] hidden aspect-[2244/484] w-[min(1120px,calc(100%-48px))] -translate-x-1/2 object-contain md:block md:max-lg:top-[665px] lg:top-[592px]" />

        <div className="relative mx-auto grid max-w-[1280px] gap-10 px-6 pt-[calc(100vw*360/390)] md:grid-cols-2 md:items-end md:px-10 md:pt-[390px] lg:px-20">
          <div>
            <SplitHeading
              className="!justify-start font-display text-[34px] font-bold leading-[1.1] tracking-tight max-md:!justify-center md:text-[52px]"
              segments={[{ text: "Launch or scale.", br: true }, { text: "We made both", br: true }, { text: "stupid" }, { text: "simple.", gradient: true }]}
            />
            <Reveal delay={0.4}>
              <p className="mt-4 text-white/80">Mango AI runs the business. You approve.</p>
            </Reveal>
          </div>
          <Reveal delay={0.5} className="flex flex-col gap-3 md:max-w-sm md:justify-self-end">
            <Link
              href="/web/sign-up"
              className="bg-mango inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 font-semibold text-white"
            >
              Get Started <Arrow />
            </Link>
            <GhostButton>Book a Demo</GhostButton>
            <p className="text-center text-[11px] uppercase tracking-wider text-white/40">
              Thirty minutes. Walk out with a plan for your first launch, or your next one.
            </p>
          </Reveal>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${C}/logo-mobile-v3.webp`} alt="" aria-hidden className="pointer-events-none mx-auto mt-10 block w-[calc(100%-32px)] md:hidden" />
        <div className="hidden h-[calc(23px+(100vw-48px)*0.2)] md:block lg:h-[240px]" />

        <div className="relative mx-auto grid max-w-[1280px] gap-10 px-6 pb-10 md:grid-cols-[1.2fr_2fr] md:px-10 lg:px-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Operating address</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">Office #301, Twin Towers, Tower 2, EN 69, Sector V, Bidhannagar, Kolkata, West Bengal 700091</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {links.map(([l, h]) => (
              <a key={l} href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-white/80 transition hover:text-white">
                {l}
              </a>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex max-w-[1280px] flex-col gap-6 border-t border-white/10 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10 lg:px-20">
          <div className="flex gap-2">
            {socials.map((d, i) => (
              <a key={i} href="#" aria-label="Social link" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d={d} /></svg>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/50">
            {["Privacy Policy", "Terms of Use", "Refund Policy", "Cookie Policy"].map((l) => (
              <Link key={l} href="#" className="hover:text-white">{l}</Link>
            ))}
          </div>
          <p className="text-xs text-white/40">TagMango Inc. © {new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </div>
    </section>
  );
}
