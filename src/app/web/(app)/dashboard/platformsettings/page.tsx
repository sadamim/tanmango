"use client";
import Link from "next/link";
import { useState } from "react";
import { patchMe, toast, useCollection, useMe } from "@/lib/client";
import { Btn, Field, LockedCard, Panel, Tabs, Title, Toggle, areaCls, inputCls } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";
import { dash, isLocked, topTabs } from "@/components/dash/nav";

const TABS = ["Domain", "Branding & Customisation", "Customise Menu", "Migrate Data", "Help & Support"] as const;
type T = (typeof TABS)[number];
const FEATURE: Partial<Record<T, string>> = { "Branding & Customisation": "platform-branding", "Customise Menu": "platform-menu", "Migrate Data": "platform-migrate" };

function Domain() {
  const { me, setMe } = useMe();
  const [domain, setDomain] = useState(String(me.settings?.domain || ""));
  if (!me.whiteLabel) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <p className="text-[20px] font-semibold">Feature disabled!</p>
        <p className="mt-2 max-w-md text-[13px] text-[#4a4a59]">The domain linking feature is only available for White Label creators. Upgrade to White Label with the <Link href={dash("plans")} className="text-[#1677ff]">Freedom Setup</Link>.</p>
      </div>
    );
  }
  return (
    <div className="mt-4 max-w-xl space-y-4">
      <Field label="Custom domain" hint="Point a CNAME record for this domain to cname.tagmango.app, then save."><input className={inputCls} placeholder="learn.yourbrand.com" value={domain} onChange={(e) => setDomain(e.target.value.trim().toLowerCase())} /></Field>
      <Btn onClick={async () => {
        if (!/^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) return toast("Enter a valid domain like learn.yourbrand.com", "err");
        const r = await patchMe({ settings: { domain } }); setMe(r.user); toast("Domain saved — DNS verification is simulated in this clone");
      }}>Save domain</Btn>
    </div>
  );
}

function Branding() {
  const { me, setMe } = useMe();
  const b = (me.settings?.branding || {}) as Record<string, string>;
  const [d, setD] = useState({ name: me.name, color: "#f2962c", logo: "", favicon: "", ...b });
  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Field label="Platform name"><input className={inputCls} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></Field>
        <Field label="Brand colour"><input type="color" className={`${inputCls} p-1`} value={d.color} onChange={(e) => setD({ ...d, color: e.target.value })} /></Field>
        <Field label="Logo URL"><input className={inputCls} placeholder="https://…/logo.png" value={d.logo} onChange={(e) => setD({ ...d, logo: e.target.value })} /></Field>
        <Field label="Favicon URL"><input className={inputCls} placeholder="https://…/favicon.png" value={d.favicon} onChange={(e) => setD({ ...d, favicon: e.target.value })} /></Field>
        <Btn onClick={async () => { const r = await patchMe({ settings: { branding: d } }); setMe(r.user); toast("Branding saved"); }}>Save</Btn>
      </div>
      <div className="rounded-[10px] border border-[#ededed] p-4">
        <p className="text-[12px] text-[#6b6b7b]">Preview</p>
        <div className="mt-3 flex items-center gap-2 border-b border-[#ededed] pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {d.logo ? <img src={d.logo} alt="" className="h-7 w-7 rounded object-cover" /> : <span className="h-7 w-7 rounded" style={{ background: d.color }} />}
          <b style={{ color: d.color }}>{d.name}</b>
        </div>
        <button className="mt-3 w-full rounded-md py-2 text-[13px] font-semibold text-white" style={{ background: d.color }}>Buy now</button>
      </div>
    </div>
  );
}

