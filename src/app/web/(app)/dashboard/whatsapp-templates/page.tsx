"use client";
import { useState } from "react";
import { toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, EmptySearch, Gate, Panel, Pill, RowAction, Title, type Col } from "@/components/dash/kit";
import { FormDrawer } from "@/components/dash/forms";

function Templates() {
  const col = useCollection("waTemplates");
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  const cols: Col<Row>[] = [
    { key: "name", label: "Template", render: (r) => <div><p className="font-medium">{String(r.name)}</p><p className="max-w-md truncate text-[12px] text-[#6b6b7b]">{String(r.body)}</p></div> },
    { key: "category", label: "Category" },
    { key: "language", label: "Language" },
    { key: "status", label: "Status", render: (r) => <Pill tone={r.status === "Approved" ? "green" : "orange"}>{String(r.status)}</Pill> },
    { key: "a", label: "", render: (r) => <div className="flex justify-end gap-1.5"><RowAction icon="edit" title="Edit" onClick={() => setEdit(r)} /><RowAction icon="trash" title="Delete" danger onClick={() => setDel(r)} /></div> },
  ];
  return (
    <Panel className="p-5">
      <Title sub="Message templates used by WhatsApp broadcasts and automations." right={<Btn variant="black" icon="plus" onClick={() => setEdit("new")}>Create template</Btn>}>Templates</Title>
      <div className="mt-3"><DataTable cols={cols} rows={col.rows} loading={col.loading} empty={<EmptySearch title="No templates yet" text="Create a template, then map it to an event in Events Personalisation." />} /></div>
      {edit && (
        <FormDrawer
          title={edit === "new" ? "Create WhatsApp template" : "Edit WhatsApp template"}
          fields={[
            { key: "name", label: "Template name", required: true, hint: "Lowercase letters, numbers and underscores (e.g. workshop_reminder)" },
            { key: "category", label: "Category", type: "select", options: ["Utility", "Marketing", "Authentication"], required: true },
            { key: "language", label: "Language", type: "select", options: ["English", "Hindi", "Tamil", "Telugu", "Marathi"], required: true },
            { key: "body", label: "Message", type: "textarea", required: true, maxLength: 1024, hint: "Variables: {{1}} name, {{2}} mango/workshop, {{3}} link" },
          ]}
          initial={edit === "new" ? { category: "Utility", language: "English" } : edit}
          onClose={() => setEdit(null)}
          onSubmit={async (d) => {
            if (!/^[a-z0-9_]+$/.test(String(d.name))) return "Template name: lowercase letters, numbers and underscores only";
            // No WhatsApp provider is connected, so templates are auto-approved locally.
            const data = { ...d, status: "Approved" };
            if (edit === "new") await col.create(data); else await col.update(edit.id, data);
            toast("Template saved");
          }}
        />
      )}
      {del && <Confirm title="Delete template?" text="Events mapped to it will stop sending." onOk={async () => { await col.remove(del.id); toast("Template deleted"); }} onClose={() => setDel(null)} />}
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="whatsapp-templates" title="Templates"><Templates /></Gate>;
}
