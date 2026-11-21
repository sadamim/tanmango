import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { id as newId, now, store } from "@/lib/db";
import { alertCoach, getGrowth, mark } from "@/lib/growth/core";
import type { Lead } from "@/lib/growth/model";

const bad = (m: string, status = 400) => NextResponse.json({ error: m }, { status });

/** The learner's portal: whatever coach enrolled this email. Paused enrolments (e.g. refunded) have no access. */
async function load(email: string, coach?: string) {
  const all = (await store.find("enrolments", [["email", email.toLowerCase()]])).filter((x) => x.status !== "paused");
  const e = (coach ? all.find((x) => x.userId === coach) : all[0]) || null;
  return { e, all };
}

export async function GET(req: Request) {
  const me = await currentUser();
  if (!me) return bad("Not logged in", 401);
  const { e } = await load(me.email, new URL(req.url).searchParams.get("c") || undefined);
  if (!e) return NextResponse.json({ enrolled: false, name: me.name });
  const cid = String(e.userId);
  const [g, coach, lessons, classes, assignments, subs, updates] = await Promise.all([
    getGrowth(cid), store.get("users", cid),
    store.find("lessons", [["userId", cid]]), store.find("classes", [["userId", cid]]), store.find("assignments", [["userId", cid]]),
    store.find("submissions", [["userId", cid], ["email", me.email.toLowerCase()]]), store.find("updates", [["userId", cid]]),
  ]);
  const byWeek = (a: Record<string, unknown>, b: Record<string, unknown>) => Number(a.week || 0) - Number(b.week || 0) || String(a.createdAt).localeCompare(String(b.createdAt));
  const done = (e.lessonsDone as string[]) || [];
  const submitted = new Set(subs.map((s) => String(s.assignmentId)));
  const total = lessons.length + assignments.length;
  const completeCount = lessons.filter((l) => done.includes(l.id)).length + assignments.filter((a) => submitted.has(a.id)).length;
  return NextResponse.json({
    enrolled: true,
    coach: String(g?.coachName || (coach as { name?: string } | null)?.name || "Your coach"),
    programme: g?.programme || "The programme",
    kickoff: g?.kickoff || "",
    boundaryLine: g?.boundaryLine || "",
    referralLine: g?.referralLine || "",
    quizLink: g ? `/q/${g.slug}` : "",
    enrolment: { id: e.id, name: e.name, email: e.email, phone: e.phone, lessonsDone: done, attended: e.attended || [], missed: e.missed || [] },
    progress: total ? Math.round((completeCount / total) * 100) : 0,
    completed: total > 0 && completeCount === total,
    lessons: lessons.sort(byWeek).map((l) => ({ id: l.id, week: l.week, title: l.title, body: l.body, videoUrl: l.videoUrl, fileUrl: l.fileUrl })),
    classes: classes.sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt))).map((c) => ({ id: c.id, week: c.week, title: c.title, startsAt: c.startsAt, joinLink: c.joinLink, recordingUrl: c.recordingUrl, attended: ((e.attended as string[]) || []).includes(c.id) })),
    assignments: assignments.sort(byWeek).map((a) => ({ id: a.id, week: a.week, title: a.title, brief: a.brief, dueAt: a.dueAt, submission: subs.find((s) => s.assignmentId === a.id) || null })),
    updates: updates.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 20).map((u) => ({ id: u.id, title: u.title, body: u.body, createdAt: u.createdAt })),
  });
}

export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return bad("Not logged in", 401);
  const body = await req.json().catch(() => ({}));
  const { e } = await load(me.email);
  if (!e) return bad("You aren't enrolled in a programme yet", 403);
  const cid = String(e.userId);
  const email = me.email.toLowerCase();

  if (body.action === "lesson") {
    const l = await store.get("lessons", String(body.lessonId || ""));
    if (!l || l.userId !== cid) return bad("Not found", 404);
    const set = new Set<string>((e.lessonsDone as string[]) || []);
    if (body.done === false) set.delete(l.id);
    else set.add(l.id);
    await store.write([{ type: "update", coll: "enrolments", id: e.id, patch: { lessonsDone: [...set] } }]);
  } else if (body.action === "submit") {
    const a = await store.get("assignments", String(body.assignmentId || ""));
    if (!a || a.userId !== cid) return bad("Not found", 404);
    const text = String(body.text || "").trim().slice(0, 10000);
    const link = String(body.link || "").trim().slice(0, 400);
    if (!text && !link) return bad("Write your answer or add a link");
    if (link && !/^https?:\/\//.test(link)) return bad("Links must start with http");
    const [prev] = await store.find("submissions", [["userId", cid], ["assignmentId", a.id], ["email", email]], { limit: 1 });
    if (prev?.feedback) return bad("This was already reviewed. Ask your coach if you need to resubmit.");
    if (prev) await store.write([{ type: "update", coll: "submissions", id: prev.id, patch: { text, link, updatedAt: now() } }]);
    else await store.write([{ type: "set", coll: "submissions", id: newId(), data: { userId: cid, createdAt: now(), assignmentId: a.id, assignment: a.title, enrolmentId: e.id, email, name: e.name, text, link, status: "Submitted", feedback: "" } }]);
    await alertCoach(cid, `${e.name} submitted “${a.title}”.`);
  } else return bad("Unknown action");

  // completion = every lesson done and every assignment submitted
  const [lessons, assignments, subs, fresh] = await Promise.all([
    store.find("lessons", [["userId", cid]]), store.find("assignments", [["userId", cid]]), store.find("submissions", [["userId", cid], ["email", email]]), store.get("enrolments", e.id),
  ]);
  const done = new Set<string>((fresh?.lessonsDone as string[]) || []);
  const all = lessons.length + assignments.length > 0 && lessons.every((l) => done.has(l.id)) && assignments.every((a) => subs.some((s) => s.assignmentId === a.id));
  if (all && e.leadId) {
    const lead = (await store.get("crm", String(e.leadId))) as unknown as Lead | null;
    if (lead) await mark(cid, lead.id, "completed");
  }
  return NextResponse.json({ ok: true });
}
