"use client";
import { useEffect, useRef, useState } from "react";

const tools = ["ConvertKit:convertkit", "Razorpay:razorpay", "Stripe:stripe", "FirstPromoter:firstpromoter", "Zoom:zoom", "Slack:slack", "Kajabi:kajabi", "Teachable:teachable", "Mighty Networks:mighty-networks", "Wix:wix", "Lovable:lovable", "Zoho:zoho"].map((x) => {
  const [n, f] = x.split(":");
  return { n, src: `/tagmango/integrations/${f}.webp` };
});

const clamp = (v: number) => Math.min(Math.max(v, 0), 1);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const COLS = 6;

/**
 * Scroll-scrubbed sequence:
 *  0.00–0.15  tiles settle in, tape sits over the headline
 *  0.15–0.55  tiles fly into the centre and shrink away; mango icon scales up
 *  0.45–0.75  tape peels off left→right (roll + shade travel along the edge),
 *             revealing "Now in one place"
 *  0.75+      glow pulses behind the icon, subtitle rises in
 */
export default function OnePlace() {
  const wrap = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = wrap.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        setP(clamp(-r.top / total));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const merge = easeInOut(clamp((p - 0.15) / 0.4));
  const peel = easeInOut(clamp((p - 0.45) / 0.3));
  const done = p > 0.75;

  return (
    <section className="relative bg-white">
      <div ref={wrap} style={{ height: "260vh" }}>
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-4">
          <h2 className="flex w-full flex-col items-center text-center font-display text-[30px] font-bold leading-tight tracking-tight text-ink md:text-[44px]">
            <span className="relative z-[4]">Your whole business,</span>
            <span className="mt-[0.2em] grid w-full justify-items-center">
              {/* Revealed text (under the tape) */}
              <span className="text-mango relative z-[2] whitespace-nowrap [grid-area:1/1]">Now in one place</span>
              {/* Tape */}
              <span aria-hidden className="relative z-[3] flex justify-center [grid-area:1/1]">
                <span className="relative inline-block -rotate-1 whitespace-nowrap" style={{ marginBlock: "-0.22em" }}>
                  <span className="invisible block px-[0.6em] py-[0.22em]">duct-taped across tools</span>
                  {/* the tape body is clipped from the left as it peels */}
                  <span
                    className="absolute inset-0"
                    style={{ clipPath: `inset(-20px -20px -20px ${peel * 100}%)` }}
                  >
                    <span className="int-tape-face absolute inset-0 flex items-center justify-center [clip-path:polygon(0.8%_8%,99.4%_0,100%_93%,0_100%)]">
                      <span className="pb-[0.07em] text-[#2b2622] opacity-90 mix-blend-multiply">duct-taped across tools</span>
                    </span>
                  </span>
                  {/* curling roll travelling along the peel edge */}
                  <span
                    className="int-tape-roll pointer-events-none absolute -top-[12%] h-[124%] rounded-full"
                    style={{
                      left: `calc(${peel * 100}% - ${10 + peel * 8}px)`,
                      width: `${12 + peel * 10}px`,
                      opacity: peel > 0.01 && peel < 0.99 ? 1 : 0,
                    }}
                  />
                  <span
                    className="pointer-events-none absolute inset-y-0 w-10 bg-gradient-to-r from-transparent to-[rgba(26,23,20,0.1)]"
                    style={{ left: `calc(${peel * 100}% - 40px)`, opacity: peel > 0.01 && peel < 0.99 ? 1 : 0 }}
                  />
                </span>
              </span>
            </span>
          </h2>

          <p
            className="mt-4 text-center text-sm text-ink/60 transition-all duration-700 md:text-base"
            style={{ opacity: done ? 1 : 0, transform: done ? "none" : "translateY(12px)", transitionTimingFunction: "var(--ease-out-expo)" }}
          >
            No more switching between tools. One login. Your one-stop shop.
          </p>

          <div className="relative mt-12 h-[220px] w-full max-w-2xl">
            <div className="pointer-events-none absolute inset-x-[-10%] top-1/2 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            <div className="absolute inset-0 grid grid-cols-6 gap-2">
              {tools.map((t, i) => {
                const col = i % COLS;
                const row = Math.floor(i / COLS);
                // each tile starts a touch later than the previous → ripple into the centre
                const local = easeInOut(clamp(merge * 1.25 - (Math.abs(col - 2.5) / 2.5) * 0.25));
                const dx = (2.5 - col) * 108 * local;
                const dy = (0.5 - row) * 108 * local;
                return (
                  <div
                    key={t.n}
                    className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_6px_20px_-10px_rgba(0,0,0,0.2)] will-change-transform"
                    style={{
                      transform: `translate(${dx}%, ${dy}%) scale(${1 - local * 0.55}) rotate(${(col - 2.5) * 4 * local}deg)`,
                      opacity: 1 - clamp((local - 0.6) / 0.4),
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.src} alt={t.n} className="h-full w-full object-contain" draggable={false} />
                  </div>
                );
              })}
            </div>

            <div data-on={done ? "" : undefined} className="int-glow pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] rounded-full" />
            <div
              className="absolute left-1/2 top-1/2 grid h-28 w-28 place-items-center rounded-[28px] bg-white"
              style={{
                opacity: clamp((merge - 0.5) / 0.3),
                transform: `translate(-50%,-50%) scale(${0.5 + merge * 0.5})`,
                boxShadow: `0 0 ${20 + merge * 50}px ${merge * 12}px rgba(255,106,0,${0.15 + merge * 0.25})`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/tagmango/integrations/mango-ai-glyph.svg" alt="" className="h-16 w-16" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
