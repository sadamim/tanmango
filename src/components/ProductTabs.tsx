"use client";
import { useEffect, useRef, useState } from "react";
import { Arrow, DarkButton } from "./ui";
import SplitHeading from "./SplitHeading";
import Lottie from "./Lottie";

const L = "/tagmango/lottie/tabs";

const tabs = [
  {
    key: "Community",
    icon: "M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4Zm8 0c-.3 0-.7 0-1.1.1A4.2 4.2 0 0 1 17 17v2h7v-2c0-2.7-5.3-4-8-4Z",
    title: "Turn your audience into a room they don’t leave.",
    body: "They come for you. They stay for the people, the points, and a streak nobody wants to lose.",
    lottie: `${L}/tagmango-community-v7-8s-loop.json`,
  },
  {
    key: "Course",
    icon: "M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4Zm16 0h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6Z",
    title: "Turn what you know into a course people finish.",
    body: "Drip it week by week, add a quiz at the end, and watch completion stop being your problem.",
    lottie: `${L}/tagmango-course-v2-5s-loop.json`,
  },
  {
    key: "Coaching",
    icon: "M3 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm14 3 4-3v10l-4-3Z",
    title: "From funnel to live session, without leaving the platform.",
    body: "Set the price, activate the funnel, go live. The recording lands in your course on its own.",
    lottie: `${L}/tagmango-coaching-live-5s-loop-backdrop-v2.json`,
  },
  {
    key: "Custom Software",
    icon: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Zm0 4h16",
    title: "Build your own app, without a developer.",
    body: "Describe the tool your learners need. It gets built, lives inside your platform, and you decide what to charge for it.",
    lottie: `${L}/tagmango-custom-software-5s-loop.json`,
  },
];

export default function ProductTabs() {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(Math.max(-r.top / total, 0), 0.999);
      setActive(Math.floor(p * tabs.length));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jump = (i: number) => {
    const el = wrap.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + (total * (i + 0.5)) / tabs.length;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section className="relative bg-white">
      <div className="mx-auto max-w-4xl px-4 pb-10 pt-24 text-center md:pt-32">
        <SplitHeading
          className="font-display text-[32px] font-bold leading-[1.15] tracking-tight text-ink md:text-[52px]"
          segments={[{ text: "It takes one person to run a", br: true }, { text: "digital business now", gradient: true }]}
        />
      </div>

      <div ref={wrap} className="relative" style={{ height: `${tabs.length * 90 + 20}vh` }}>
        <div className="sticky top-0 flex h-screen items-center px-2 sm:px-4">
          <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] bg-[linear-gradient(90deg,#fde3b0_0%,#f4a259_50%,#fde3b0_100%)] p-3 sm:p-8 md:p-10">
            {/* tab pills */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {tabs.map((t, i) => (
                <button
                  key={t.key}
                  onClick={() => jump(i)}
                  className={`flex items-center justify-center gap-2 rounded-full border-2 px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${
                    i === active ? "border-white bg-orange-100 text-ink shadow" : "border-white/70 bg-white/60 text-ink/70 hover:bg-white/80"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden>
                    <path d={t.icon} />
                  </svg>
                  <span className="hidden sm:inline">{t.key}</span>
                </button>
              ))}
            </div>

            {/* panel */}
            <div className="relative mt-4 min-h-[520px] rounded-[24px] bg-white sm:mt-6 md:min-h-[400px]">
              {tabs.map((t, i) => (
                <div
                  key={t.key}
                  className={`absolute inset-0 grid gap-6 p-5 transition-opacity duration-300 sm:p-8 md:grid-cols-[0.8fr_1.6fr] md:items-center ${
                    i === active ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  {i === active ? (
                      <div>
                        <h3 className="animate-soft-fade font-display text-2xl font-bold leading-tight tracking-tight text-ink md:text-[34px]">{t.title}</h3>
                        <p className="animate-soft-fade mt-3 text-[15px] leading-relaxed text-ink/60" style={{ ["--delay" as string]: "0.06s" }}>{t.body}</p>
                        <div className="animate-soft-fade" style={{ ["--delay" as string]: "0.12s" }}>
                          <DarkButton className="mt-6">
                            Book a Demo Call <Arrow />
                          </DarkButton>
                        </div>
                      </div>
                  ) : <div />}
                  <div className={`hidden overflow-hidden rounded-[20px] bg-[#f6f2ef] transition-all duration-500 [transition-timing-function:var(--ease-out-expo)] sm:block ${i === active ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"}`}>
                    <Lottie src={t.lottie} playing={i === active} className="aspect-[698/386] w-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-1.5">
              {tabs.map((t, i) => (
                <span key={t.key} className={`h-1.5 rounded-full transition-all ${i === active ? "w-8 bg-white" : "w-1.5 bg-white/60"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
