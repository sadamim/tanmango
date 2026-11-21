"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { copy, fmtDate, inr, toast, useCollection, useMe, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, EmptySearch, Field, Panel, Pill, RowAction, Search, Title, Toggle, Updated, Walkthrough, areaCls, inputCls, type Col } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";
import { useCustomers } from "@/components/dash/hooks";

type M = Record<string, unknown>;
const TABS = ["Mango details", "Payment details", "Payment success page"] as const;

function Phone({ m, tab }: { m: M; tab: (typeof TABS)[number] }) {
  const { me } = useMe();
  const price = m.type === "Free" ? 0 : Number(m.discountPrice || m.price || 0);
  return (
    <div className="mx-auto w-[300px] rounded-[42px] border-[10px] border-[#1d1d1d] bg-white shadow-2xl">
      <div className="mx-auto mt-1 h-5 w-24 rounded-b-xl bg-[#1d1d1d]" />
      <div className="flex h-[540px] flex-col overflow-hidden px-4 pb-0 pt-3 text-[12px]">
        {tab === "Payment success page" ? (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto mt-4 grid h-12 w-12 place-items-center rounded-full bg-[#2e9e4f] text-white"><Icon name="check" className="h-6 w-6" /></div>
            <p className="mt-2 text-center text-[15px] font-semibold">Payment Successful</p>
            <p className="text-center text-[18px] font-bold">{inr(price)}</p>
            <div className="mt-3 space-y-1.5 rounded-lg bg-[#f7f7f8] p-3">
              {[["Transaction ID", "0987654321"], ["Service", String(m.title || "—")], ["Payment Method", "UPI"], ["Payment Time", new Date().toLocaleString("en-IN")]].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><span className="text-[#6b6b7b]">{k}</span><b className="truncate">{v}</b></div>)}
            </div>
            {m.successText ? <p className="mt-3 whitespace-pre-wrap rounded-lg border border-[#ededed] p-3">{String(m.successText)}</p> : null}
            <button className="mt-4 w-full rounded-md bg-[#f2962c] py-2 font-semibold text-white">{String(m.successButton || "Login Now")}</button>
          </div>
        ) : tab === "Payment details" ? (
          <div className="flex-1 overflow-y-auto">
            <p className="mt-3 text-[15px] font-semibold">Payment Details</p>
            <p className="text-[#6b6b7b]">Complete your payment by providing your payment details.</p>
            <div className="mt-3 space-y-2">
              {["Name", "Email", "Phone", ...((m.customFields as string[]) || [])].map((f) => <div key={f} className="rounded-md border border-[#e1e1e1] px-2.5 py-2 text-[#9b9bab]">{f}</div>)}
            </div>
            {m.terms ? <p className="mt-2 text-[10px] text-[#6b6b7b]">☑ I agree to the Terms &amp; Conditions</p> : null}
            <p className="mt-3 text-[#1677ff]">Have a coupon?</p>
            <button className="mt-3 w-full rounded-md bg-[#f2962c] py-2 font-semibold text-white">Proceed to pay {inr(price)}</button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/^https?:\/\//.test(String(m.cover || "")) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(m.cover)} alt="" className="aspect-video w-full rounded-lg object-cover" />
            ) : (
              <div className="grid aspect-video w-full place-items-center rounded-lg bg-[#f7f7f8]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#f2962c] text-white"><Icon name="mangoes" className="h-5 w-5" /></span></div>
            )}
            <p className="mt-2 text-[#6b6b7b]">by <b className="text-[#0f0f0f]">{me.name}</b></p>
            <p className="mt-1 text-[16px] font-semibold">{String(m.title || "")}</p>
            <p className="mt-1 whitespace-pre-wrap text-[#4a4a59]">{String(m.description || "")}</p>
            <p className="mt-4 text-[10px] text-[#9b9bab]">You agree to share information entered on this page with TagMango (owner of this page) and Razorpay, adhering to applicable laws.</p>
            <p className="mt-2 text-[10px] text-[#9b9bab]">TagMango {new Date().getFullYear()}. · Privacy · Terms</p>
          </div>
        )}
        {tab === "Mango details" && (
          <div className="-mx-4 flex items-center justify-between border-t border-[#ededed] px-4 py-3">
            <div>
              <b className="text-[15px]">{inr(price)}</b>
              {m.discountPrice && m.price && Number(m.discountPrice) < Number(m.price) ? <s className="ml-1 text-[#9b9bab]">{inr(Number(m.price))}</s> : null}
              {m.type === "Subscription" && <span className="block text-[10px] text-[#6b6b7b]">/{String(m.cycle || "Monthly").toLowerCase()}</span>}
            </div>
            <span className="rounded-md bg-[#f2962c] px-6 py-2 font-semibold text-white">Buy Now</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Editor({ initial, onClose }: { initial?: Row; onClose: () => void }) {
  const col = useCollection("mangoes");
  const { me } = useMe();
  const [m, setM] = useState<M>(() => ({ type: "One-time", cycle: "Monthly", currency: "INR", active: true, customFields: [], successButton: "Login Now", ...initial }));
  const [tab, setTab] = useState<(typeof TABS)[number]>("Mango details");
  const [busy, setBusy] = useState(false);
  const [newField, setNewField] = useState("");
  const set = (k: string, v: unknown) => setM((x) => ({ ...x, [k]: v }));

  async function save() {
    const title = String(m.title || "").trim();
    if (!title) return toast("Mango title is required", "err");
    if (m.type !== "Free") {
      const p = Number(m.price);
      if (!p || p <= 0) return toast("Enter a selling price above ₹0, or choose Free mango", "err");
      if (m.discountPrice && Number(m.discountPrice) >= p) return toast("Discounted price must be lower than the selling price", "err");
    }
    if (m.redirectUrl && !/^https?:\/\//.test(String(m.redirectUrl))) return toast("Redirect URL must start with http(s)://", "err");
    if (m.cover && !/^https?:\/\//.test(String(m.cover))) return toast("Mango cover must be an image URL starting with http(s)://", "err");
    const dup = col.rows.some((r) => String(r.title).toLowerCase() === title.toLowerCase() && r.id !== initial?.id);
    if (dup) return toast("A mango with this title already exists", "err");
    setBusy(true);
    try {
      const data = { ...m, title, price: m.type === "Free" ? 0 : Number(m.price), discountPrice: m.discountPrice ? Number(m.discountPrice) : null };
      if (initial) await col.update(initial.id, data);
      else await col.create(data);
      toast(initial ? "Mango updated" : "Mango created");
      onClose();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-[#f7f7f8]">
      <div className="flex h-[60px] items-center gap-3 border-b border-[#ededed] bg-white px-5">
        <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full hover:bg-black/5"><Icon name="close" className="h-5 w-5" /></button>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#dcdcdc]"><Icon name="user" className="mt-1.5 h-7 w-7 text-white" /></span>
        <div className="flex-1"><p className="text-[11px] text-[#6b6b7b]">{me.name}</p><p className="text-[17px] font-semibold">{initial ? "Edit mango" : "Create mango"}</p></div>
        <Btn onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Btn>
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_460px]">
        <div className="min-h-0 overflow-y-auto p-5">
          <Walkthrough title={tab === "Payment success page" ? "Custom thank you page" : "Set-up your offering"} />
          <div className="mb-4 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex h-9 items-center gap-1.5 rounded-md border px-3 text-[13px] transition ${tab === t ? "border-[#0f0f0f] bg-[#0f0f0f] text-white" : "border-[#e1e1e1] bg-white text-[#4a4a59]"}`}>
                <Icon name={t === "Mango details" ? "mangoes" : t === "Payment details" ? "billing" : "check"} className="h-4 w-4" />{t}
              </button>
            ))}
          </div>
          {tab === "Mango details" && (
            <div className="animate-soft-fade space-y-4 rounded-[10px] border border-[#ededed] bg-white p-5">
              <div className="relative"><input className={inputCls} placeholder="Mango title" maxLength={100} value={String(m.title || "")} onChange={(e) => set("title", e.target.value)} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9b9bab]">{String(m.title || "").length} / 100</span></div>
              <Field label="Mango cover" hint="Images should be horizontal, at least 1280x720px. Paste an image URL (or upload one in Settings › TagMango Cloud).">
                <input className={inputCls} placeholder="https://…/cover.jpg" value={String(m.cover || "")} onChange={(e) => set("cover", e.target.value)} />
              </Field>
              <Field label="Mango description"><textarea className={`${areaCls} min-h-32`} placeholder="Add Mango description here..." value={String(m.description || "")} onChange={(e) => set("description", e.target.value)} /></Field>
              <Field label="Mango type">
                <div className="flex flex-wrap gap-2">
                  {["One-time", "Subscription", "Free"].map((t) => (
                    <button key={t} type="button" onClick={() => set("type", t)} className={`h-9 rounded-md border px-4 text-[13px] ${m.type === t ? "border-[#0f0f0f] bg-[#0f0f0f] text-white" : "border-[#e1e1e1] text-[#4a4a59]"}`}>{t === "Free" ? "Free mango" : t}</button>
                  ))}
                </div>
              </Field>
              {m.type === "Subscription" && (
                <Field label="Billing cycle"><select className={inputCls} value={String(m.cycle)} onChange={(e) => set("cycle", e.target.value)}>{["Monthly", "Quarterly", "Half-yearly", "Yearly"].map((c) => <option key={c}>{c}</option>)}</select></Field>
              )}
              {m.type !== "Free" && (
                <Field label="Pricing">
                  <div className="grid grid-cols-[100px_1fr_1fr] gap-2">
                    <select className={inputCls} value="INR" onChange={() => {}}><option>INR</option></select>
                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b7b]">₹</span><input type="number" min={1} className={`${inputCls} pl-7`} placeholder="Selling price" value={String(m.price ?? "")} onChange={(e) => set("price", e.target.value)} /></div>
                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b7b]">₹</span><input type="number" min={1} className={`${inputCls} pl-7`} placeholder="Discounted price" value={String(m.discountPrice ?? "")} onChange={(e) => set("discountPrice", e.target.value)} /></div>
                  </div>
                </Field>
              )}
              <details className="rounded-md border border-[#ededed] px-3 py-2 text-[14px]">
                <summary className="cursor-pointer font-medium">Advanced Payment Options</summary>
                <div className="mt-3 space-y-3 pb-1">
                  <label className="flex items-center justify-between gap-3">Accept international payments<Toggle on={Boolean(m.international)} onChange={(v) => set("international", v)} /></label>
                  <label className="flex items-center justify-between gap-3">Active (visible &amp; purchasable)<Toggle on={Boolean(m.active)} onChange={(v) => set("active", v)} /></label>
                </div>
              </details>
            </div>
          )}
          {tab === "Payment details" && (
            <div className="animate-soft-fade space-y-4 rounded-[10px] border border-[#ededed] bg-white p-5">
              <Field label="Custom field" hint="Extra details you want buyers to fill at checkout.">
                <div className="flex gap-2"><input className={inputCls} placeholder="e.g. City" value={newField} onChange={(e) => setNewField(e.target.value)} /><Btn variant="black" type="button" onClick={() => { if (newField.trim()) { set("customFields", [...((m.customFields as string[]) || []), newField.trim()]); setNewField(""); } }}>Add field</Btn></div>
                <div className="mt-2 flex flex-wrap gap-2">{((m.customFields as string[]) || []).map((f) => <span key={f} className="inline-flex items-center gap-1 rounded-md bg-[#f2f2f2] px-2 py-1 text-[12px]">{f}<button aria-label={`Remove ${f}`} onClick={() => set("customFields", ((m.customFields as string[]) || []).filter((x) => x !== f))}>×</button></span>)}</div>
              </Field>
              <Field label={<span>Terms &amp; Conditions <span className="ml-1 rounded bg-[#f2962c] px-1.5 text-[9px] text-white">NEW</span></span>}><textarea className={`${areaCls} min-h-24`} placeholder="Buyers must accept these before paying (optional)" value={String(m.terms || "")} onChange={(e) => set("terms", e.target.value)} /></Field>
            </div>
          )}
          {tab === "Payment success page" && (
            <div className="animate-soft-fade space-y-4 rounded-[10px] border border-[#ededed] bg-white p-5">
              <Field label="Custom section"><textarea className={`${areaCls} min-h-24`} placeholder="Thank-you note, next steps, community link…" value={String(m.successText || "")} onChange={(e) => set("successText", e.target.value)} /></Field>
              <Field label="Customise button"><input className={inputCls} value={String(m.successButton || "")} onChange={(e) => set("successButton", e.target.value)} /></Field>
              <Field label="Redirect URL" hint="Send buyers here after payment (optional)."><input className={inputCls} placeholder="https://…" value={String(m.redirectUrl || "")} onChange={(e) => set("redirectUrl", e.target.value)} /></Field>
            </div>
          )}
        </div>
        <div className="hidden border-l border-[#ededed] bg-white py-8 lg:block"><Phone m={m} tab={tab} /></div>
      </div>
    </div>
  );
}

