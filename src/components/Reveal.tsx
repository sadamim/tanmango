"use client";
import { useEffect, useRef, useState } from "react";

/** Rises in (24px, 0.9s expo-out) once scrolled into view, with an optional stagger delay. */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"pending" | "play">("pending");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("play");
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} data-inview={state} style={{ ["--delay" as string]: `${delay}s` }} className={className}>
      {children}
    </div>
  );
}
