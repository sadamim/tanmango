"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MeContext, api, useCollection, useMe, type Me } from "@/lib/client";
import { Icon } from "./icons";
import { dash, isGroup, isLocked, sidebar, topTabs, type NavGroup, type NavLeaf } from "./nav";
import Toaster from "./Toaster";

function useClickOutside(cb: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && cb();
    document.addEventListener("mousedown", on);
    return () => document.removeEventListener("mousedown", on);
  }, [cb]);
  return ref;
}

function PromoStrip({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative flex h-[52px] items-center gap-4 overflow-hidden bg-[radial-gradient(90%_220%_at_50%_120%,#6b2f0e_0%,#1d0f08_55%,#120a06_100%)] px-4 text-white md:px-6">
      <div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/15 bg-black/40 px-1.5 py-1 lg:flex">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#e5372e] px-2 py-0.5 text-[10px] font-bold"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />LIVE</span>
        <span className="pr-1 text-[12px] font-extrabold">BLACK <span className="text-[#f2962c]">FRIDAY</span> Special</span>
      </div>
      <span className="hidden shrink-0 text-[15px] font-extrabold lg:block"><span className="text-[#e5372e]">●</span> Build It <span className="text-[#f2962c]">Live</span></span>
      <p className="flex-1 truncate text-center text-[14px] md:text-[19px]">
        <b className="font-extrabold">Build your coaching business</b> <b className="font-extrabold text-[#f2962c]">Live</b> with us, in 2 days.
      </p>
      <div className="hidden shrink-0 items-center gap-1 rounded-full border border-[#f2962c]/60 p-1 md:flex">
        <span className="px-3 text-[13px] font-bold text-[#f6b26b]">Nov 20–21</span>
        <Link href="/demo" className="rounded-full bg-gradient-to-r from-[#ff6a00] to-[#f6bb22] px-4 py-1.5 text-[13px] font-bold">Tap to register →</Link>
      </div>
      <button aria-label="Close banner" onClick={onClose} className="shrink-0 opacity-80 hover:opacity-100"><Icon name="close" className="h-5 w-5" /></button>
    </div>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  const path = usePathname();
  const router = useRouter();
  const { me } = useMe();
  const [open, setOpen] = useState<"apps" | "bell" | "user" | null>(null);
  const ref = useClickOutside(() => setOpen(null));
  const notes = useCollection("notifications");
  const unread = notes.rows.filter((n) => !n.read).length;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/web/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center border-b border-[#e1e1e1] bg-white">
      <div className="flex h-full w-auto shrink-0 items-center px-4 lg:w-[320px] lg:px-6">
        <button className="mr-3 lg:hidden" onClick={onMenu} aria-label="Open menu"><Icon name="menu" className="h-6 w-6" /></button>
        <Link href={dash("getstarted")} className="font-app text-[24px] font-medium tracking-tight">tag<span className="text-[#f2962c]">mango</span></Link>
      </div>
      <nav className="mx-auto hidden h-full md:flex">
        {topTabs.map((t) => {
          const active = t.match ? t.match(path) : path.startsWith(t.href);
          return (
            <Link key={t.label} href={t.href} className={`relative flex w-[92px] flex-col items-center justify-center gap-1 text-[10.5px] font-medium tracking-[0.1em] transition-colors lg:w-[120px] ${active ? "text-[#f2962c]" : "text-[#0f0f0f]/80 hover:text-[#0f0f0f]"}`}>
              <Icon name={t.icon} className="h-[20px] w-[20px]" />
              {t.label}
              <span className={`absolute bottom-0 h-[2px] bg-[#f2962c] transition-all duration-300 ${active ? "w-full" : "w-0"}`} />
            </Link>
          );
        })}
      </nav>
      <div ref={ref} className="relative ml-auto flex shrink-0 items-center gap-2 pr-4 md:ml-0 lg:pr-6">
        <button onClick={() => setOpen(open === "apps" ? null : "apps")} className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f2f2] hover:bg-[#e9e9e9]" aria-label="Apps"><Icon name="apps" className="h-4 w-4" /></button>
        <button onClick={() => setOpen(open === "bell" ? null : "bell")} className="relative grid h-9 w-9 place-items-center rounded-full bg-[#f2f2f2] hover:bg-[#e9e9e9]" aria-label="Notifications">
          <Icon name="bell" className="h-4 w-4" />
          {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#e5372e] px-1 text-[9px] font-bold text-white">{unread}</span>}
        </button>
        <button onClick={() => setOpen(open === "user" ? null : "user")} className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-[#e1e1e1] bg-[#dcdcdc] text-white" aria-label="Account">
          <Icon name="user" className="mt-2 h-7 w-7 text-white" />
        </button>

        {open === "apps" && (
          <div className="animate-soft-fade absolute right-4 top-12 w-72 rounded-xl border border-[#e1e1e1] bg-white p-3 shadow-xl">
            <p className="px-1 pb-2 text-[12px] font-semibold uppercase tracking-wide text-[#0f0f0f]/50">Quick create</p>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              {[["Mango", "mangoes", "mango-overview?newMangoform=true"], ["Course", "courses", "courses?new=1"], ["Workshop", "workshops", "workshop?new=1"], ["Event", "calendar", "events?new=1"], ["Coupon", "marketing", "coupons?new=1"], ["Broadcast", "messages", "campaigns?new=1"]].map(([l, i, h]) => (
                <Link key={l} href={dash(h)} onClick={() => setOpen(null)} className="flex flex-col items-center gap-1.5 rounded-lg p-2.5 hover:bg-[#fdefdf]">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#fdefdf] text-[#f2962c]"><Icon name={i} className="h-5 w-5" /></span>
                  {l}
                </Link>
              ))}
            </div>
          </div>
        )}
        {open === "bell" && (
          <div className="animate-soft-fade absolute right-4 top-12 w-80 rounded-xl border border-[#e1e1e1] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#ededed] px-4 py-3">
              <p className="font-semibold">Notifications</p>
              {unread > 0 && <button className="text-[12px] text-[#1677ff]" onClick={() => Promise.all(notes.rows.filter((n) => !n.read).map((n) => notes.update(n.id, { read: true })))}>Mark all read</button>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notes.rows.length === 0 && <p className="px-4 py-8 text-center text-[13px] text-[#0f0f0f]/50">You&apos;re all caught up</p>}
              {notes.rows.map((n) => (
                <div key={n.id} className={`border-b border-[#f2f2f2] px-4 py-3 text-[13px] ${n.read ? "text-[#0f0f0f]/60" : "bg-[#fdefdf]/50"}`}>
                  {String(n.text)}
                  <p className="mt-0.5 text-[11px] text-[#0f0f0f]/40">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {open === "user" && (
          <div className="animate-soft-fade absolute right-4 top-12 w-64 rounded-xl border border-[#e1e1e1] bg-white py-2 shadow-xl">
            <div className="border-b border-[#ededed] px-4 pb-3 pt-1">
              <p className="font-semibold">{me.name}</p>
              <p className="truncate text-[12px] text-[#0f0f0f]/50">{me.email}</p>
              <span className="mt-1 inline-block rounded bg-[#fdefdf] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#c7740f]">{me.plan} plan</span>
            </div>
            <Link href={dash("platformsettings")} onClick={() => setOpen(null)} className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] hover:bg-[#f7f7f7]"><Icon name="settings" className="h-4 w-4" />Settings</Link>
            <Link href={dash("balance")} onClick={() => setOpen(null)} className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] hover:bg-[#f7f7f7]"><Icon name="billing" className="h-4 w-4" />KYC &amp; Withdrawals</Link>
            <Link href={dash("plans")} onClick={() => setOpen(null)} className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] hover:bg-[#f7f7f7]"><Icon name="star" className="h-4 w-4" />Plans</Link>
            {me.isAdmin && <Link href="/admin" onClick={() => setOpen(null)} className="flex items-center gap-2.5 border-t border-[#ededed] px-4 py-2.5 text-[14px] font-medium text-[#c7740f] hover:bg-[#fdefdf]"><Icon name="lock" className="h-4 w-4" />Admin panel</Link>}
            <button onClick={logout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] text-red-600 hover:bg-red-50"><Icon name="logout" className="h-4 w-4" />Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

const leafMatches = (l: NavLeaf, q: string) => l.label.toLowerCase().includes(q);
function filterTree(nodes: (NavLeaf | NavGroup)[], q: string): (NavLeaf | NavGroup)[] {
  return nodes
    .map((n) => (isGroup(n) ? { ...n, children: n.label.toLowerCase().includes(q) ? n.children : filterTree(n.children, q) } : n))
    .filter((n) => (isGroup(n) ? n.children.length > 0 : leafMatches(n, q)));
}
const containsPath = (nodes: (NavLeaf | NavGroup)[], path: string): boolean =>
  nodes.some((n) => (isGroup(n) ? containsPath(n.children, path) : path === dash(n.slug) || path.startsWith(dash(n.slug) + "/")));

function SubTree({ nodes, depth, path, q, open, toggle, onNav }: { nodes: (NavLeaf | NavGroup)[]; depth: number; path: string; q: string; open: string[]; toggle: (k: string) => void; onNav: () => void }) {
  const { me } = useMe();
  return (
    <>
      {nodes.map((n) => {
        if (isGroup(n)) {
          const key = n.label;
          const isOpen = Boolean(q) || open.includes(key);
          return (
            <div key={key}>
              <button onClick={() => toggle(key)} className="flex h-10 w-full items-center gap-2 rounded-md pr-3 text-[14px] text-[#4a4a59] hover:bg-[#f7f7f7]" style={{ paddingLeft: 26 + depth * 18 }}>
                <span className="text-[#4a4a59]/70">•</span>
                <span className="flex-1 text-left">{n.label}</span>
                <Icon name="chevron" className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden"><SubTree nodes={n.children} depth={depth + 1} path={path} q={q} open={open} toggle={toggle} onNav={onNav} /></div>
              </div>
            </div>
          );
        }
        const href = dash(n.slug);
        const on = path === href || path.startsWith(href + "/");
        const locked = isLocked(n.slug, me.plan);
        return (
          <Link key={n.slug} href={href} onClick={onNav} className={`my-0.5 flex h-10 items-center gap-2 rounded-md pr-3 text-[14px] transition-colors ${on ? "bg-[#fdefdf] text-[#f2962c]" : "text-[#4a4a59] hover:bg-[#f7f7f7]"}`} style={{ paddingLeft: 26 + depth * 18 }}>
            <span className={on ? "text-[#f2962c]" : "text-[#4a4a59]/70"}>•</span>
            <span className="truncate">{n.label}</span>
            {n.badge && <span className="rounded-full bg-[#f2962c] px-1.5 text-[9px] font-semibold uppercase leading-4 text-white">{n.badge}</span>}
            {locked && <Icon name="lock" className="h-3.5 w-3.5 shrink-0 text-[#f2962c]" />}
          </Link>
        );
      })}
    </>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = usePathname();
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string[]>(() => {
    const keys: string[] = [];
    const walk = (nodes: (NavLeaf | NavGroup)[]) => nodes.forEach((n) => isGroup(n) && containsPath(n.children, path) && (keys.push(n.label), walk(n.children)));
    sidebar.forEach((t) => t.children && containsPath(t.children, path) && (keys.push(t.label), walk(t.children)));
    return keys;
  });
  const toggle = (k: string) => setExpanded((e) => (e.includes(k) ? e.filter((x) => x !== k) : [...e, k]));

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return sidebar;
    return sidebar
      .map((t) => ({ ...t, children: t.children && (t.label.toLowerCase().includes(term) ? t.children : filterTree(t.children, term)) }))
      .filter((t) => t.label.toLowerCase().includes(term) || (t.children && t.children.length));
  }, [q]);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col border-r border-[#ededed] bg-white transition-transform duration-300 lg:sticky lg:top-[60px] lg:z-10 lg:h-[calc(100vh-60px)] lg:w-[320px] lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="border-b border-[#ededed] px-4 py-4">
          <label className="flex h-10 items-center gap-2.5 rounded-md border border-[#e1e1e1] px-3 focus-within:border-[#f2962c]">
            <Icon name="search" className="h-4 w-4 text-[#4a4a59]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="w-full text-[14px] outline-none placeholder:text-[#4a4a59]/60" />
          </label>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {items.map((t) => {
            const active = t.slug ? path === dash(t.slug) : t.children && containsPath(t.children, path);
            const isOpen = Boolean(q) || expanded.includes(t.label);
            const cls = `my-1 flex h-10 w-full items-center gap-3 rounded-md px-2.5 text-[14px] transition-colors ${active && t.slug ? "bg-[#fdefdf] text-[#f2962c]" : active ? "text-[#f2962c]" : "text-[#4a4a59] hover:bg-[#f7f7f7]"}`;
            const iconEl = <Icon name={t.icon} className="h-[18px] w-[18px] shrink-0" />;
            return (
              <div key={t.label}>
                {t.slug ? (
                  <Link href={dash(t.slug)} onClick={onClose} className={cls}>{iconEl}{t.label}</Link>
                ) : (
                  <button className={cls} onClick={() => toggle(t.label)}>
                    {iconEl}
                    <span className="flex-1 text-left">{t.label}</span>
                    <Icon name="chevron" className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                )}
                {t.children && (
                  <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden"><SubTree nodes={t.children} depth={0} path={path} q={q.trim().toLowerCase()} open={expanded} toggle={toggle} onNav={onClose} /></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <Link href={dash("plans")} onClick={onClose} className="m-2 flex items-center gap-3 rounded-lg bg-[#5a2a10] p-3.5 text-white transition hover:bg-[#6b3216]">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10"><Icon name="partner" className="h-6 w-6" /></span>
          <span className="flex-1">
            <b className="block text-[15px] leading-snug">Become a TagMango Partner</b>
            <span className="mt-0.5 block text-[12px] text-white/85">Refer tagmango and earn 20% commission on each sale.</span>
          </span>
          <Icon name="chevron" className="h-4 w-4 -rotate-90" />
        </Link>
      </aside>
    </>
  );
}

function MobileTabs() {
  const path = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 flex border-t border-[#e1e1e1] bg-white md:hidden">
      {topTabs.map((t) => {
        const active = t.match ? t.match(path) : path.startsWith(t.href);
        return (
          <Link key={t.label} href={t.href} className={`flex flex-1 flex-col items-center gap-1 py-2 text-[9px] font-medium tracking-wider ${active ? "text-[#f2962c]" : "text-[#0f0f0f]/60"}`}>
            <Icon name={t.icon} className="h-5 w-5" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const [me, setMeRaw] = useState<Me | null>(null);
  const [menu, setMenu] = useState(false);
  const [promo, setPromo] = useState(false);
  const path = usePathname();
  const inDashboard = path.startsWith("/web/dashboard");

  useEffect(() => {
    api<{ user: Me }>("/api/me").then((r) => (r.user.role === "learner" ? window.location.replace("/portal") : setMeRaw(r.user))).catch(() => {});
    try {
      setPromo(localStorage.getItem("tm:promo-closed") !== "1");
    } catch {
      setPromo(true);
    }
  }, []);

  if (!me) {
    return (
      <div className="font-app grid min-h-screen place-items-center bg-white">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#fdefdf] border-t-[#f2962c]" />
      </div>
    );
  }

  return (
    <MeContext.Provider value={{ me, setMe: (m: Me) => setMeRaw((p) => ({ ...p, ...m }) as Me) }}>
      <div className="font-app min-h-screen bg-white text-[#0f0f0f]">
        {promo && <PromoStrip onClose={() => { setPromo(false); try { localStorage.setItem("tm:promo-closed", "1"); } catch {} }} />}
        <Header onMenu={() => setMenu(true)} />
        <div className="flex">
          {inDashboard && <Sidebar open={menu} onClose={() => setMenu(false)} />}
          <main className={`min-w-0 flex-1 bg-[#f7f7f8] ${inDashboard ? "p-4 md:p-6" : "p-4 md:px-10 md:py-8"}`}>{children}</main>
        </div>
        <MobileTabs />
        <Toaster />
      </div>
    </MeContext.Provider>
  );
}
