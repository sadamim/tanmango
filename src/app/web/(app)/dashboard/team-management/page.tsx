"use client";
import { useState } from "react";
import { fmtDate, toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, EmptySearch, Gate, Panel, Pill, RowAction, Title, type Col } from "@/components/dash/kit";
import { FormDrawer } from "@/components/dash/forms";

const ROLES = ["Admin", "Moderator", "Content Manager", "Sales Manager", "Support"];
const ACCESS = ["Mangoes", "Products", "Sales", "Customers", "Marketing", "Automation", "Community"];

function Team() {
  const col = useCollection("team");
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  const cols: Col<Row>[] = [
    { key: "n", label: "Member", render: (r) => <div><p className="font-medium">{String(r.name)}</p><p className="text-[12px] text-[#6b6b7b]">{String(r.email)}</p></div> },
    { key: "role", label: "Role" },
    { key: "acc", label: "Access", render: (r) => <span className="text-[13px]">{((r.access as string[]) || []).join(", ") || "-"}</span> },
    { key: "s", label: "Status", render: (r) => <Pill tone={r.status === "Active" ? "green" : "orange"}>{String(r.status)}</Pill> },
    { key: "on", label: "Invited", render: (r) => fmtDate(r.createdAt) },
    { key: "a", label: "", render: (r) => <div className="flex justify-end gap-1.5">{r.status !== "Active" && <Btn variant="outline" className="h-8 px-3 text-[12px]" onClick={async () => { await col.update(r.id, { status: "Active" }); toast("Marked as joined"); }}>Mark joined</Btn>}<RowAction icon="edit" title="Edit" onClick={() => setEdit(r)} /><RowAction icon="trash" title="Remove" danger onClick={() => setDel(r)} /></div> },
  ];
  return (
    <Panel className="p-5">
      <Title sub="Invite people to help run your platform with role-based access." right={<Btn variant="black" icon="plus" onClick={() => setEdit("new")}>Invite member</Btn>}>Team Management</Title>
      <div className="mt-3"><DataTable cols={cols} rows={col.rows} loading={col.loading} empty={<EmptySearch title="No team members yet" />} /></div>
      {edit && (
        <FormDrawer
          title={edit === "new" ? "Invite team member" : "Edit team member"}
          fields={[
            { key: "name", label: "Name", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            { key: "role", label: "Role", type: "select", options: ROLES, required: true },
            { key: "access", label: "Can access", type: "multi", options: ACCESS, required: true },
          ]}
          initial={edit === "new" ? { role: "Moderator", access: ["Community"] } : edit}
          submitLabel={edit === "new" ? "Send invite" : "Save"}
          onClose={() => setEdit(null)}
          onSubmit={async (d) => {
            const email = String(d.email).toLowerCase();
            if (col.rows.some((m) => m.email === email && (edit === "new" || m.id !== edit.id))) return "This person is already on your team";
            if (edit === "new") await col.create({ ...d, email, status: "Invited" }); else await col.update(edit.id, { ...d, email });
            toast(edit === "new" ? "Invite recorded (no email is sent in this clone)" : "Member updated");
          }}
        />
      )}
      {del && <Confirm title="Remove team member?" text="They lose dashboard access immediately." okLabel="Remove" onOk={async () => { await col.remove(del.id); toast("Member removed"); }} onClose={() => setDel(null)} />}
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="team-management" title="Team Management"><Team /></Gate>;
}