function Menu() {
  const { me, setMe } = useMe();
  const m = (me.settings?.menu || {}) as Record<string, { label?: string; hidden?: boolean }>;
  return (
    <div className="mt-4 max-w-xl divide-y divide-[#f0f0f0] rounded-[10px] border border-[#ededed]">
      {topTabs.map((t) => (
        <div key={t.label} className="flex items-center gap-3 px-4 py-3">
          <input className={`${inputCls} flex-1`} defaultValue={m[t.label]?.label || t.label} onBlur={async (e) => { const r = await patchMe({ settings: { menu: { ...m, [t.label]: { ...m[t.label], label: e.target.value } } } }); setMe(r.user); }} aria-label={`${t.label} label`} />
          <Toggle on={!m[t.label]?.hidden} disabled={t.label === "DASHBOARD"} onChange={async (v) => { const r = await patchMe({ settings: { menu: { ...m, [t.label]: { ...m[t.label], hidden: !v } } } }); setMe(r.user); toast(v ? "Shown to members" : "Hidden from members"); }} label={`Show ${t.label}`} />
        </div>
      ))}
    </div>
  );
}

function Migrate() {
  const manual = useCollection("customers");
  const [text, setText] = useState("");
  const [mango, setMango] = useState("");
  const mangoes = useCollection("mangoes");
  return (
    <div className="mt-4 max-w-2xl space-y-3">
      <p className="text-[13px] text-[#6b6b7b]">Paste CSV rows from your old platform: <code>name,email,phone</code>. They get access to the mango you pick.</p>
      <select className={inputCls} value={mango} onChange={(e) => setMango(e.target.value)}><option value="">Select mango…</option>{mangoes.rows.map((m) => <option key={m.id}>{String(m.title)}</option>)}</select>
      <textarea className={`${areaCls} min-h-40 font-mono`} placeholder={"Asha Rao,asha@example.com,9876543210\nRavi Kumar,ravi@example.com,"} value={text} onChange={(e) => setText(e.target.value)} />
      <Btn onClick={async () => {
        if (!mango) return toast("Pick a mango", "err");
        const lines = text.split("\n").map((l) => l.split(",").map((x) => x.trim())).filter((p) => p[0] && /^\S+@\S+\.\S+$/.test(p[1] || ""));
        if (!lines.length) return toast("No valid rows (need name,email)", "err");
        for (const [name, email, phone] of lines) await manual.create({ name, email: email.toLowerCase(), phone: (phone || "").replace(/\D/g, "").slice(-10), mango, source: "migration" });
        setText("");
        toast(`Imported ${lines.length} customer(s)`);
      }}>Import customers</Btn>
    </div>
  );
}

function Help() {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      {[["Help Centre", "Guides for every feature", "info"], ["Chat with us", "Mon–Sat, 10am–7pm", "messages"], ["Book a call", "30 minutes with an expert", "calendar"]].map(([t, d, i]) => (
        <Link key={t} href={t === "Book a call" ? "/demo" : "#"} className="rounded-[10px] border border-[#ededed] p-4 transition hover:border-[#f2962c]">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#fdefdf] text-[#f2962c]"><Icon name={i} className="h-5 w-5" /></span>
          <p className="mt-3 font-semibold">{t}</p><p className="text-[13px] text-[#6b6b7b]">{d}</p>
        </Link>
      ))}
    </div>
  );
}

export default function PlatformSettings() {
  const { me } = useMe();
  const [tab, setTab] = useState<T>("Domain");
  const locked = TABS.filter((t) => FEATURE[t] && isLocked(FEATURE[t]!, me.plan));
  const isTabLocked = locked.includes(tab);
  return (
    <Panel className="p-5">
      <Title>Platform Settings</Title>
      <div className="mt-3"><Tabs tabs={[...TABS]} value={tab} onChange={setTab} locked={locked} /></div>
      {isTabLocked ? <div className="mt-4"><LockedCard title={tab} /></div> : tab === "Domain" ? <Domain /> : tab === "Branding & Customisation" ? <Branding /> : tab === "Customise Menu" ? <Menu /> : tab === "Migrate Data" ? <Migrate /> : <Help />}
    </Panel>
  );
}
