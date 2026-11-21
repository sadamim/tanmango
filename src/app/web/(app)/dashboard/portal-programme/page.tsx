"use client";
import { useEffect, useState } from "react";
import { api, copy, fmtDateTime, toast, useCollection, type Row } from "@/lib/client";
import { Btn, Confirm, DataTable, Field, Modal, Note, Panel, Pill, Tabs, Title, areaCls, inputCls, type Col } from "@/components/dash/kit";
import { FormDrawer, type FieldDef } from "@/components/dash/forms";
import { Bar, Section, origin, useGrowthDoc } from "@/components/growth/shared";

const TABS = ["Learners", "Lessons", "Classes", "Assignments", "Submissions", "Announcements", "Settings"] as const;
type Tab = (typeof TABS)[number];
const WEEKS = ["1", "2", "3", "4", "5", "6"];
const toLocal = (iso?: unknown) => (iso ? new Date(String(iso)).toISOString().slice(0, 16) : "");

const LESSON: FieldDef[] = [
  { key: "week", label: "Week", type: "select", options: WEEKS, required: true },
  { key: "title", label: "Lesson title", required: true },
  { key: "body", label: "Notes", type: "textarea" },
  { key: "videoUrl", label: "Video link (private Vimeo / Bunny Stream)", type: "url", hint: "Recordings for paying learners stay private. Never use YouTube unlisted." },
  { key: "fileUrl", label: "Download link", type: "url" },
];
const CLASS: FieldDef[] = [
  { key: "week", label: "Week", type: "select", options: WEEKS },
  { key: "title", label: "Class title", required: true },
  { key: "startsAt", label: "Starts", type: "datetime-local", required: true },
  { key: "joinLink", label: "Live class link", type: "url", hint: "Leave empty to get a built-in video room automatically (when Metered is set up)." },
  { key: "recordingUrl", label: "Recording link (private)", type: "url" },
];
const ASSIGN: FieldDef[] = [
  { key: "week", label: "Week", type: "select", options: WEEKS, required: true },
  { key: "title", label: "Assignment title", required: true },
  { key: "brief", label: "Brief", type: "textarea" },
  { key: "dueAt", label: "Due", type: "datetime-local" },
];
const UPDATE: FieldDef[] = [
  { key: "title", label: "Title", required: true },
  { key: "body", label: "Message", type: "textarea", required: true, hint: "Sent by email to every active learner, and by WhatsApp to those who opted in." },
  { key: "week", label: "Week (optional)", type: "select", options: WEEKS },
];

function Feedback({ s, onClose, onSave }: { s: Row; onClose: () => void; onSave: (text: string) => Promise<void> }) {
  const [t, setT] = useState(String(s.feedback || ""));
  return (
    <Modal title={`${s.name}: ${s.assignment}`} onClose={onClose} wide>
      <div className="rounded border border-[#ededed] bg-[#fafafa] p-3 text-[14px] whitespace-pre-wrap">{String(s.text || "—")}</div>
      {s.link ? <p className="mt-2 text-[13px]"><a className="text-[#1677ff] underline" href={String(s.link)} target="_blank" rel="noreferrer">Attached link</a></p> : null}
      <Field label="Your feedback"><textarea className={`${areaCls} mt-1 min-h-28`} value={t} onChange={(e) => setT(e.target.value)} /></Field>
      <div className="mt-4 flex justify-end gap-2"><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn disabled={!t.trim()} onClick={async () => { await onSave(t); onClose(); }}>Send feedback</Btn></div>
    </Modal>
  );
}

