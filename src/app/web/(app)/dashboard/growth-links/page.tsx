"use client";
import { useEffect, useState } from "react";
import { api, copy, toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, Field, Note, Panel, Title, inputCls, type Col } from "@/components/dash/kit";
import { FormDrawer, type FieldDef } from "@/components/dash/forms";
import { Section, origin, useGrowthDoc } from "@/components/growth/shared";
import { PLATFORMS } from "@/lib/growth/model";

const FIELDS: FieldDef[] = [
  { key: "label", label: "Name", required: true, placeholder: "Reel: Boss and boundaries" },
  { key: "platform", label: "Platform", type: "select", options: [...PLATFORMS], required: true },
  { key: "campaign", label: "Campaign", placeholder: "oct-reels" },
  { key: "code", label: "Link code", required: true, placeholder: "ig-oct-reel1", hint: "Letters, numbers, dashes. Becomes /api/go/<code>." },
  { key: "target", label: "Sends people to", type: "select", options: ["quiz", "masterclass", "call", "bio", "custom"], required: true, hint: "quiz = Pattern Check, masterclass = registration, call = discovery booking, bio = link-in-bio" },
  { key: "url", label: "Custom address", type: "url", show: (d) => d.target === "custom" },
];

export default function GrowthLinks() {
  const { g, ready, save } = useGrowthDoc();
  const links = useCollection("trackedLinks");
  const clicks = useCollection("linkClicks");
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  const [bio, setBio] = useState<{ headline: string; sub: string; buttons: { id: string; label: string; url: string }[] }>({ headline: "", sub: "", buttons: [] });
  useEffect(() => { if (g) setBio({ headline: g.bio?.headline || "", sub: g.bio?.sub || "", buttons: g.bio?.buttons || [] }); }, [g]);
  if (!ready) return <div className="h-40 animate-pulse rounded-lg bg-white" />;

  const base = origin();
  const cols: Col<Row>[] = [
    { key: "label", label: "Link", render: (r) => <div><p className="font-medium">{String(r.label)}</p><p className="text-[12.5px] text-[#6b6b7b]">{String(r.platform)}{r.campaign ? ` · ${r.campaign}` : ""}</p></div> },
    { key: "url", label: "Tracked address", render: (r) => <div className="flex items-center gap-2"><code className="text-[12.5px]">{base}/api/go/{String(r.code)}</code><Btn variant="outline" className="!h-7 !px-2 text-[12px]" onClick={() => copy(`${base}/api/go/${r.code}`)}>Copy</Btn></div> },
    { key: "to", label: "Goes to", render: (r) => String(r.target) },
    { key: "clicks", label: "Clicks", render: (r) => Number(r.clicks || 0), sort: (a, b) => Number(a.clicks || 0) - Number(b.clicks || 0) },
    { key: "a", label: "", render: (r) => <div className="flex gap-1.5"><Btn variant="outline" className="!h-8 !px-3 text-[13px]" onClick={() => setEdit(r)}>Edit</Btn><Btn variant="danger" className="!h-8 !px-3 text-[13px]" onClick={() => setDel(r)}>Delete</Btn></div> },
  ];
  const clickCount = (bid: string) => clicks.rows.filter((c) => c.linkId === `bio:${bid}`).length;
  const hook = `${base}/api/hooks/social-lead`;

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <Title sub="One link per platform and campaign. The source is saved on every lead it brings in." right={<Btn onClick={() => setEdit("new")}>+ New tracked link</Btn>}>Tracked links</Title>
        <div className="mt-3"><DataTable cols={cols} rows={links.rows} loading={links.loading} empty={<p className="py-8 text-center text-[#6b6b7b]">No tracked links yet. Create one per platform to see where leads come from.</p>} /></div>
      </Panel>

      <Section title="Link-in-bio page" sub={<>Public page: <a className="text-[#1677ff] underline" href={`/l/${g!.slug}`} target="_blank" rel="noreferrer">{base}/l/{g!.slug}</a>. Every button click is counted.</>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Headline"><input className={inputCls} value={bio.headline} onChange={(e) => setBio({ ...bio, headline: e.target.value })} /></Field>
          <Field label="One line under it"><input className={inputCls} value={bio.sub} onChange={(e) => setBio({ ...bio, sub: e.target.value })} /></Field>
        </div>
        <div className="mt-3 space-y-2">
          {bio.buttons.map((b, i) => (
            <div key={b.id} className="flex flex-wrap items-center gap-2">
              <input className={`${inputCls} !w-52`} placeholder="Button text" value={b.label} onChange={(e) => setBio({ ...bio, buttons: bio.buttons.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} />
              <input className={`${inputCls} min-w-0 flex-1`} placeholder="Address, e.g. /q/your-name or https://…" value={b.url} onChange={(e) => setBio({ ...bio, buttons: bio.buttons.map((x, k) => (k === i ? { ...x, url: e.target.value } : x)) })} />
              <span className="w-20 text-[13px] text-[#6b6b7b]">{clickCount(b.id)} clicks</span>
              <Btn variant="ghost" onClick={() => setBio({ ...bio, buttons: bio.buttons.filter((_, k) => k !== i) })}>✕</Btn>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn variant="soft" onClick={() => setBio({ ...bio, buttons: [...bio.buttons, { id: Math.random().toString(36).slice(2, 8), label: "", url: "" }] })}>+ Add button</Btn>
          <Btn variant="outline" onClick={() => setBio({ ...bio, buttons: [...bio.buttons, { id: Math.random().toString(36).slice(2, 8), label: "Take the Pattern Check", url: `/q/${g!.slug}` }, { id: Math.random().toString(36).slice(2, 8), label: "Join the free masterclass", url: `/m/${g!.slug}` }, { id: Math.random().toString(36).slice(2, 8), label: "Book a conversation", url: `/call/${g!.slug}` }] })}>Add the 3 funnel buttons</Btn>
          <Btn onClick={async () => { try { await save({ bio }); toast("Link-in-bio saved"); } catch (e) { toast((e as Error).message, "err"); } }}>Save</Btn>
        </div>
      </Section>

      <Section title="Comment-to-DM and click-to-WhatsApp" sub="Connect your comment-to-DM tool (ManyChat, WATI, Zapier, Make) to start the “Social lead” workflow.">
        <Note tone="blue">When someone comments your keyword, make your tool send a POST request to the address below with their WhatsApp number. They get the Pattern Check and masterclass links on WhatsApp. Messaging tool costs are billed to you by that provider.</Note>
        <div className="mt-3 space-y-2 text-[13px]">
          <p><b>Address:</b> <code>{hook}</code></p>
          <p><b>Body (JSON):</b> <code>{`{ "key": "${g!.hookKey}", "phone": "9876543210", "name": "Asha", "platform": "Instagram", "keyword": "ME" }`}</code></p>
          <p><b>Click-to-WhatsApp link:</b> <code>https://wa.me/91XXXXXXXXXX?text=ME</code> (use your WhatsApp Business number)</p>
          <div className="flex gap-2"><Btn variant="outline" onClick={() => copy(g!.hookKey || "", "Key")}>Copy key</Btn><Btn variant="outline" onClick={async () => { await api("/api/growth", "POST", { action: "rotate-hook" }); toast("New key created. Update your tool."); window.location.reload(); }}>Create a new key</Btn></div>
        </div>
      </Section>

      {edit && (
        <FormDrawer
          title={edit === "new" ? "New tracked link" : "Edit tracked link"}
          fields={FIELDS}
          initial={edit === "new" ? { target: "quiz", platform: "Instagram" } : edit}
          onSubmit={async (d) => { if (edit === "new") await links.create(d); else await links.update(edit.id, d); }}
          onClose={() => setEdit(null)}
        />
      )}
      {del && <Confirm title="Delete this link?" text="Clicks already counted stay in your reports, but this address will stop working." onOk={() => links.remove(del.id)} onClose={() => setDel(null)} />}
    </div>
  );
}
