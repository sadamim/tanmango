"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Demo() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-ink px-4 pb-24 pt-36 text-white">
          <div className="pointer-events-none absolute -bottom-40 left-1/2 h-72 w-[900px] -translate-x-1/2 rounded-[50%] bg-[#ff6a00]/30 blur-[90px]" />
          <div className="relative mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h1 className="font-display text-[36px] font-bold leading-[1.1] tracking-tight md:text-[52px]">
                Book a <span className="text-mango">Demo Call</span>
              </h1>
              <p className="mt-4 text-white/70">Thirty minutes. Walk out with a plan for your first launch, or your next one.</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-8">
              {sent ? (
                <p className="text-green-200">Thanks! (Demo only — wire this form to your CRM or calendar.)</p>
              ) : (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                  {["Full name", "Email", "Phone", "What do you teach?"].map((l) => (
                    <label key={l} className="block text-sm">
                      <span className="text-white/70">{l}</span>
                      <input required className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-400" />
                    </label>
                  ))}
                  <button className="bg-mango w-full rounded-full py-3.5 font-semibold text-white">Request a call</button>
                </form>
              )}
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
