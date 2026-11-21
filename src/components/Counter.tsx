"use client";
import { useEffect, useRef, useState } from "react";

/** Odometer-style rolling number: each digit column scrolls into place. */
export default function Counter({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setGo(true), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={`inline-flex items-end ${className}`} aria-label={value}>
      {value.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} className="digit-col" aria-hidden>
            <span style={{ transform: `translateY(-${go ? (Number(ch) + 10) : 0}em)`, transitionDelay: `${600 + i * 60}ms` }}>
              {Array.from({ length: 20 }, (_, n) => (
                <span key={n} className="block h-[1em]">{n % 10}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden className="whitespace-pre leading-none">{ch}</span>
        )
      )}
    </span>
  );
}
