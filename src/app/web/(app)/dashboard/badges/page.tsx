"use client";
import { useState } from "react";
import { toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, EmptyBox, Gate, Panel, RowAction, Title } from "@/components/dash/kit";
import { FormDrawer } from "@/components/dash/forms";

const EMOJI = ["🏅", "🥇", "🔥", "🚀", "🌟", "💎", "🏆", "🎯", "🧠", "💪"];

function Badges() {
  const col = useCollection("badges");
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  const rows = [...col.rows].sort((a, b) => Number(a.threshold) - Number(b.threshold));
  return (
    <Panel className="p-5">
      <Title sub="Badges unlock automatically when members reach a points threshold." right={<Btn variant="black" icon="plus" onClick={() => setEdit("new")}>Create badge</Btn>}>Badges</Title>
      {rows.length === 0 && !col.loading ? <EmptyBox title="No badges yet" text="Create badges like “Rising Star – 100 pts” to reward progress." /> : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((b) => (
            <div key={b.id} className="rounded-[10px] border border-[#ededed] p-4 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full text-[32px]" style={{ background: `${String(b.color || "#f2962c")}22` }}>{String(b.icon || "🏅")}</div>
              <p className="mt-2 font-semibold">{String(b.name)}</p>
              <p className="text-[12px] text-[#6b6b7b]">{String(b.threshold)} points</p>
              {b.description ? <p className="mt-1 text-[12px] text-[#6b6b7b]">{String(b.description)}</p> : null}
              <div className="mt-3 flex justify-center gap-1.5"><RowAction icon="edit" title="Edit" onClick={() => setEdit(b)} /><RowAction icon="trash" title="Delete" danger onClick={() => setDel(b)} /></div>
            </div>
          ))}
        </div>
      )}
      {edit && (
        <FormDrawer
          title={edit === "new" ? "Create badge" : "Edit badge"}
          fields={[
            { key: "name", label: "Badge name", required: true, maxLength: 30 },
            { key: "icon", label: "Icon", type: "select", options: EMOJI, required: true },
            { key: "threshold", label: "Points needed", type: "number", min: 1, required: true },
            { key: "color", label: "Colour", type: "color" },
            { key: "description", label: "Description", type: "textarea" },
          ]}
          initial={edit === "new" ? { icon: "🏅", color: "#f2962c", threshold: 100 } : edit}
          onClose={() => setEdit(null)}
          onSubmit={async (d) => {
            if (col.rows.some((b) => Number(b.threshold) === Number(d.threshold) && (edit === "new" || b.id !== edit.id))) return "Another badge already uses that threshold";
            if (edit === "new") await col.create(d); else await col.update(edit.id, d);
            toast("Badge saved");
          }}
        />
      )}
      {del && <Confirm title="Delete badge?" text="Members who earned it will no longer see it." onOk={async () => { await col.remove(del.id); toast("Badge deleted"); }} onClose={() => setDel(null)} />}
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="badges" title="Badges"><Badges /></Gate>;
}
