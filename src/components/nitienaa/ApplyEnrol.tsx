import Reveal from "../Reveal";
import type { programme as Prog } from "@/lib/coach/content";
import ApplyForm from "./ApplyForm";
import Checkout from "./Checkout";
import { SubHead, card } from "./kit";

const after = [
  ["Portal account created", "Automatically, with the email you paid with."],
  ["Welcome email and WhatsApp", "Your receipt, login details and the kick-off date."],
  ["Log in with your email", "A one-time code each time, so there is no password to remember."],
  ["Learn and complete", "Live classes, lessons and assignments, tracked to your certificate."],
];

/** Header topic "Apply and enrol": Apply + Enrol and pay + Confirmation. */
export default function ApplyEnrol({ programme, mangoId }: { programme: typeof Prog; mangoId: string | null }) {
  return (
    <section id="apply-and-enrol" className="relative scroll-mt-24 bg-white px-4 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1280px]">

        {/* Apply */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <SubHead id="apply" eyebrow="Apply" title={`Apply for ${programme.name}`} sub="It takes about 5 minutes. You will hear back by email, usually within [X] working days.">
            <ol className="mt-6 space-y-3 text-[15px] text-ink/70">
              {["We email you to confirm your application arrived.", "Nitienaa's team reviews it and may follow up.", "If it is a fit, you enrol and pay below."].map((t, i) => (
                <li key={i} className="flex gap-3"><span className="bg-mango grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white">{i + 1}</span>{t}</li>
              ))}
            </ol>
          </SubHead>
          <Reveal delay={0.1}><div className={`${card} border border-black/10`}><ApplyForm cohort={programme.cohort} startDate={programme.startDate} /></div></Reveal>
        </div>

        {/* Enrol and pay */}
        <div className="mt-20 grid gap-8 rounded-[32px] bg-[#f6f2ef] p-4 md:p-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SubHead id="enrol" eyebrow="Enrol and pay" title="Pay securely and get instant access" sub="Pay with Razorpay: UPI, cards, net banking and wallets. A receipt is emailed to you automatically." />
            {!mangoId && <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-ink/60">Enrolment isn&apos;t connected yet. In the dashboard, open Growth › Settings and choose the programme mango; its price appears here.</p>}
            <div className={`${card} mt-6`}><Checkout price={programme.price} programmeName={programme.name} cohort={programme.cohort} /></div>
          </div>
          <aside className={`${card} h-fit border-2 border-ink`} aria-label="Order summary">
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-xl font-bold text-ink">{programme.name}</p>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">{programme.seats} seats left</span>
            </div>
            <p className="mt-4 font-display text-[40px] font-bold leading-none text-ink">{programme.price}</p>
            <p className="mt-2 text-sm text-ink/50">{programme.priceNotes}</p>
            <dl className="mt-6 divide-y divide-black/5 text-[15px]">
              <div className="flex justify-between py-2.5"><dt className="text-ink/60">Programme fee</dt><dd>{programme.price}</dd></div>
              <div className="flex justify-between py-2.5"><dt className="text-ink/60">GST</dt><dd>{programme.gst}</dd></div>
              <div className="flex justify-between py-2.5 font-semibold"><dt>Total</dt><dd>{programme.total}</dd></div>
            </dl>
            <a href="/refund-policy" className="mt-4 inline-block text-sm text-ink/60 underline">Read the refund policy</a>
          </aside>
        </div>

        {/* Confirmation */}
        <div className="mt-20">
          <SubHead id="confirmation" eyebrow="Confirmation" title="What happens after you pay" sub="You land on a confirmation page with your receipt, and the same receipt is emailed to you. Then:" />
          <ol className="mt-8 grid gap-3 md:grid-cols-4">
            {after.map(([t, d], i) => (
              <li key={t}>
                <Reveal delay={i * 0.08} className="h-full">
                  <div className="h-full rounded-[24px] bg-[#f6f2ef] p-5">
                    <span className="text-mango font-display text-[28px] font-bold">0{i + 1}</span>
                    <p className="mt-2 font-display text-lg font-semibold text-ink">{t}</p>
                    <p className="mt-1 text-sm text-ink/60">{d}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
          <div className="mt-6 text-center"><a href="/portal" className="font-semibold text-ink underline">Already enrolled? Go to the learning portal</a></div>
        </div>
      </div>
    </section>
  );
}
