"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MeContext, api, type Me } from "@/lib/client";
import { useAdminData } from "@/lib/adminClient";
import { Icon } from "@/components/dash/icons";
import Toaster from "@/components/dash/Toaster";
import { Logo } from "@/components/ui";

const NAV = [
  { href: "/admin", label: "Overview", icon: "analytics" },
  { href: "/admin/creators", label: "Creators", icon: "customers" },
  { href: "/admin/orders", label: "Orders", icon: "sales" },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: "download", badge: "withdrawals" as const },
  { href: "/admin/billing", label: "Plans & Billing", icon: "billing" },
  { href: "/admin/reports", label: "Reports", icon: "warning", badge: "reports" as const },
  { href: "/admin/announcements", label: "Announcements", icon: "bell" },
  { href: "/admin/audit", label: "Audit log", icon: "eye" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

function Sidebar({ me, open, onClose }: { me: Me; open: boolean; onClose: () => void }) {
  const path = usePathname();
  const router = useRouter();
  const counts = useAdminData<{ withdrawals: number; reports: number }>("/api/admin/counts");
  useEffect(() => {
    const t = setInterval(counts.reload, 30000);
    return () => clearInterval(t);
  }, [counts.reload]);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-[#0f0f10] text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[64px] items-center gap-2.5 border-b border-white/10 px-5">
          <Logo />
          <span className="rounded bg-[#f2962c] px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white">ADMIN</span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV.map((n) => {
            const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
            const count = n.badge ? counts.data?.[n.badge] || 0 : 0;
            return (
              <Link key={n.href} href={n.href} onClick={onClose} className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] transition-colors ${active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"}`}>
                {active && <span className="absolute -left-3 top-2 h-6 w-1 rounded-r bg-[#f2962c]" />}
                <Icon name={n.icon} className={`h-[18px] w-[18px] ${active ? "text-[#f2962c]" : ""}`} />
                <span className="flex-1">{n.label}</span>
                {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#f2962c] px-1.5 text-[11px] font-bold text-white">{count}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-[13px] font-medium">{me.name}</p>
          <p className="truncate text-[12px] text-white/50">{me.email}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/web/dashboard/getstarted" className="flex-1 rounded-md bg-white/10 py-2 text-center text-[12px] transition hover:bg-white/15">Creator view</Link>
            <button
              className="flex-1 rounded-md bg-white/10 py-2 text-[12px] transition hover:bg-white/15"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/web/login");
                router.refresh();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [me, setMeRaw] = useState<Me | null>(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    api<{ user: Me }>("/api/me").then((r) => setMeRaw(r.user)).catch(() => {});
  }, []);

  if (!me) {
    return (
      <div className="font-app grid min-h-screen place-items-center bg-[#f5f5f7]">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#fdefdf] border-t-[#f2962c]" />
      </div>
    );
  }

  if (!me.isAdmin) {
    return (
      <div className="font-app grid min-h-screen place-items-center bg-[#f5f5f7] p-6 text-center">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff2f0] text-[#cf1322]"><Icon name="lock" className="h-7 w-7" /></span>
          <h1 className="mt-4 text-[22px] font-bold">Admin access required</h1>
          <p className="mt-2 text-[14px] text-[#4a4a59]">You&apos;re signed in as <b>{me.email}</b>, which isn&apos;t on the admin list. Ask an administrator to add your email to <code className="rounded bg-[#f2f2f2] px-1">ADMIN_EMAILS</code>.</p>
          <Link href="/web/dashboard/getstarted" className="mt-6 inline-block rounded-lg bg-[#f2962c] px-5 py-2.5 text-[14px] font-medium text-white">Back to your dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <MeContext.Provider value={{ me, setMe: (m: Me) => setMeRaw((p) => ({ ...p, ...m }) as Me) }}>
      <div className="font-app min-h-screen bg-[#f5f5f7] text-[#0f0f0f] lg:grid lg:grid-cols-[248px_1fr]">
        <Sidebar me={me} open={menu} onClose={() => setMenu(false)} />
        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex h-[56px] items-center gap-3 border-b border-[#e1e1e1] bg-white px-4 lg:hidden">
            <button onClick={() => setMenu(true)} aria-label="Open menu"><Icon name="menu" className="h-6 w-6" /></button>
            <span className="font-semibold">TagMango Admin</span>
          </header>
          <main className="mx-auto w-full max-w-[1400px] p-4 md:p-8">{children}</main>
        </div>
        <Toaster />
      </div>
    </MeContext.Provider>
  );
}
