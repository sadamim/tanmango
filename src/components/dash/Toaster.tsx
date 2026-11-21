"use client";
import { useEffect, useState } from "react";
import { Icon } from "./icons";

type T = { id: number; msg: string; kind: "ok" | "err" };

export default function Toaster() {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    const on = (e: Event) => {
      const { msg, kind } = (e as CustomEvent).detail;
      const id = Date.now() + Math.random();
      setItems((x) => [...x, { id, msg, kind }]);
      setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3200);
    };
    window.addEventListener("tm:toast", on);
    return () => window.removeEventListener("tm:toast", on);
  }, []);
  return (
    <div className="pointer-events-none fixed left-1/2 top-5 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
      {items.map((t) => (
        <div key={t.id} className="animate-soft-fade flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-[14px] shadow-lg ring-1 ring-black/5">
          <span className={`grid h-5 w-5 place-items-center rounded-full text-white ${t.kind === "ok" ? "bg-green-600" : "bg-red-500"}`}>
            <Icon name={t.kind === "ok" ? "check" : "close"} className="h-3.5 w-3.5" />
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