function ClassAttendance({ c, learners, onClose }: { c: Row; learners: Row[]; onClose: () => void }) {
  const [on, setOn] = useState<string[]>(learners.filter((l) => ((l.attended as string[]) || []).includes(c.id)).map((l) => l.id));
  return (
    <Modal title={`Attendance: ${c.title}`} onClose={onClose}>
      <p className="mb-3 text-[13px] text-[#4a4a59]">Anyone not ticked gets a warm “we saved your seat” message with the replay. A second miss alerts you.</p>
      <div className="max-h-[50vh] overflow-y-auto rounded border border-[#ededed]">
        {learners.map((l) => <label key={l.id} className="flex items-center gap-3 border-b border-[#f3f3f3] px-3 py-2 text-[14px] last:border-0"><input type="checkbox" className="h-4 w-4 accent-[#f2962c]" checked={on.includes(l.id)} onChange={(e) => setOn(e.target.checked ? [...on, l.id] : on.filter((x) => x !== l.id))} />{String(l.name)}</label>)}
        {!learners.length && <p className="p-5 text-center text-[#6b6b7b]">No learners yet.</p>}
      </div>
      <div className="mt-4 flex justify-end gap-2"><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn disabled={!learners.length} onClick={async () => { await api("/api/growth", "POST", { action: "class-attendance", classId: c.id, present: on }); toast("Attendance saved"); onClose(); }}>Save</Btn></div>
    </Modal>
  );
}

