import "server-only";
import { store } from "../db";
import { activeLearners, recordMiss, sendNotice } from "./core";

type R = Record<string, unknown>;

/** Cohort announcement → every active learner. */
export async function announceUpdate(creatorId: string, row: R) {
  for (const l of await activeLearners(creatorId)) await sendNotice(creatorId, l, "announce", String(row.title), String(row.body), Number(row.week || 0));
}

/** The coach wrote feedback on a submission → tell that learner. */
export async function feedbackReady(creatorId: string, sub: R) {
  const learners = await activeLearners(creatorId);
  const l = learners.find((x) => x.email === sub.email);
  const a = sub.assignmentId ? await store.get("assignments", String(sub.assignmentId)) : null;
  if (l) await sendNotice(creatorId, l, "feedback", "Your feedback is ready", `Feedback on “${a?.title || "your assignment"}” is waiting in your portal.`, Number(a?.week || 0));
}

/** Scheduled: class reminders (next 24h), assignment due-soon (next 48h), assignments 3 days overdue → drop-off rescue. */
export async function runClassNotices() {
  const t = Date.now();
  let n = 0;
  for (const c of await store.find("classes")) {
    const start = new Date(String(c.startsAt)).getTime();
    if (c.reminded || !(start > t && start - t <= 864e5)) continue;
    await store.write([{ type: "update", coll: "classes", id: c.id, patch: { reminded: true } }]);
    const when = new Date(start).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
    for (const l of await activeLearners(String(c.userId))) n += (await sendNotice(String(c.userId), l, "class", `Class reminder: ${c.title}`, `${c.title} is on ${when} IST.\nJoin: ${c.joinLink || "the link in your portal"}`, Number(c.week || 0))) ? 1 : 0;
  }
  for (const a of await store.find("assignments")) {
    if (!a.dueAt) continue;
    const due = new Date(String(a.dueAt)).getTime();
    const subs = await store.find("submissions", [["userId", a.userId], ["assignmentId", a.id]]);
    const pending = async () => (await activeLearners(String(a.userId))).filter((l) => !subs.some((s) => s.email === l.email));
    if (!a.dueReminded && due > t && due - t <= 2 * 864e5) {
      await store.write([{ type: "update", coll: "assignments", id: a.id, patch: { dueReminded: true } }]);
      for (const l of await pending()) n += (await sendNotice(String(a.userId), l, "due", `Due soon: ${a.title}`, `“${a.title}” is due on ${new Date(due).toLocaleDateString("en-IN", { dateStyle: "medium" })}. Submit it in your portal.`, Number(a.week || 0))) ? 1 : 0;
    }
    if (!a.overdueHandled && t - due > 3 * 864e5) {
      await store.write([{ type: "update", coll: "assignments", id: a.id, patch: { overdueHandled: true } }]);
      for (const l of await pending()) await recordMiss(String(a.userId), String(l.id), "assignment", a.id);
    }
  }
  return n;
}
