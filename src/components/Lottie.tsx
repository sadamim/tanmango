"use client";
import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

/** Lazy Lottie player: loads lottie-web on demand, loops, and only plays while `playing` is true. */
export default function Lottie({ src, playing = true, className = "" }: { src: string; playing?: boolean; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const anim = useRef<AnimationItem | null>(null);
  const want = useRef(playing);
  want.current = playing;

  useEffect(() => {
    let dead = false;
    (async () => {
      const lottie = (await import("lottie-web")).default;
      if (dead || !box.current) return;
      anim.current = lottie.loadAnimation({
        container: box.current,
        renderer: "svg",
        loop: true,
        autoplay: false,
        path: src,
        rendererSettings: { preserveAspectRatio: "xMidYMid meet", progressiveLoad: true },
      });
      anim.current.addEventListener("DOMLoaded", () => {
        if (want.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) anim.current?.play();
      });
    })();
    return () => {
      dead = true;
      anim.current?.destroy();
      anim.current = null;
    };
  }, [src]);

  useEffect(() => {
    if (!anim.current) return;
    if (playing) anim.current.goToAndPlay(0, true);
    else anim.current.pause();
  }, [playing]);

  return <div ref={box} className={className} aria-hidden />;
}
