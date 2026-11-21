"use client";
import Link from "next/link";
import { useState } from "react";
import { patchMe, toast, useMe } from "@/lib/client";
import { Btn, Modal } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";
import { PLAN_ORDER, type Plan } from "@/components/dash/nav";

const PLANS: { id: Plan; name: string; price: string; fee: string; sub: string; lead?: string; items: string[]; tint: string; tag?: string }[] = [
  { id: "basic", name: "Basic", price: "Zero", fee: "10% commissions", sub: "(including Indian Payment Gateway)", tint: "from-[#eaf7ee]", items: ["200 students", "Landing pages (3 templates)", "Course Storage 20 GB media upload", "Team Management", "Advanced Analytics", "Chat Rooms", "WhatsApp Integration (Automations & Broadcast)**", "Email Broadcasting (10 email credits/user) & Automations", "Storefront", "Certificates & Security", "Access to TagMango Community", "Zapier & Pabbly Integration", "Path"] },
  { id: "pro", name: "Pro", price: "₹5,000", fee: "+5.5% commissions", sub: "(including Indian Payment Gateway)", lead: "Basic", tint: "from-[#fff4e5]", items: ["Unlimited students", "Unlimited storage", "Refund Automation", "Free Products using 100% OFF coupons", "50k email/month for broadcast", "Exclusive Landing Page templates", "Build Custom Certificates", "Timer"] },
  { id: "advanced", name: "Advanced", price: "₹15,000", fee: "+3.5% commissions", sub: "(including Indian Payment Gateway)", lead: "Pro", tint: "from-[#eef3ff]", items: ["Community Channels & Forums", "Multi-Media Uploads", "Advanced Message Room & Threads", "Affiliate", "Gamification", "DRM Course Protection", "Zoom Webinar - 500 people", "Up-Sell on Check-Out", "User Addition"] },
  { id: "ultimate", name: "Ultimate", price: "₹35,000", fee: "Zero commissions", sub: "Lowest Indian Gateway charge 1.9%", lead: "Advanced", tint: "from-[#f6efff]", tag: "NEW LAUNCH", items: ["AI-Verse Stack Included", "Mango AI", "Theme AI", "AI Funnel Builder", "AI App Builder", "1000 AI Credits", "Customer Success Manager", "Habit and Task Tracker", "Challenges", "Link-Up & Achievements", "Check-Up & Certifications", "Sparks(200 GB)", "Connect", "Flexi-Pay", "Instant Withdrawal", "No Cost EMI", "Menu Customisation"] },
];

