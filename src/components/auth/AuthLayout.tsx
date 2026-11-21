import Link from "next/link";
import { MangoIcon } from "../ui";

function MiniDashboard() {
  const side = ["Get Started", "Analytics", "Mangoes", "Products", "Courses", "Workshops", "Sales", "Page Builder", "Customers", "Marketing", "Automation"];
  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white text-[9px] text-ink shadow-[0_30px_60px_-25px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between border-b border-black/5 px-3 py-2">
        <span className="font-app text-[11px] font-semibold">tag<span className="text-[#fb8a1b]">mango</span></span>
        <div className="flex gap-4 text-[7px] font-medium tracking-wider text-ink/50">
          <span className="text-[#fb8a1b]">DASHBOARD</span><span>FEED</span><span>WORKSHOPS</span><span>COURSES</span><span>MESSAGES</span>
        </div>
        <span className="h-4 w-4 rounded-full bg-black/10" />
      </div>
      <div className="flex">
        <div className="w-[26%] space-y-1 border-r border-black/5 p-2">
          {side.map((s, i) => (
            <div key={s} className={`rounded px-1.5 py-1 ${i === 0 ? "bg-orange-50 font-semibold" : "text-ink/60"}`}>{s}</div>
          ))}
          <div className="mt-2 rounded bg-[#5c2a12] p-1.5 text-white">Become a Partner →</div>
        </div>
        <div className="flex-1 space-y-2 p-3">
          <p className="font-app text-[13px] font-bold">Hello Creator, welcome!</p>
          <div className="grid grid-cols-[1.2fr_1fr] gap-2">
            <div className="space-y-1.5 rounded-lg border border-black/5 p-2">
              <p className="font-semibold">Let&apos;s get started</p>
              {["Create account", "Setup your first offering", "Create & link your product", "Setup your bank account"].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={`grid h-3 w-3 place-items-center rounded-full text-[6px] ${i < 2 ? "bg-green-600 text-white" : "border border-black/20"}`}>{i < 2 ? "✓" : i + 1}</span>
                  <span className={i < 2 ? "text-ink/40 line-through" : ""}>{s}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-black/5 p-2"><p className="font-semibold">Create an offering</p><div className="mt-1 h-1.5 w-2/3 rounded bg-black/5" /><div className="mt-2 w-fit rounded bg-[#fb8a1b] px-2 py-0.5 text-white">Create Mango</div></div>
            <div className="rounded-lg border border-black/5 p-2"><p className="font-semibold">Manage your users</p><div className="mt-1 h-1.5 w-2/3 rounded bg-black/5" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children, step }: { children: React.ReactNode; step?: 1 | 2 }) {
  return (
    <div className="font-app grid min-h-screen bg-white text-ink lg:grid-cols-[minmax(420px,37%)_1fr]">
      <div className="relative flex flex-col px-6 py-6 sm:px-12 lg:px-[4.5vw]">
        <Link href="/" aria-label="Home" className="grid h-10 w-10 place-items-center rounded-full bg-[#fb8a1b]">
          <MangoIcon className="h-6 w-6 [&_path:first-of-type]:fill-white" />
        </Link>
        <div className="flex flex-1 flex-col justify-center py-10">{children}</div>
        {!step && (
          <div className="text-[11px] text-ink/60">
            <p>TagMango {new Date().getFullYear()}. All rights reserved.</p>
            <div className="mt-2 flex gap-6">
              <Link href="#" className="hover:text-ink">Terms of Service</Link>
              <Link href="#" className="hover:text-ink">Privacy Policy</Link>
              <Link href="#" className="hover:text-ink">Help Centre</Link>
            </div>
          </div>
        )}
      </div>

      <div className="relative hidden overflow-hidden bg-[#fff5ec] lg:block">
        {/* square grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,138,27,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(251,138,27,0.12)_1px,transparent_1px)] bg-[size:28px_28px]" />
        {step && (
          <div className="absolute -left-[37vw] right-0 top-0 z-10 flex justify-center gap-10 pt-5 text-[13px] lg:left-auto lg:right-auto lg:w-full lg:-translate-x-[18%]">
            <span className={step === 1 ? "font-medium text-[#fb8a1b]" : "text-ink/50"}>1.&nbsp;&nbsp;Register</span>
            <span className={step === 2 ? "font-medium text-[#fb8a1b]" : "text-ink/50"}>2.&nbsp;&nbsp;About</span>
          </div>
        )}
        <div className="relative ml-[9%] mr-[6%] pt-[8vh]">
          <blockquote className="max-w-[620px] text-[22px] font-medium leading-[1.55] xl:text-[24px]">
            <b className="font-semibold">It was TagMango that helped me scale my knowledge business exponentially.</b>{" "}
            <span className="font-normal">Now I have thousands of students and a business that runs itself, all thanks to a superb product!</span>
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-ink text-[9px] font-bold text-white">FIN</div>
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wide">A Finance Creator</p>
              <p className="text-[13px] text-ink/60">Finance Creator | Investor | Trader</p>
            </div>
          </div>
          <div className="mt-10 w-[115%] animate-rise" style={{ ["--delay" as string]: "0.2s" }}>
            <MiniDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
