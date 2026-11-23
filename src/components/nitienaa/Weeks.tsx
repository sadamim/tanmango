"use client";
import { useState } from "react";

/** Week-by-week accordion for THE HUMAN OS™ (dark card style). */
export default function Weeks({ weeks = 6 }: { weeks?: number }) {
  const [open, setOpen] = useState(1);
  return (
    <div className="space-y-3">
      {Array.from({ length: weeks }, (_, i) => i + 1).map((n) => {
        const isOpen = open === n;
        return (
          <div key={n} className={`rounded-2xl border transition-colors ${isOpen ? "border-orange-300/60 bg-white/[0.06]" : "border-white/10 bg-white/[0.03]"}`}>
            <button onClick={() => setOpen(isOpen ? 0 : n)} aria-expanded={isOpen} className="flex w-full items-center gap-4 p-5 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-300">Week {n}</span>
              <span className="flex-1 font-display text-[17px] font-semibold text-white md:text-lg">[Week {n} theme]</span>
              <span className="text-xl leading-none text-white/50">{isOpen ? "−" : "+"}</span>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <div className="grid gap-4 px-5 pb-5 text-sm text-white/70 sm:grid-cols-3">
                  <p><b className="block text-white">Live class</b>[Live class topic]</p>
                  <p><b className="block text-white">Lessons</b>[Lesson titles]</p>
                  <p><b className="block text-white">Assignment</b>[Assignment brief]</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
