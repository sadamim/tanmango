"use client";
import { useState } from "react";
import { toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, EmptyBox, Gate, Panel, RowAction, Title, Toggle } from "@/components/dash/kit";
import { FormDrawer } from "@/components/dash/forms";

function Banners() {
  const col = useCollection("banners");
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  const rows = [...col.rows].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  return (
    <Panel className="p-5">
      <Title sub="Banners show at the top of your community feed." right={<Btn variant="black" icon="plus" onClick={() => setEdit("new")}>Create banner</Btn>}>Banners</Title>
      {rows.length === 0 && !col.loading ? <EmptyBox title="No banners yet" text="Promote a launch, an offer or a live session at the top of your feed." /> : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {rows.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-[10px] border border-[#ededed]">
              <div className="relative grid aspect-[3/1] place-items-center bg-gradient-to-r from-[#3a1606] to-[#f2962c] text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {b.image ? <img src={String(b.image)} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
                <p className="relative px-4 text-center text-[18px] font-bold drop-shadow">{String(b.title)}</p>
              </div>
              <div className="flex items-center gap-2 p-3 text-[13px]">
                <Toggle on={Boolean(b.active)} onChange={async (v) => { await col.update(b.id, { active: v }); toast(v ? "Banner shown" : "Banner hidden"); }} label="Active" />
                <span className="flex-1 truncate text-[#6b6b7b]">{b.link ? String(b.link) : "No link"} · order {String(b.order ?? 0)}</span>
                <RowAction icon="edit" title="Edit" onClick={() => setEdit(b)} />
                <RowAction icon="trash" title="Delete" danger onClick={() => setDel(b)} />
              </div>
            </div>
          ))}
        </div>
      )}
      {edit && (
        <FormDrawer
          title={edit === "new" ? "Create banner" : "Edit banner"}
          fields={[
            { key: "title", label: "Banner text", required: true, maxLength: 80 },
            { key: "image", label: "Image URL (1200×400)", type: "url" },
            { key: "link", label: "Click-through link", type: "url" },
            { key: "order", label: "Display order", type: "number", min: 0 },
            { key: "active", label: "Active", type: "toggle" },
          ]}
          initial={edit === "new" ? { active: true, order: rows.length } : edit}
          onClose={() => setEdit(null)}
          onSubmit={async (d) => { if (edit === "new") await col.create(d); else await col.update(edit.id, d); toast("Banner saved"); }}
        />
      )}
      {del && <Confirm title="Delete banner?" text="It will be removed from your feed." onOk={async () => { await col.remove(del.id); toast("Banner deleted"); }} onClose={() => setDel(null)} />}
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="feed-banners" title="Banners"><Banners /></Gate>;
}
