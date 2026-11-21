"use client";
import Link from "next/link";
import { useState } from "react";
import { copy, useCollection, useMe } from "@/lib/client";
import { Btn, Modal } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";
import { dash } from "@/components/dash/nav";

function PromoCard() {
  return (
    <div className="animate-rise relative overflow-hidden rounded-[10px] bg-[linear-gradient(90deg,#3a1606_0%,#1b0c06_45%,#2a1309_100%)] text-white">
      <div className="pointer-events-none absolute left-[8%] top-1/2 hidden h-[230px] w-[230px] -translate-y-1/2 rounded-full border-[12px] border-[#f2962c]/80 md:block" />
      <div className="pointer-events-none absolute left-[1%] top-0 hidden h-full w-[30%] bg-[repeating-linear-gradient(100deg,transparent_0_28px,rgba(242,150,44,0.35)_28px_40px)] md:block" />
      <div className="relative grid items-center gap-4 p-5 md:grid-cols-[30%_1fr_auto] md:p-0 md:pr-8">
        <div className="hidden h-[136px] items-end justify-center md:flex"><div className="h-[120px] w-[120px] rounded-t-full bg-gradient-to-b from-amber-200/80 to-orange-400/80" /></div>
        <div className="md:py-4">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-1.5 py-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e5372e] px-2 py-0.5 text-[10px] font-bold"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />LIVE</span>
              <b>BLACK <span className="text-[#f2962c]">FRIDAY</span> Special</b>
            </span>
            <b className="text-[15px]"><span className="text-[#e5372e]">●</span> Build It <span className="text-[#f2962c]">Live</span></b>
          </div>
          <p className="mt-2 text-[22px] font-extrabold leading-tight md:text-[28px]">Build your coaching business</p>
          <p className="text-[22px] leading-tight md:text-[28px]"><b className="text-[#f2962c]">Live</b> with us, in 2 days.</p>
        </div>
        <div className="flex w-fit items-center gap-1 rounded-full border border-[#f2962c]/50 p-1">
          <span className="px-3 text-[14px] font-bold text-[#f6b26b]">Nov 20–21</span>
          <Link href="/demo" className="rounded-full bg-gradient-to-r from-[#ff6a00] to-[#f6bb22] px-4 py-2 text-[14px] font-bold transition hover:brightness-110">Tap to register →</Link>
        </div>
      </div>
    </div>
  );
}

function KycCard() {
  return (
    <div className="animate-rise relative overflow-hidden rounded-[10px] bg-[#2b1149] p-6 text-white md:p-7" style={{ ["--delay" as string]: "0.06s" }}>
      <div className="flex gap-5">
        <span className="hidden h-16 w-16 shrink-0 place-items-center rounded-full bg-white/10 sm:grid"><Icon name="warning" className="h-8 w-8" /></span>
        <div className="max-w-[860px] 2xl:pr-[300px]">
          <p className="text-[28px] font-bold text-[#f2962c]">Important!</p>
          <p className="mt-2 text-[15px] leading-relaxed text-white/90 md:text-[17px]">
            Your KYC details have not been updated yet. This will prevent any future withdrawals from this account. Update your KYC now to ensure a smooth withdrawal experience!
          </p>
          <Link href={`${dash("balance")}?kyc=1`} className="mt-4 inline-block rounded-md bg-[#fb6a0c] px-5 py-2.5 text-[16px] font-medium transition hover:bg-[#ff7a1f]">Update KYC</Link>
        </div>
      </div>
      <svg viewBox="0 0 300 160" className="pointer-events-none absolute -right-4 bottom-0 hidden h-[190px] 2xl:block" aria-hidden>
        <rect x="10" y="10" width="90" height="60" rx="6" fill="none" stroke="#fff" strokeOpacity=".5" />
        <circle cx="32" cy="34" r="10" fill="none" stroke="#fff" strokeOpacity=".6" />
        <rect x="48" y="28" width="40" height="4" rx="2" fill="#7c5cff" />
        <rect x="190" y="6" width="80" height="150" rx="8" fill="none" stroke="#fff" strokeOpacity=".6" />
        <path d="M212 50h36v34c0 14-18 22-18 22s-18-8-18-22Z" fill="#2fbf71" />
        <path d="m221 76 7 7 13-14" stroke="#fff" strokeWidth="4" fill="none" />
        <path d="M120 160c4-40 20-60 45-62 20 0 32 14 34 30l-10 32Z" fill="#fb6a0c" />
        <circle cx="160" cy="70" r="18" fill="#fff" />
      </svg>
    </div>
  );
}

function VideoTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group relative min-h-[220px] w-full overflow-hidden bg-black text-left" aria-label={`Play: ${label}`}>
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,#3a2410_0%,#000_100%)]" />
      <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#f2962c] shadow-xl transition duration-300 group-hover:scale-110"><Icon name="play" className="ml-1 h-6 w-6" /></span>
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 text-[12px] text-white/90">
        <Icon name="play" className="h-3.5 w-3.5" /><span>0:00 / 4:29</span><span className="ml-2 h-1 flex-1 rounded bg-white/30" /><span>{label}</span>
      </div>
    </button>
  );
}

const SLIDES: Record<string, [string, string][]> = {
  start: [
    ["Create a Mango", "A mango is your offering: a price, a plan (one-time or subscription) and everything buyers get access to."],
    ["Link your product", "Create a course or workshop and link it to your mango — buyers unlock it automatically."],
    ["Share & sell", "Publish a Mango Page or share your storefront link. Orders show up under Sales › Transactions."],
    ["Get paid", "Complete KYC and add your bank account under Sales › Withdrawals."],
  ],
  course: [["Build a course", "Add sections and chapters with videos, audio, PDFs and text. Link mangoes so buyers get access."], ["Publish", "Toggle publish when you're ready. Learners see it under Courses."]],
  workshop: [["Schedule a workshop", "Pick a date and time, add your meeting link, and link a mango."], ["Reminders", "Turn on reminder emails in Automation › Email Automation."]],
};