export default function Plans() {
  const { me, setMe } = useMe();
  const [confirm, setConfirm] = useState<Plan | "freedom" | null>(null);
  const [busy, setBusy] = useState(false);
  const cur = PLAN_ORDER.indexOf(me.plan);

  async function apply() {
    if (!confirm) return;
    setBusy(true);
    try {
      const r = await patchMe(confirm === "freedom" ? { whiteLabel: true } : { plan: confirm });
      setMe(r.user);
      toast(confirm === "freedom" ? "Freedom Setup activated (test mode)" : `You're now on ${PLANS.find((p) => p.id === confirm)!.name} (test mode)`);
      setConfirm(null);
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="animate-rise">
        <h1 className="text-[26px] font-semibold">Subscription Plans</h1>
        <p className="text-[14px] text-[#6b6b7b]">Pick your setup, power it with a plan. Simple</p>
      </div>
      <div className="animate-rise flex items-center justify-between rounded-md bg-[#2b1149] px-4 py-2.5 text-[13px] text-white" style={{ ["--delay" as string]: "0.04s" }}>
        <span>✨ Newly launched AI features unlock on any plan as an add-on</span>
        <Link href="/pricing" className="font-semibold">View ›</Link>
      </div>

      <div className="animate-rise grid items-center gap-4 rounded-[12px] border border-[#ededed] bg-gradient-to-r from-[#fff4e5] to-white p-6 md:grid-cols-[1fr_auto]" style={{ ["--delay" as string]: "0.08s" }}>
        <div>
          <p className="text-[22px]"><b>Freedom</b> Setup</p>
          <p className="text-[13px] text-[#6b6b7b]">To unlock your own branding (custom domain)</p>
          <p className="mt-3 text-[28px] font-bold">₹24,999 <span className="text-[13px] font-normal text-[#6b6b7b]">+ GST One-time</span></p>
        </div>
        {me.whiteLabel ? <span className="rounded-md bg-[#e9f9ee] px-4 py-2 text-[14px] font-medium text-[#00a400]">✓ Active</span> : <Btn variant="black" onClick={() => setConfirm("freedom")}>Get Freedom Setup</Btn>}
      </div>

      <p className="text-center text-[12px] font-semibold tracking-[0.2em] text-[#6b6b7b]">AVAILABLE PLANS</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p, i) => {
          const idx = PLAN_ORDER.indexOf(p.id);
          const isCur = idx === cur;
          return (
            <div key={p.id} className={`animate-plan-show relative flex flex-col rounded-[12px] border bg-white ${isCur ? "border-[#f2962c] shadow-[0_10px_30px_-12px_rgba(242,150,44,0.5)]" : "border-[#ededed]"}`} style={{ ["--delay" as string]: `${i * 0.06}s` }}>
              {p.tag && <span className="absolute -top-2.5 right-4 rounded bg-[#e5372e] px-2 py-0.5 text-[10px] font-bold text-white">{p.tag}</span>}
              <div className={`rounded-t-[12px] bg-gradient-to-b ${p.tint} to-white p-5`}>
                <p className="flex items-center gap-2 text-[17px] font-semibold"><Icon name="star" className="h-4 w-4 text-[#f2962c]" />{p.name}</p>
                <p className="mt-2 text-[28px] font-bold">{p.price}<span className="text-[13px] font-normal text-[#6b6b7b]">{p.id === "basic" ? "Fixed Fee" : "+GST /month"}</span></p>
                <p className="mt-2 text-[14px] font-semibold">{p.fee}</p>
                <p className="text-[11px] text-[#6b6b7b]">{p.sub}</p>
                {isCur ? (
                  <span className="mt-4 block rounded-md bg-[#fdefdf] py-2 text-center text-[14px] font-medium text-[#c7740f]">Current plan</span>
                ) : idx > cur ? (
                  <Btn className="mt-4 w-full" onClick={() => setConfirm(p.id)}>Upgrade</Btn>
                ) : (
                  <Btn variant="outline" className="mt-4 w-full" onClick={() => setConfirm(p.id)}>{p.id === "basic" ? "Switch to Basic" : "Downgrade"}</Btn>
                )}
              </div>
              <div className="flex-1 p-5 text-[13px]">
                {p.lead && <p className="mb-2 font-medium">Everything in <b>{p.lead}</b> +</p>}
                <ul className="space-y-2">{p.items.map((it) => <li key={it} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-[#00a400]" />{it}</li>)}</ul>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[12px] text-[#6b6b7b]">**You can connect any WhatsApp API Provider · *International Payment Gateway charge is exclusive, i.e. 5.5% · Note: All variable charges are exclusive of GST</p>

      <p className="text-center text-[12px] font-semibold tracking-[0.2em] text-[#6b6b7b]">ADD-ONS</p>
      <div className="grid gap-4 md:grid-cols-2">
        {[["AI-Verse Stack", "Add AI-Verse on top of the plan you choose", "₹49,999", "+ GST / year", ["Mango AI: Your AI co-founder for every next move.", "Theme AI: Make your platform uniquely yours, instantly.", "AI Funnel Builder: Turn ideas into live funnels in seconds.", "1000 AI credits"]], ["Branded Apps Stack", "Give your learners a seamless, on-brand app experience.", "₹75,000", "+ GST One-time", ["Unlock your own Play store and iOS store apps", "Zoom Meetings for 300 people (2 years)"]]].map(([t, d, pr, u, items]) => (
          <div key={t as string} className="rounded-[12px] border border-[#ededed] bg-white p-5">
            <p className="text-[18px] font-semibold">{t as string}</p>
            <p className="text-[13px] text-[#6b6b7b]">{d as string}</p>
            <p className="mt-3 text-[24px] font-bold">{pr as string} <span className="text-[12px] font-normal text-[#6b6b7b]">{u as string}</span></p>
            <ul className="mt-3 space-y-1.5 text-[13px]">{(items as string[]).map((x) => <li key={x} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-[#00a400]" />{x}</li>)}</ul>
            <Link href="/demo"><Btn variant="black" className="mt-4">Book a Call</Btn></Link>
          </div>
        ))}
      </div>

      {confirm && (
        <Modal title={confirm === "freedom" ? "Get Freedom Setup" : `Switch to ${PLANS.find((p) => p.id === confirm)!.name}`} onClose={() => setConfirm(null)}>
          <p className="text-[14px] text-[#4a4a59]">Test mode: no payment is taken. {confirm === "freedom" ? "This unlocks custom domain linking in Platform Settings." : "Your plan changes immediately, features unlock or lock to match, and a test invoice appears under Billings."}</p>
          <div className="mt-5 flex justify-end gap-2"><Btn variant="outline" onClick={() => setConfirm(null)}>Cancel</Btn><Btn onClick={apply} disabled={busy}>{busy ? "Please wait…" : "Confirm"}</Btn></div>
        </Modal>
      )}
    </div>
  );
}
