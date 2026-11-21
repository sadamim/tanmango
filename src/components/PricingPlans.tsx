"use client";
import { useState } from "react";
import Link from "next/link";
import { Arrow } from "./ui";

const plans = [
  {
    name: "Basic",
    price: "Zero",
    unit: "Fixed Fee",
    fee: "10% commissions",
    lead: "",
    items: ["200 students", "Landing pages (3 templates)", "Course storage 20 GB media upload", "Team management", "Advanced analytics", "Chat rooms", "WhatsApp integration (automations & broadcast)", "Email broadcasting & automations", "Storefront", "Certificates & security", "Zapier & Pabbly integration"],
  },
  {
    name: "Pro",
    price: "₹5,000",
    unit: "+GST /month",
    fee: "+ 5.5% commissions",
    lead: "Everything in Basic +",
    items: ["Unlimited students", "Unlimited storage", "Refund automation", "Free products using 100% OFF coupons", "50K email/month for broadcast", "Exclusive landing page templates", "Build custom certificates", "Timer"],
  },
  {
    name: "Advanced",
    price: "₹15,000",
    unit: "+GST /month",
    fee: "+ 3.5% commissions",
    lead: "Everything in Pro +",
    popular: true,
    items: ["Community features (channels, threads, multimedia)", "Affiliate", "Gamification", "Forums", "DRM for course videos", "Webinars – 500 people", "Up-sell on check-out", "User addition"],
  },
  {
    name: "Ultimate",
    price: "₹35,000",
    unit: "+GST /month",
    fee: "Zero commissions",
    lead: "Everything in Advanced +",
    items: ["AI stack included", "Mango AI", "Theme AI", "AI funnel builder", "AI software builder", "1000 AI credits", "Dedicated success manager", "Habit and task tracker", "Challenges", "Achievements & certifications", "Flexi-pay & no-cost EMI", "Menu customisation"],
  },
];

const addons = [
  { name: "AI Stack", desc: "Add AI on top of the plan you choose.", items: ["Mango AI: your AI co-founder for every next move", "Theme AI: make your platform uniquely yours", "AI Funnel Builder: ideas to live funnels in seconds", "1000 AI credits"], price: "₹49,999", unit: "+ GST / year" },
  { name: "Branded Apps Stack", desc: "Give your learners a seamless, on-brand app experience.", items: ["Your own Play Store and App Store apps", "Meetings for 300 people (2 years)"], price: "₹74,999", unit: "One-time + GST" },
];

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 10.5 3 3 7-7" />
    </svg>
  );
}

export default function PricingPlans() {
  const [sel, setSel] = useState(2);

  return (
    <section className="bg-[#faf6f1] px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-6 rounded-[28px] border border-black/5 bg-white p-6 md:flex-row md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">Freedom Setup</p>
            <p className="mt-1 text-ink/60">To unlock your own branding (custom domain)</p>
          </div>
          <p className="font-display text-3xl font-bold">
            ₹24,999 <span className="text-sm font-medium text-ink/50">+ GST / year</span>
          </p>
        </div>

        <p className="mt-14 text-center text-xs font-semibold uppercase tracking-wider text-ink/40">Available plans</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => (
            <div
              key={p.name}
              onClick={() => setSel(i)}
              style={{ ["--delay" as string]: `${i * 0.08}s` }}
              className={`animate-plan-show relative flex cursor-pointer flex-col rounded-[24px] border-2 bg-white p-6 text-left transition ${sel === i ? "border-orange-400 shadow-[0_20px_50px_-20px_rgba(255,106,0,0.45)]" : "border-transparent hover:border-orange-200"}`}
            >
              {p.popular && <span className="bg-mango absolute -top-3 left-6 rounded-full px-3 py-0.5 text-xs font-semibold text-white">Most popular</span>}
              <p className="font-display text-xl font-semibold">{p.name}</p>
              <p className="mt-4 font-display text-4xl font-bold">{p.price}</p>
              <p className="text-sm text-ink/50">{p.unit}</p>
              <p className="mt-2 font-semibold text-orange-600">{p.fee}</p>
              <p className="text-xs text-ink/40">(including Indian payment gateway)*</p>
              <Link
                href="/demo"
                className={`mt-5 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold ${sel === i ? "bg-mango text-white" : "bg-ink text-white"}`}
              >
                Book a Call <Arrow />
              </Link>
              {p.lead && <p className="mt-6 text-sm font-semibold">{p.lead}</p>}
              <ul className={`space-y-2 text-sm text-ink/70 ${p.lead ? "mt-3" : "mt-6"}`}>
                {p.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <Check />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-ink/50">*International payment gateway charges are exclusive. All variable charges are exclusive of GST.</p>

        <p className="mt-20 text-center text-xs font-semibold uppercase tracking-wider text-ink/40">Add-ons</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {addons.map((a) => (
            <div key={a.name} className="flex flex-col rounded-[24px] border border-black/5 bg-white p-6 md:p-8">
              <p className="font-display text-2xl font-semibold">{a.name}</p>
              <p className="mt-1 text-ink/60">{a.desc}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-ink/70">
                {a.items.map((it) => (
                  <li key={it} className="flex gap-2"><Check />{it}</li>
                ))}
              </ul>
              <div className="mt-6 flex items-end justify-between">
                <p className="font-display text-3xl font-bold">{a.price} <span className="text-sm font-medium text-ink/50">{a.unit}</span></p>
                <Link href="/demo" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">Book a Call</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