export default function GetStarted() {
  const { me } = useMe();
  const mangoes = useCollection("mangoes");
  const courses = useCollection("courses");
  const workshops = useCollection("workshops");
  const [video, setVideo] = useState<string | null>(null);
  const [i, setI] = useState(0);

  const linked = [...courses.rows, ...workshops.rows].some((p) => (Array.isArray(p.mangoes) ? p.mangoes.length : p.mango));
  const done = [true, mangoes.rows.length > 0, linked, Boolean(me.bank)];
  const count = done.filter(Boolean).length;
  const steps = [
    { t: "Create account" },
    { t: "Setup your first offering: We call it a mango", href: `${dash("mango-overview")}?newMangoform=true` },
    { t: "Create & link your digital product", href: `${dash("courses")}?new=1` },
    { t: "Setup your bank account", href: `${dash("balance")}?kyc=1` },
  ];
  const storeLink = typeof window !== "undefined" ? `${location.origin}/web/lite/store/${me.id}` : "";
  const open = (k: string) => { setI(0); setVideo(k); };

  return (
    <div className="mx-auto max-w-[1500px] space-y-8">
      <PromoCard />
      {!me.kycDone && <KycCard />}

      <div className="animate-rise" style={{ ["--delay" as string]: "0.1s" }}>
        <h1 className="text-[30px] font-bold md:text-[36px]">Hello {me.name.split(" ")[0]}, welcome!</h1>
        <p className="mt-1 text-[16px] text-[#0f0f0f]/80 md:text-[18px]">Your monetisation journey on TagMango starts here!</p>
      </div>

      <div className="animate-rise grid overflow-hidden rounded-[10px] border border-[#ededed] bg-white lg:grid-cols-[1fr_1.05fr]" style={{ ["--delay" as string]: "0.14s" }}>
        <div className="p-6 md:p-8">
          <h2 className="text-[24px] font-semibold">Let&apos;s get started</h2>
          <p className="mt-1 text-[17px] text-[#6b6b7b]">{count} out of 4 steps completed</p>
          <ol className="mt-6 space-y-5">
            {steps.map((s, k) => {
              const next = done.findIndex((d) => !d) === k;
              const row = (
                <>
                  {done[k] ? (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#2e9e4f] text-white"><Icon name="check" className="h-4 w-4" /></span>
                  ) : (
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[14px] ${next ? "border-[#2e9e4f] text-[#2e9e4f]" : "border-[#bfbfbf] text-[#6b6b7b]"}`}>{k + 1}</span>
                  )}
                  <span className={`text-[16px] md:text-[18px] ${done[k] ? "text-[#6b6b7b] line-through" : "group-hover:text-[#f2962c]"}`}>{s.t}</span>
                </>
              );
              return <li key={s.t}>{!done[k] && s.href ? <Link href={s.href} className="group flex items-center gap-4">{row}</Link> : <div className="flex items-center gap-4">{row}</div>}</li>;
            })}
          </ol>
        </div>
        <VideoTile label="Getting started" onClick={() => open("start")} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="animate-rise flex flex-col rounded-[10px] border border-[#ededed] bg-white p-6" style={{ ["--delay" as string]: "0.18s" }}>
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f2f2f2]"><Icon name="mangoes" className="h-5 w-5" /></span><h3 className="text-[20px] font-semibold">Create an Offering</h3></div>
          <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[#4a4a59]">A mango is an offering that you want to sell. It is a payment page on Steroids! You can link it with workshops, courses, posts, communities and more. Anyone purchasing a mango gets access to everything linked to it.</p>
          <Link href={`${dash("mango-overview")}?newMangoform=true`} className="mt-5 w-fit"><Btn>Start building</Btn></Link>
        </div>
        <div className="animate-rise flex flex-col rounded-[10px] border border-[#ededed] bg-white p-6" style={{ ["--delay" as string]: "0.22s" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f2f2f2]"><Icon name="pagebuilder" className="h-5 w-5" /></span><h3 className="text-[20px] font-semibold">Manage your Storefront</h3></div>
            <Link href={`${dash("storefront")}?edit=1`}><Btn variant="outline">Edit storefront</Btn></Link>
          </div>
          <p className="mt-3 text-[14px] text-[#4a4a59]">Link to your storefront is given below</p>
          <div className="mt-auto flex items-center gap-2 pt-6">
            <code className="flex-1 truncate rounded-md border border-dashed border-[#9fb7e0] bg-[#f5f8ff] px-3 py-2 text-[13px] text-[#1677ff]">{storeLink}</code>
            <Btn variant="soft" onClick={() => copy(storeLink)} className="text-[#1677ff]">Copy Link</Btn>
          </div>
        </div>
      </div>

      <h2 className="animate-rise text-[22px] font-semibold" style={{ ["--delay" as string]: "0.26s" }}>Create Digital Products</h2>
      <div className="grid gap-5 lg:grid-cols-2">
        {[
          { t: "Build a Course", icon: "courses", d: "Create a recorded course complete with videos, audios, images, ebooks, assignments and more! You can create chapters and arrange them in sections to make it a fun learning experience.", href: `${dash("courses")}?new=1`, v: "course" },
          { t: "Create a Workshop", icon: "workshops", d: "Conduct workshops, live QnAs, community calls and more. Also set up email and whatsapp reminders for workshops from Automation > Email Automation.", href: `${dash("workshop")}?new=1`, v: "workshop" },
        ].map((c, k) => (
          <div key={c.t} className="animate-rise grid overflow-hidden rounded-[10px] border border-[#ededed] bg-white sm:grid-cols-[1fr_1fr]" style={{ ["--delay" as string]: `${0.3 + k * 0.05}s` }}>
            <div className="flex flex-col p-6">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f2f2f2]"><Icon name={c.icon} className="h-5 w-5" /></span><h3 className="text-[18px] font-semibold">{c.t}</h3></div>
              <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[#4a4a59]">{c.d}</p>
              <Link href={c.href} className="mt-5 w-fit"><Btn>Start building</Btn></Link>
            </div>
            <VideoTile label={c.t} onClick={() => open(c.v)} />
          </div>
        ))}
      </div>

      <h2 className="animate-rise text-[22px] font-semibold">Create a Mango Page</h2>
      <div className="animate-rise grid overflow-hidden rounded-[10px] border border-[#ededed] bg-white sm:grid-cols-[1fr_1fr] lg:max-w-[calc(50%-10px)]">
        <div className="flex flex-col p-6">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f2f2f2]"><Icon name="pagebuilder" className="h-5 w-5" /></span><h3 className="text-[18px] font-semibold">Build a Landing Page</h3></div>
          <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[#4a4a59]">Choose pre-defined templates or create a landing page from scratch to promote your mangoes to your audience and increase your conversions. Start building!</p>
          <Link href={`${dash("mango-websites")}?new=1`} className="mt-5 w-fit"><Btn>Start building</Btn></Link>
        </div>
        <VideoTile label="Mango pages" onClick={() => open("start")} />
      </div>

      {video && (
        <Modal title="Video walkthrough" onClose={() => setVideo(null)} wide>
          <div key={i} className="animate-soft-fade">
            <div className="grid aspect-video place-items-center rounded-lg bg-gradient-to-br from-[#1d1d1d] to-[#3a2410] text-white">
              <div className="px-8 text-center"><p className="text-[12px] uppercase tracking-[0.2em] text-[#f2962c]">Step {i + 1} of {SLIDES[video].length}</p><p className="mt-2 text-[24px] font-semibold">{SLIDES[video][i][0]}</p></div>
            </div>
            <p className="mt-4 text-[14px] text-[#4a4a59]">{SLIDES[video][i][1]}</p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            {i > 0 && <Btn variant="outline" onClick={() => setI(i - 1)}>Back</Btn>}
            <Btn onClick={() => (i < SLIDES[video].length - 1 ? setI(i + 1) : setVideo(null))}>{i < SLIDES[video].length - 1 ? "Next" : "Done"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
