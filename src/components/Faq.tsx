"use client";
import { useState } from "react";
import SplitHeading from "./SplitHeading";
import Reveal from "./Reveal";

const faqs: Record<string, [string, string][]> = {
  "Getting started": [
    ["I'm one person and not tech-savvy. Can I really do this alone?", "Yes, and you won't need anyone else to start. It's built to be simple on purpose. If you can write a WhatsApp message, you can set this up. Pick what you want to sell, follow the steps, and you're running."],
    ["I'm already on another platform. How painful is moving?", "Not very. Our team helps migrate your courses, members and content, so your learners keep their progress and you don't lose a week to copy-pasting."],
    ["How quickly can I be live?", "Most creators publish their first offer the same day. A full community, course and payments setup usually takes a few days."],
    ["Do I really get my own app on the Play Store and App Store?", "Yes. Your app ships under your brand and icon. We handle the store submissions, reviews and every update after."],
  ],
  Features: [
    ["What can I sell?", "Courses, communities, live workshops, 1:1 coaching, memberships, digital downloads and custom tools — individually or bundled."],
    ["Does it have built-in live sessions?", "Yes. Go live with the integrated video experience and recordings land in your course automatically."],
    ["Can I build landing pages?", "Describe your offer and the AI page builder drafts a ready-to-publish landing page you can edit."],
  ],
  "Plans & Billing": [
    ["Is there a free trial?", "You can sign up and explore the platform before committing to a plan."],
    ["Which payment methods can my buyers use?", "UPI, cards, net banking, EMI and international payments, with the right gateway picked automatically."],
    ["Can I change plans later?", "Anytime. Upgrade or downgrade from your dashboard; billing is prorated."],
  ],
  "Privacy & Control": [
    ["Who owns my audience data?", "You do. Export your members, sales and content whenever you like."],
    ["Is my data secure?", "Data is encrypted in transit and at rest, and the platform follows GDPR-aligned practices."],
  ],
};

export default function Faq() {
  const cats = Object.keys(faqs);
  const [cat, setCat] = useState(cats[0]);
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="relative bg-white px-4 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.6fr]">
        <div>
          <SplitHeading
            className="!justify-start font-display text-[32px] font-bold leading-[1.15] tracking-tight text-ink max-md:!justify-center md:text-[44px]"
            segments={[{ text: "Got questions", br: true }, { text: "about" }, { text: "TagMango", gradient: true }]}
          />
          <p className="mt-4 text-ink/60">Find answers to commonly asked questions.</p>
          <div className="mt-8 flex gap-2 overflow-x-auto md:flex-col">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCat(c);
                  setOpen(0);
                }}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-left text-[15px] font-medium transition ${c === cat ? "bg-[#f4f1ec] text-ink" : "text-ink/60 hover:text-ink"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <Reveal delay={0.2} className="space-y-3">
          {faqs[cat].map(([q, a], k) => {
            const isOpen = open === k;
            return (
              <div key={cat + q} style={{ ["--delay" as string]: `${k * 0.05}s` }} className={`animate-soft-fade rounded-2xl border bg-white transition-colors ${isOpen ? "border-orange-300" : "border-black/10"}`}>
                <button onClick={() => setOpen(isOpen ? -1 : k)} className="flex w-full items-start justify-between gap-4 p-5 text-left font-semibold text-ink">
                  {q}
                  <span className={`text-xl leading-none text-ink/50 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>{isOpen ? "−" : "+"}</span>
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <p className="overflow-hidden px-5 text-[15px] leading-relaxed text-ink/60">
                    <span className="block pb-5">{a}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
