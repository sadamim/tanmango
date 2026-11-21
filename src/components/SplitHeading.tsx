"use client";
import { createElement, Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";

export type Segment = { text: string; gradient?: boolean; className?: string; br?: boolean };

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Heading that reveals letter by letter (char-rise, 24ms stagger), the way the
 * original site does it. `auto` plays on mount; otherwise it plays when scrolled into view.
 * Gradient segments keep one continuous gradient across their letters.
 */
export default function SplitHeading({
  segments,
  as = "h2",
  className = "",
  delay = 0,
  auto = false,
  id,
}: {
  segments: Segment[];
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
  auto?: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"pending" | "play" | "auto">(auto ? "auto" : "pending");

  useEffect(() => {
    if (auto) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("play");
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [auto]);

  // Give every letter of a gradient segment the segment's size + its own offset,
  // so the gradient flows across the word instead of restarting per letter.
  useIso(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      el.querySelectorAll<HTMLElement>("[data-grad]").forEach((seg) => {
        const box = seg.getBoundingClientRect();
        seg.style.setProperty("--gw", `${box.width}px`);
        seg.style.setProperty("--gh", `${box.height}px`);
        seg.querySelectorAll<HTMLElement>(".heading-char").forEach((c) => {
          c.style.setProperty("--gx", `${c.offsetLeft}px`);
          c.style.setProperty("--gy", `${c.offsetTop}px`);
        });
      });
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  let i = 0;
  const label = segments.map((s) => s.text).join(" ");

  const content = segments.map((seg, s) => (
    <Fragment key={s}>
      <span
        data-grad={seg.gradient ? "" : undefined}
        className={`relative inline-block whitespace-nowrap ${seg.gradient ? "text-gradient-amber" : ""} ${seg.className ?? ""}`}
        aria-hidden
      >
        {seg.text.split(" ").map((word, w, arr) => (
          <Fragment key={w}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((ch) => {
                const idx = i++;
                return (
                  <span key={idx} className="heading-char" style={{ ["--i" as string]: idx }}>
                    {ch}
                  </span>
                );
              })}
            </span>
            {w < arr.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
      {seg.br ? <span className="basis-full" /> : s < segments.length - 1 ? " " : null}
    </Fragment>
  ));

  return createElement(
    as,
    {
      ref,
      id,
      "data-chars": state,
      style: { ["--d" as string]: `${delay}s` },
      className: `flex flex-wrap justify-center gap-x-[0.25em] ${className}`,
    },
    <span className="sr-only">{label}</span>,
    ...content
  );
}
