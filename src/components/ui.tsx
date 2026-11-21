import Link from "next/link";

export function Logo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`} aria-label="TagMango home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dark ? "/tagmango/brand/tagmango-logo-dark.svg" : "/tagmango/brand/tagmango-logo.svg"} alt="tagmango" className="h-[26px] w-auto" />
    </Link>
  );
}

export function MangoIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="mg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ff6a00" />
          <stop offset="0.6" stopColor="#fb9311" />
          <stop offset="1" stopColor="#f6bb22" />
        </linearGradient>
      </defs>
      <path
        d="M14 40c0-14 11-24 24-24 8 0 12 5 12 12 0 15-13 26-26 26-6 0-10-5-10-14z"
        fill="url(#mg)"
      />
      <path d="M40 17c2-6 7-9 13-9-1 6-5 10-11 11z" fill="#e8590c" />
      <path d="M22 44c3-8 9-14 18-17" stroke="#fff" strokeOpacity=".35" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Arrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M4 10h12m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PrimaryButton({ href = "/web/sign-up", children, className = "" }: { href?: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`bg-mango inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_30px_-8px_rgba(255,106,0,0.7)] transition hover:brightness-110 active:scale-[0.98] ${className}`}
    >
      {children}
    </Link>
  );
}

export function GhostButton({ href = "/demo", children, className = "" }: { href?: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-8 py-3.5 text-[15px] font-semibold text-white backdrop-blur transition hover:bg-white/[0.12] ${className}`}
    >
      {children}
    </Link>
  );
}

export function DarkButton({ href = "/demo", children, className = "" }: { href?: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-black ${className}`}
    >
      {children}
    </Link>
  );
}

const avatarGradients = [
  "from-amber-300 to-orange-500",
  "from-rose-300 to-pink-500",
  "from-sky-300 to-indigo-500",
  "from-emerald-300 to-teal-500",
  "from-violet-300 to-purple-600",
  "from-yellow-200 to-amber-500",
  "from-orange-300 to-red-500",
  "from-cyan-300 to-blue-500",
];

export function Avatar({ name, i = 0, className = "h-8 w-8 text-xs" }: { name: string; i?: number; className?: string }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <div className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-white ${avatarGradients[i % avatarGradients.length]} ${className}`}>
      {initials}
    </div>
  );
}

export function PortraitPlaceholder({ name, i = 0, className = "" }: { name: string; i?: number; className?: string }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b ${avatarGradients[i % avatarGradients.length]} ${className}`}>
      <div className="absolute inset-x-[18%] top-[16%] aspect-square rounded-full bg-white/25" />
      <div className="absolute inset-x-[6%] bottom-0 h-[38%] rounded-t-[50%] bg-white/20" />
      <span className="absolute inset-0 grid place-items-center pb-[18%] font-display text-2xl font-bold text-white/90">{initials}</span>
    </div>
  );
}
