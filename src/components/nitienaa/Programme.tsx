import Link from "next/link";
import Reveal from "../Reveal";
import { Arrow } from "../ui";
import type { programme as Prog } from "@/lib/coach/content";
import Weeks from "./Weeks";
import { SubHead, mangoBtn } from "./kit";

const included = [
  ["6 live classes", "Join link, reminders by email and WhatsApp, and recordings."],
  ["Learning portal", "Week-by-week programme with a progress bar."],
  ["Assignments and feedback", "Submit as text or a file link and get personal feedback."],
  ["Resource library", "Worksheets and downloads for every week."],
  ["Cohort announcements", "Updates from Nitienaa, straight to your portal."],
  ["Certificate", "Awarded when you complete the programme."],
];
const rhythm = [
  ["1", "Lesson", "Short lessons open in the portal at the start of each week."],
  ["2", "Live class", "Work through it together with Nitienaa and the cohort."],
  ["3", "Assignment", "Apply it to your own life and submit text or a file."],
  ["4", "Feedback", "Get notified when feedback is ready in your portal."],
];
const events = [
  { type: "Open session", where: "Online · Zoom", price: "Free" },
  { type: "Workshop", where: "[City, venue]", price: "[PRICE]" },
  { type: "Talk", where: "[Conference name]", price: "[PRICE]" },
];

/** Header topic "Programme": THE HUMAN OS™ + The method + Events and workshops. */
export default function Programme({ programme }: { programme: typeof Prog }) {
  const facts = [["Starts", programme.startDate], ["Length", `${programme.weeks} weeks`], ["Format", "Live online + portal"], ["Cohort size", `Up to ${programme.capacity} learners`], ["Investment", programme.price]];
  return (
    <section id="programme" className="relative scroll-mt-24 bg-white px-2 py-2">
      <div className="rounded-[32px] bg-ink px-4 py-20 text-white md:px-10 md:py-28">
        <div className="mx-auto max-w-[1280px]">

          {/* THE HUMAN OS™ */}
          <div id="the-human-os" className="grid scroll-mt-28 gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <SubHead id="weeks" dark eyebrow="Week by week" title="The six weeks" sub="Each week has one live class, lessons in the portal and one assignment." />
              <div className="mt-6"><Weeks weeks={programme.weeks} /></div>
            </div>
            <Reveal delay={0.15}>
              <div className="rounded-[24px] bg-white p-6 text-ink md:p-8 lg:sticky lg:top-28">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Next cohort</p>
                <dl className="mt-4 divide-y divide-black/5">
                  {facts.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4 py-3 text-[15px]">
                      <dt className="text-ink/60">{k}</dt>
                      <dd className={`font-semibold ${k === "Investment" ? "font-display text-xl" : ""}`}>{v}</dd>
                    </div>
                  ))}
                </dl>
                <Link href="/apply#enrol" className={`${mangoBtn} mt-6 w-full`}>Enrol and pay <Arrow /></Link>
                <Link href="/apply#apply" className="mt-3 block text-center text-sm font-medium text-ink/60 hover:text-ink">Not sure yet? Apply first</Link>
              </div>
            </Reveal>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {included.map(([t, d]) => (
              <li key={t} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="font-display font-semibold text-white">{t}</p>
                <p className="mt-1 text-sm text-white/60">{d}</p>
              </li>
            ))}
          </ul>

          {/* The method */}
          <div className="mt-24">
            <SubHead id="method" dark eyebrow="The method" title="[Name or one-line summary of the method]" sub="[How the method works, in two sentences — from your content.] Every week follows the same rhythm:" />
            <ol className="mt-8 grid gap-3 md:grid-cols-4">
              {rhythm.map(([n, t, d], i) => (
                <li key={n}>
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="h-full rounded-2xl bg-white/[0.06] p-5">
                      <span className="bg-mango grid h-10 w-10 place-items-center rounded-full font-display font-bold text-white">{n}</span>
                      <p className="mt-4 font-display text-lg font-semibold">{t}</p>
                      <p className="mt-1 text-sm text-white/60">{d}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          {/* Events and workshops */}
          <div className="mt-24">
            <SubHead id="events" dark eyebrow="Events and workshops" title="Talks, workshops and open sessions" sub="Meet Nitienaa live, online or in person. Free open sessions are a good way to try the method before you apply." />
            <ul className="mt-8 space-y-3">
              {events.map((e, i) => (
                <li key={i} className="flex flex-wrap items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="w-16 rounded-xl bg-white/10 py-2 text-center">
                    <p className="text-[11px] font-semibold uppercase text-orange-300">[MON]</p>
                    <p className="font-display text-2xl font-bold leading-none">[DD]</p>
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{e.type} · {e.price}</p>
                    <p className="font-display text-lg font-semibold">[Event title]</p>
                    <p className="text-sm text-white/60">[Time, IST] · {e.where}</p>
                  </div>
                  <Link href="/nitienaa/contact" className="rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20">
                    {e.price === "Free" ? "Register" : "Book a seat"}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
