"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { copy, toast, useCollection, useMe, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, EmptySearch, Modal, Panel, Pill, RowAction, Title, Toggle, Walkthrough, type Col } from "@/components/dash/kit";
import { FormDrawer, type FieldDef } from "@/components/dash/forms";
import { Icon } from "@/components/dash/icons";
import { useMangoTitles } from "@/components/dash/hooks";
import { TEMPLATES, tpl, type Template } from "@/components/dash/templates";
import { isLocked } from "@/components/dash/nav";

function Thumb({ t }: { t: Template }) {
  return (
    <div className="aspect-[4/3] overflow-hidden rounded-md" style={{ background: t.bg, color: t.text }}>
      <div className={`flex h-full flex-col p-3 ${t.layout === "center" ? "items-center justify-center text-center" : "justify-center"}`}>
        <div className="h-1.5 w-10 rounded" style={{ background: t.accent, opacity: 0.9 }} />
        <p className="mt-2 text-[11px] font-bold leading-tight">How to Be Great</p>
        <p className="mt-1 text-[8px] opacity-80">A complete guide to great habits</p>
        <span className="mt-2 rounded px-2 py-0.5 text-[8px] font-semibold" style={{ background: t.accent, color: t.layout === "card" && t.text !== "#ffffff" ? "#fff" : "#111" }}>Join now</span>
      </div>
    </div>
  );
}

function Inner() {
  const { me } = useMe();
  const col = useCollection("pages");
  const mangoes = useMangoTitles();
  const params = useSearchParams();
  const [more, setMore] = useState(false);
  const [preview, setPreview] = useState<Template | null>(null);
  const [edit, setEdit] = useState<Row | { template: string } | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  useEffect(() => { if (params.get("new") === "1") setEdit({ template: "sunrise" }); }, [params]);
  const premiumLocked = isLocked("landing-page", me.plan);

  const fields: FieldDef[] = [
    { key: "mango", label: "Mango", type: "select", options: mangoes, required: true, hint: mangoes.length ? undefined : "Create a mango first" },
    { key: "title", label: "Page title", required: true, maxLength: 80 },
    { key: "slug", label: "Page link", required: true, placeholder: "my-workshop", hint: "Your page will be live at /p/<link>" },
    { key: "template", label: "Design", type: "select", options: TEMPLATES.filter((t) => !t.premium || !premiumLocked).map((t) => t.id) },
    { key: "headline", label: "Headline", required: true, placeholder: "Learn X in 30 days" },
    { key: "subheadline", label: "Sub-headline", type: "textarea" },
    { key: "bullets", label: "What they'll get (one per line)", type: "textarea" },
    { key: "leadForm", label: "Collect leads (show a “Get details” form)", type: "toggle" },
    { key: "published", label: "Published", type: "toggle" },
  ];

  const cols: Col<Row>[] = [
    { key: "mango", label: "Mango" },
    { key: "link", label: "Link", render: (r) => <button className="max-w-[260px] truncate text-[#1677ff] hover:underline" onClick={() => copy(`${location.origin}/p/${r.slug}`)}>/p/{String(r.slug)}</button> },
    { key: "title", label: "Page Title", render: (r) => <span className="font-medium">{String(r.title)}</span> },
    { key: "status", label: "Status", render: (r) => <Toggle on={Boolean(r.published)} onChange={async (v) => { await col.update(r.id, { published: v }); toast(v ? "Page published" : "Page unpublished"); }} label="Published" /> },
    { key: "a", label: "Actions", render: (r) => <div className="flex gap-1.5"><RowAction icon="eye" title="Open page" href={`/p/${r.slug}`} /><RowAction icon="edit" title="Edit" onClick={() => setEdit(r)} /><RowAction icon="trash" title="Delete" danger onClick={() => setDel(r)} /></div> },
  ];

  return (
    <>
      <Walkthrough title="Create a mango page" />
      <Panel className="p-5">
        <Title right={<Btn variant="soft" icon="refresh" onClick={() => col.reload()} aria-label="Refresh" />}>Templates</Title>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {(more ? TEMPLATES : TEMPLATES.slice(0, 4)).map((t) => {
            const locked = t.premium && premiumLocked;
            return (
              <div key={t.id} className="group relative rounded-[10px] border border-[#ededed] p-2">
                <Thumb t={t} />
                <div className="absolute left-3 top-3 flex gap-1">{t.premium && <Pill tone="orange">Premium</Pill>}{t.isNew && <Pill tone="green">New</Pill>}</div>
                <p className="mt-2 px-1 text-[13px] font-medium">{t.name}</p>
                <div className="mt-2 flex gap-1.5 px-1 pb-1">
                  <Btn className="h-8 flex-1 px-2 text-[12px]" disabled={locked} onClick={() => setEdit({ template: t.id })}>{locked ? <><Icon name="lock" className="h-3.5 w-3.5" />Pro</> : "Select design"}</Btn>
                  <Btn variant="outline" className="h-8 px-2 text-[12px]" onClick={() => setPreview(t)}>Preview</Btn>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-center"><Btn variant="soft" onClick={() => setMore(!more)}>{more ? "View Less" : "View More"}</Btn></div>
      </Panel>
      <Panel className="mt-5 p-5" delay={0.06}>
        <Title right={<Btn icon="plus" onClick={() => setEdit({ template: "sunrise" })}>Create new mango page</Btn>}>Mango Pages</Title>
        <div className="mt-3">
          <DataTable cols={cols} rows={col.rows} loading={col.loading} empty={<EmptySearch title="Create your first Mango Page" text="Mango pages are landing pages you can create by choosing a template or starting afresh!" />} />
        </div>
      </Panel>
      {preview && (
        <Modal title={`Preview — ${preview.name}`} onClose={() => setPreview(null)} wide>
          <div className="mx-auto max-w-md"><Thumb t={preview} /></div>
        </Modal>
      )}
      {edit && (
        <FormDrawer
          title={"id" in edit ? "Edit mango page" : "Create mango page"}
          fields={fields}
          initial={{ published: true, ...edit }}
          submitLabel="Save"
          onClose={() => setEdit(null)}
          intro={<div className="max-w-[220px]"><Thumb t={tpl(edit.template)} /></div>}
          onSubmit={async (d) => {
            const slug = String(d.slug).toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
            if (!slug) return "Enter a valid page link (letters, numbers and dashes)";
            const res = await fetch(`/api/data/pages`).then((r) => r.json());
            if ((res.rows as Row[]).some((p) => p.slug === slug && p.id !== ("id" in edit ? edit.id : ""))) return "That link is already used by another page";
            if ("id" in edit) await col.update(edit.id as string, { ...d, slug });
            else await col.create({ ...d, slug });
            toast("Mango page saved");
          }}
        />
      )}
      {del && <Confirm title="Delete mango page?" text="The public link will stop working." onOk={async () => { await col.remove(del.id); toast("Page deleted"); }} onClose={() => setDel(null)} />}
    </>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
