"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./ui";

export default function Navbar({ light = false }: { light?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dark = light && !scrolled;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
      <nav
        className={`flex w-full max-w-[560px] items-center justify-between rounded-full border py-1.5 pl-5 pr-1.5 backdrop-blur-xl transition-colors ${
          dark ? "border-black/5 bg-white/70" : scrolled ? "border-white/10 bg-[#161616]/85" : "border-white/10 bg-white/[0.06]"
        }`}
      >
        <Logo dark={dark} className="!text-[22px]" />
        <div className="hidden items-center gap-1 sm:flex">
          <Link href="/pricing" className={`rounded-full px-4 py-2 text-sm font-medium ${dark ? "text-ink/80 hover:text-ink" : "text-white/80 hover:text-white"}`}>
            Pricing
          </Link>
          <Link href="/web/login" className={`rounded-full px-4 py-2 text-sm font-medium ${dark ? "text-ink/80 hover:text-ink" : "text-white/80 hover:text-white"}`}>
            Login
          </Link>
          <Link
            href="/web/sign-up"
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              dark ? "border-black/10 bg-ink text-white" : "border-white/15 bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Sign-Up
          </Link>
        </div>
        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className={`grid h-10 w-10 place-items-center rounded-full sm:hidden ${dark ? "text-ink" : "text-white"}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>
      {open && (
        <div className="absolute inset-x-4 top-[68px] rounded-3xl border border-white/10 bg-[#161616]/95 p-3 backdrop-blur-xl sm:hidden">
          {[
            ["Pricing", "/pricing"],
            ["Login", "/web/login"],
            ["Sign-Up", "/web/sign-up"],
          ].map(([l, h]) => (
            <Link key={h} href={h} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-white/90 hover:bg-white/5">
              {l}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