export default function Portal() {
  const { g, ready, save } = useGrowthDoc();
  const [tab, setTab] = useState<Tab>("Learners");
  const enr = useCollection("enrolments");
  const lessons = useCollection("lessons");
  const classes = useCollection("classes");
  const asg = useCollection("assignments");
  const subs = useCollection("submissions");
  const ups = useCollection("updates");
  const mangoes = useCollection("mangoes");
  const [form, setForm] = useState<{ coll: "lessons" | "classes" | "assignments" | "updates"; row: Row | null } | null>(null);
  const [fb, setFb] = useState<Row | null>(null);
  const [att, setAtt] = useState<Row | null>(null);
  const [del, setDel] = useState<{ coll: string; row: Row } | null>(null);
  const [set, setSet] = useState<Record<string, string>>({});
  useEffect(() => { if (g) setSet({ programmeMango: g.programmeMango || "", kickoff: g.kickoff || "", callLink: g.callLink || "", boundaryLine: g.boundaryLine || "", referralLine: g.referralLine || "", replayHours: String(g.replayHours || 48) }); }, [g]);
  if (!ready) return <div className="h-40 animate-pulse rounded-lg bg-white" />;

  const colls = { lessons, classes, assignments: asg, updates: ups };
  const total = lessons.rows.length + asg.rows.length;
  // eslint-disable-next-line react/display-name
  const actions = (coll: "lessons" | "classes" | "assignments" | "updates", extra?: (r: Row) => React.ReactNode) => (r: Row) => (
    <div className="flex gap-1.5">{extra?.(r)}{coll !== "updates" && <Btn variant="outline" className="!h-8 !px-3 text-[13px]" onClick={() => setForm({ coll, row: r })}>Edit</Btn>}<Btn variant="danger" className="!h-8 !px-3 text-[13px]" onClick={() => setDel({ coll, row: r })}>Delete</Btn></div>
  );
  const byWeek = (a: Row, b: Row) => Number(a.week || 0) - Number(b.week || 0);

  const learnerCols: Col<Row>[] = [
    { key: "n", label: "Learner", render: (r) => <div><p className="font-medium">{String(r.name)}</p><p className="text-[12.5px] text-[#6b6b7b]">{String(r.email)}</p></div> },
    { key: "p", label: "Progress", render: (r) => { const done = ((r.lessonsDone as string[]) || []).filter((id) => lessons.rows.some((l) => l.id === id)).length + asg.rows.filter((a) => subs.rows.some((s) => s.assignmentId === a.id && s.email === r.email)).length; const p = total ? Math.round((done / total) * 100) : 0; return <div className="w-36"><Bar pct={p} /><span className="text-[12px] text-[#6b6b7b]">{p}%</span></div>; } },
    { key: "a", label: "Classes attended", render: (r) => `${((r.attended as string[]) || []).length} / ${classes.rows.length}` },
    { key: "m", label: "Missed", render: (r) => ((r.missed as string[]) || []).length || "—" },
    { key: "s", label: "Status", render: (r) => (r.status === "paused" ? <Pill tone="grey">Paused</Pill> : <Pill>Active</Pill>) },
    { key: "x", label: "", render: (r) => <div className="flex gap-1.5"><Btn variant="outline" className="!h-8 !px-3 text-[13px]" onClick={() => enr.update(r.id, { status: r.status === "paused" ? "active" : "paused" })}>{r.status === "paused" ? "Resume" : "Pause"}</Btn></div> },
  ];

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <Title sub="Learners sign in at the portal with the email they enrolled with (a code is sent to their email)." right={<Btn variant="outline" onClick={() => copy(`${origin()}/portal`)}>Copy portal link</Btn>}>Learning portal</Title>
        <div className="mt-3"><Tabs tabs={[...TABS]} value={tab} onChange={setTab} /></div>
      </Panel>

      {tab === "Learners" && <Panel className="p-5"><DataTable cols={learnerCols} rows={enr.rows} loading={enr.loading} empty={<p className="py-8 text-center text-[#6b6b7b]">No learners yet. They are added automatically when the programme payment succeeds, or when you mark a lead as paid.</p>} /></Panel>}

      {tab === "Lessons" && <Panel className="p-5"><Title right={<Btn onClick={() => setForm({ coll: "lessons", row: null })}>+ Add lesson</Btn>}>Lessons</Title><div className="mt-3"><DataTable cols={[{ key: "w", label: "Week", render: (r) => String(r.week) }, { key: "t", label: "Lesson", render: (r) => String(r.title) }, { key: "v", label: "Video", render: (r) => (r.videoUrl ? "Yes" : "—") }, { key: "a", label: "", render: actions("lessons") }]} rows={[...lessons.rows].sort(byWeek)} loading={lessons.loading} empty={<p className="py-8 text-center text-[#6b6b7b]">No lessons yet.</p>} /></div></Panel>}

      {tab === "Classes" && <Panel className="p-5"><Title right={<Btn onClick={() => setForm({ coll: "classes", row: null })}>+ Schedule class</Btn>}>Live classes</Title><div className="mt-3"><DataTable cols={[{ key: "t", label: "Class", render: (r) => <div><p className="font-medium">{String(r.title)}</p><p className="text-[12.5px] text-[#6b6b7b]">{fmtDateTime(String(r.startsAt))}</p></div> }, { key: "r", label: "Reminder", render: (r) => (r.reminded ? <Pill>Sent</Pill> : <Pill tone="grey">Scheduled</Pill>) }, { key: "a", label: "", render: actions("classes", (r) => <Btn variant="outline" className="!h-8 !px-3 text-[13px]" onClick={() => setAtt(r)}>Attendance</Btn>) }]} rows={classes.rows} loading={classes.loading} empty={<p className="py-8 text-center text-[#6b6b7b]">No classes scheduled.</p>} /></div></Panel>}

      {tab === "Assignments" && <Panel className="p-5"><Title right={<Btn onClick={() => setForm({ coll: "assignments", row: null })}>+ Add assignment</Btn>}>Assignments</Title><div className="mt-3"><DataTable cols={[{ key: "w", label: "Week", render: (r) => String(r.week) }, { key: "t", label: "Assignment", render: (r) => String(r.title) }, { key: "d", label: "Due", render: (r) => (r.dueAt ? fmtDateTime(String(r.dueAt)) : "—") }, { key: "s", label: "Submitted", render: (r) => `${subs.rows.filter((s) => s.assignmentId === r.id).length} / ${enr.rows.length}` }, { key: "a", label: "", render: actions("assignments") }]} rows={[...asg.rows].sort(byWeek)} loading={asg.loading} empty={<p className="py-8 text-center text-[#6b6b7b]">No assignments yet.</p>} /></div></Panel>}

      {tab === "Submissions" && <Panel className="p-5"><Title>Submissions</Title><div className="mt-3"><DataTable cols={[{ key: "n", label: "Learner", render: (r) => String(r.name) }, { key: "a", label: "Assignment", render: (r) => String(r.assignment) }, { key: "on", label: "Submitted", render: (r) => fmtDateTime(r.createdAt) }, { key: "s", label: "Status", render: (r) => (r.feedback ? <Pill>Reviewed</Pill> : <Pill tone="orange">Needs feedback</Pill>) }, { key: "x", label: "", render: (r) => <Btn variant="outline" className="!h-8 !px-3 text-[13px]" onClick={() => setFb(r)}>{r.feedback ? "View" : "Give feedback"}</Btn> }]} rows={subs.rows} loading={subs.loading} empty={<p className="py-8 text-center text-[#6b6b7b]">No submissions yet.</p>} /></div></Panel>}

      {tab === "Announcements" && <Panel className="p-5"><Title right={<Btn onClick={() => setForm({ coll: "updates", row: null })}>+ New announcement</Btn>}>Cohort announcements</Title><div className="mt-3"><DataTable cols={[{ key: "t", label: "Title", render: (r) => String(r.title) }, { key: "on", label: "Sent", render: (r) => fmtDateTime(r.createdAt) }, { key: "a", label: "", render: actions("updates") }]} rows={ups.rows} loading={ups.loading} empty={<p className="py-8 text-center text-[#6b6b7b]">No announcements yet.</p>} /></div></Panel>}

      {tab === "Settings" && (
        <Section title="Programme settings" sub="Used in every workflow message and in the learner portal.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Programme product" hint="Payment for this product enrols the learner, opens the portal and starts the welcome flow."><select className={inputCls} value={set.programmeMango || ""} onChange={(e) => setSet({ ...set, programmeMango: e.target.value })}><option value="">— none —</option>{mangoes.rows.map((m) => <option key={m.id} value={m.id}>{String(m.title)}</option>)}</select></Field>
            <Field label="Kick-off date (shown in welcome email)"><input className={inputCls} value={set.kickoff || ""} onChange={(e) => setSet({ ...set, kickoff: e.target.value })} placeholder="e.g. Monday 2 December" /></Field>
            <Field label="Default call link (Meet / Zoom)"><input className={inputCls} value={set.callLink || ""} onChange={(e) => setSet({ ...set, callLink: e.target.value })} /></Field>
            <Field label="Replay available for (hours)"><input className={inputCls} type="number" value={set.replayHours || ""} onChange={(e) => setSet({ ...set, replayHours: e.target.value })} /></Field>
            <Field label="Boundary line (added to exercise messages from Week 4)"><textarea className={`${areaCls} min-h-20`} value={set.boundaryLine || ""} onChange={(e) => setSet({ ...set, boundaryLine: e.target.value })} /></Field>
            <Field label="Referral pathway (added from Week 4)"><textarea className={`${areaCls} min-h-20`} value={set.referralLine || ""} onChange={(e) => setSet({ ...set, referralLine: e.target.value })} /></Field>
          </div>
          <div className="mt-3"><Note tone="yellow">Use your own exact wording for the boundary and referral lines. They are left empty until you add them.</Note></div>
          <div className="mt-4"><Btn onClick={async () => { try { await save({ ...set, replayHours: Number(set.replayHours) || 48 }); toast("Saved"); } catch (e) { toast((e as Error).message, "err"); } }}>Save</Btn></div>
        </Section>
      )}

      {form && (
        <FormDrawer
          title={form.row ? "Edit" : form.coll === "updates" ? "New announcement" : "Add"}
          fields={{ lessons: LESSON, classes: CLASS, assignments: ASSIGN, updates: UPDATE }[form.coll]}
          initial={form.row ? { ...form.row, ...(form.row.startsAt ? { startsAt: toLocal(form.row.startsAt) } : {}), ...(form.row.dueAt ? { dueAt: toLocal(form.row.dueAt) } : {}) } : form.coll === "classes" ? {} : {}}
          onSubmit={async (d) => {
            const body: Record<string, unknown> = { ...d };
            if (body.startsAt) body.startsAt = new Date(String(body.startsAt)).toISOString();
            if (body.dueAt) body.dueAt = new Date(String(body.dueAt)).toISOString();
            if (body.week) body.week = Number(body.week);
            const c = colls[form.coll];
            if (form.row) await c.update(form.row.id, body);
            else await c.create(body);
            if (form.coll === "updates") toast("Announcement sent");
          }}
          onClose={() => setForm(null)}
        />
      )}
      {fb && <Feedback s={fb} onClose={() => setFb(null)} onSave={async (t) => { await subs.update(fb.id, { feedback: t, status: "Reviewed" }); toast("Feedback sent"); }} />}
      {att && <ClassAttendance c={att} learners={enr.rows} onClose={() => setAtt(null)} />}
      {del && <Confirm title="Delete?" text="This can't be undone." onOk={async () => { await (colls as Record<string, { remove: (id: string) => Promise<void> }>)[del.coll].remove(del.row.id); }} onClose={() => setDel(null)} />}
    </div>
  );
}
