"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { MeteredFrame?: new () => { init: (o: Record<string, unknown>, el: HTMLElement) => void } }
}

/** Metered video room, embedded in the page. The visitor enters their name and allows camera and microphone. */
export default function VideoRoom({ roomURL }: { roomURL: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!roomURL) return;
    const start = () => {
      if (!window.MeteredFrame || !box.current) return setErr("The video tool didn't load. Check your connection and reload.");
      new window.MeteredFrame().init({ roomURL, width: "100%", height: `${Math.max(520, window.innerHeight - 48)}px` }, box.current);
    };
    if (window.MeteredFrame) return start();
    const s = document.createElement("script");
    s.src = "https://cdn.metered.ca/sdk/frame/1.4.3/sdk-frame.min.js";
    s.onload = start;
    s.onerror = () => setErr("The video tool couldn't be loaded.");
    document.body.appendChild(s);
  }, [roomURL]);

  if (!roomURL) return <div className="grid min-h-screen place-items-center bg-[#fafaf8] p-6 text-center"><p className="max-w-sm text-[#555]">Video calls aren&apos;t set up on this site yet.</p></div>;
  return (
    <div className="flex min-h-screen flex-col bg-[#111] text-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <p className="px-4 py-2 text-center text-[13px] text-[#aaa]">Allow your camera and microphone when your browser asks. Use Chrome or Safari.</p>
      {err && <p className="px-4 py-3 text-center text-[#f99]">{err}</p>}
      <div ref={box} className="flex-1" />
    </div>
  );
}