function Inner() {
  const col = useCollection("mangoes");
  const { list: customers } = useCustomers();
  const params = useSearchParams();
  const router = useRouter();
  const [showFree, setShowFree] = useState(false);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [del, setDel] = useState<Row | null>(null);

  useEffect(() => {
    if (params.get("newMangoform") === "true") setEdit("new");
  }, [params]);

  const rows = useMemo(() => col.rows.filter((m) => (showFree || m.type !== "Free") && String(m.title).toLowerCase().includes(q.toLowerCase())), [col.rows, showFree, q]);
  const activeUsers = (t: string) => customers.filter((c) => c.mango === t && c.status === "Active").length;
  const link = (r: Row) => `${location.origin}/checkout/${r.id}`;

  const cols: Col<Row>[] = [
    { key: "title", label: "Title", render: (r) => <div><p className="font-medium">{String(r.title)}</p><p className="text-[11px] text-[#9b9bab]">mango id: {r.id}</p></div>, sort: (a, b) => String(a.title).localeCompare(String(b.title)) },
    { key: "price", label: "Price", render: (r) => <div><p>{r.type === "Free" ? "Free" : <>₹ <b>{Number(r.discountPrice || r.price).toLocaleString("en-IN")}+</b></>}</p><p className="text-[11px] text-[#9b9bab]">{r.type === "Subscription" ? String(r.cycle || "monthly").toLowerCase() : r.type === "Free" ? "free" : "onetime"}</p></div>, sort: (a, b) => Number(a.price) - Number(b.price) },
    { key: "users", label: "Active Users", render: (r) => activeUsers(String(r.title)), sort: (a, b) => activeUsers(String(a.title)) - activeUsers(String(b.title)) },
    { key: "start", label: "Start Date", render: (r) => fmtDate(r.createdAt), sort: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { key: "status", label: "Status", render: (r) => <Pill tone={r.active ? "green" : "grey"}>{r.active ? "Active" : "Inactive"}</Pill> },
    {
      key: "actions",
      label: <span className="block text-right">Actions</span>,
      render: (r) => (
        <div className="flex justify-end gap-1.5">
          <RowAction icon="edit" title="Edit" onClick={() => setEdit(r)} />
          <RowAction icon="link" title="Copy checkout link" onClick={() => copy(link(r))} />
          <RowAction icon="eye" title="Preview checkout" href={`/checkout/${r.id}`} />
          <RowAction icon={r.active ? "close" : "check"} title={r.active ? "Deactivate" : "Activate"} onClick={async () => { await col.update(r.id, { active: !r.active }); toast(r.active ? "Mango deactivated" : "Mango activated"); }} />
          <RowAction icon="trash" title="Delete" danger onClick={() => setDel(r)} />
        </div>
      ),
    },
  ];

  return (
    <>
      <Walkthrough title="Mango flow" steps={[["What's a mango?", "A mango is a payment page on steroids — link workshops, courses and communities to it."], ["Create one", "Click “Create new mango”, set a title, price and type (one-time, subscription or free)."], ["Share", "Copy the checkout link from Actions, or build a Mango Page around it."]]} />
      <Panel className="p-5">
        <Title
          sub={<span className="flex items-center gap-2"><Toggle on={showFree} onChange={setShowFree} label="Show free mangoes" /> Show free mangoes</span>}
          right={<><Btn onClick={() => setEdit("new")} icon="plus">Create new mango</Btn><Btn variant="black" icon="refresh" onClick={() => col.reload()}>Refresh</Btn></>}
        >
          Mangoes
        </Title>
        <p className="mt-1 text-[12px] text-[#6b6b7b]"><Updated at={col.updatedAt} /></p>
        <div className="mt-4 flex"><Search value={q} onChange={setQ} placeholder="Search by mango title" /></div>
        <div className="mt-3">
          <DataTable cols={cols} rows={rows} loading={col.loading} empty={<EmptySearch title={q ? "No matching mangoes" : "No mangoes yet"} text={q ? "Try a different title." : "Create your first mango to start selling."} />} />
        </div>
      </Panel>
      {edit && <Editor initial={edit === "new" ? undefined : edit} onClose={() => { setEdit(null); if (params.get("newMangoform")) router.replace("/web/dashboard/mango-overview"); }} />}
      {del && <Confirm title="Delete mango?" text={<>This permanently deletes <b>{String(del.title)}</b>. Existing customers keep their order history.</>} onOk={async () => { await col.remove(del.id); toast("Mango deleted"); }} onClose={() => setDel(null)} />}
    </>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
