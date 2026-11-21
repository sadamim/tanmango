import "server-only";
import { asUser, id as newId, now, store, type User } from "../db";
import { sendEmail, sendWhatsApp } from "../messaging";
import {
  DEFAULT_CONSENT, DEFAULT_PATTERNS, DEFAULT_RULES, FLOW_BY_ID, MILESTONE_FLOW, fill,
  type FlowDef, type Lead, type Milestone, type Pattern, type QuizRules, type StepDef,
} from "./model";

export const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
const norm = (s: unknown) => String(s ?? "").trim().toLowerCase();
const phone10 = (p: unknown) => String(p ?? "").replace(/\D/g, "").slice(-10);
const IST = { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" } as const;
const when = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-IN", IST) + " IST" : "");

/* ------------------------------------------------------------------ coach settings (one `growth` doc per creator) */

export type Growth = {
  id: string;
  userId: string;
  slug: string;
  coachName?: string;
  programme?: string;
  tagline?: string;
  alertEmail?: string;
  alertWhatsapp?: string;
  programmeMango?: string;
  kickoff?: string;
  callLink?: string;
  boundaryLine?: string;
  referralLine?: string;
  consentLine?: string;
  replayHours?: number;
  quiz?: { patterns: Pattern[]; rules: QuizRules };
  resultEmails?: Record<string, { subject?: string; body?: string; pdfUrl?: string }>;
  bio?: { headline?: string; sub?: string; buttons?: { id: string; label: string; url: string }[] };
  hookKey?: string;
  lastReportWeek?: string;
  [k: string]: unknown;
};

export async function getGrowth(userId: string) {
  const [g] = await store.find("growth", [["userId", userId]], { limit: 1 });
  return (g as unknown as Growth) || null;
}
export async function growthBySlug(slug: string) {
  const [g] = await store.find("growth", [["slug", slug]], { limit: 1 });
  return (g as unknown as Growth) || null;
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "coach";

/** Create the creator's growth settings on first use, with sample Pattern Check content. */
export async function ensureGrowth(me: User): Promise<Growth> {
  const have = await getGrowth(me.id);
  if (have) return have;
  const base = slugify(me.name);
  let slug = base;
  for (let i = 2; await growthBySlug(slug); i++) slug = `${base}-${i}`;
  const gid = newId();
  const doc = {
    userId: me.id, createdAt: now(), slug, coachName: me.name, programme: "THE HUMAN OS™", tagline: "", alertEmail: me.email, alertWhatsapp: me.phone || "",
    consentLine: DEFAULT_CONSENT, replayHours: 48, hookKey: newId() + newId(),
    quiz: { patterns: DEFAULT_PATTERNS, rules: DEFAULT_RULES },
    bio: { headline: me.name, sub: "", buttons: [] as { id: string; label: string; url: string }[] },
  };
  await store.write([{ type: "set", coll: "growth", id: gid, data: doc }]);
  return { id: gid, ...doc } as Growth;
}

/** What visitors may see (no alert contacts, no webhook key). */
export const publicGrowth = (g: Growth) => ({
  slug: g.slug, coachName: g.coachName, programme: g.programme, tagline: g.tagline, consentLine: g.consentLine || DEFAULT_CONSENT,
  quiz: g.quiz, bio: g.bio, boundaryLine: g.boundaryLine,
});

/* ------------------------------------------------------------------ tracked links */

export async function sourceFor(creatorId: string, src?: string) {
  if (!src) return "direct";
  const [l] = await store.find("trackedLinks", [["code", src.slice(0, 40)]], { limit: 1 });
  if (!l || l.userId !== creatorId) return "direct";
  return `${l.platform || "Link"}${l.campaign ? ` · ${l.campaign}` : ""}`;
}

/* ------------------------------------------------------------------ leads */

export async function findLead(creatorId: string, email?: string, ph?: string) {
  if (email) {
    const [l] = await store.find("crm", [["userId", creatorId], ["email", norm(email)]], { limit: 1 });
    if (l) return l as unknown as Lead;
  }
  if (ph) {
    const [l] = await store.find("crm", [["userId", creatorId], ["phone", phone10(ph)]], { limit: 1 });
    if (l) return l as unknown as Lead;
  }
  return null;
}

type CaptureInput = { name?: string; email?: string; phone?: string; whatsappOptIn?: boolean; source?: string; consent?: boolean };

/**
 * One record per person per creator: matched by email, then WhatsApp number. Quiz answers, masterclass seats,
 * call bookings and payments all join the same record.
 */
export async function upsertLead(creatorId: string, i: CaptureInput): Promise<Lead> {
  const email = norm(i.email);
  const ph = phone10(i.phone);
  const lid = newId();
  return store.tx(async (t) => {
    let cur: Record<string, unknown> | undefined;
    if (email) [cur] = await t.find("crm", [["userId", creatorId], ["email", email]], { limit: 1 });
    if (!cur && ph) [cur] = await t.find("crm", [["userId", creatorId], ["phone", ph]], { limit: 1 });
    if (cur) {
      const patch: Record<string, unknown> = {};
      if (i.name && (!cur.name || cur.name === cur.email)) patch.name = i.name.trim().slice(0, 80);
      if (ph && !cur.phone) patch.phone = ph;
      if (email && !cur.email) patch.email = email;
      if (i.whatsappOptIn && !cur.whatsappOptIn) patch.whatsappOptIn = true;
      if (i.source && (!cur.source || cur.source === "direct")) patch.source = i.source;
      if (i.consent && !cur.consentAt) patch.consentAt = now();
      if (Object.keys(patch).length) t.update("crm", String(cur.id), patch);
      return { ...cur, ...patch } as unknown as Lead;
    }
    const lead = {
      userId: creatorId, createdAt: now(), name: (i.name || email || "Unknown").trim().slice(0, 80), email, phone: ph, whatsappOptIn: !!i.whatsappOptIn,
      source: i.source || "direct", m: {}, events: [{ at: now(), type: "created" }], ...(i.consent ? { consentAt: now() } : {}),
    };
    t.set("crm", lid, lead);
    return { id: lid, ...lead } as unknown as Lead;
  });
}

const IMPLIES_CAPTURE: Milestone[] = ["pattern", "mcRegistered", "callBooked", "enrolStarted", "paid"];

type MarkOpts = { detail?: string; eventAt?: string; ctxKey?: string; refire?: boolean; silent?: boolean; extra?: Record<string, string> };

/**
 * Record that a lead reached a milestone (once), log it, credit earlier messages that were waiting for it
 * ("acted on"), and start the workflow tied to it.
 */
export async function mark(creatorId: string, leadId: string, key: Milestone, o: MarkOpts = {}): Promise<boolean> {
  const out = await store.tx(async (t) => {
    const l = await t.get("crm", leadId);
    if (!l || l.userId !== creatorId) return null;
    const m = { ...((l.m as Lead["m"]) || {}) };
    if (m[key]) return { fresh: false, lead: l, implied: false };
    m[key] = now();
    // anything past "interested" means they gave their details
    const implied = IMPLIES_CAPTURE.includes(key) && !m.captured;
    if (implied) m.captured = now();
    const events = [...(((l.events as Lead["events"]) || []).slice(-199)), { at: now(), type: key, ...(o.detail ? { detail: o.detail } : {}) }];
    t.update("crm", leadId, { m, events });
    return { fresh: true, lead: { ...l, m, events }, implied };
  });
  if (!out) return false;
  const lead = out.lead as unknown as Lead;
  if (out.fresh) await creditActed(creatorId, leadId, key);
  if (out.fresh && out.implied) await creditActed(creatorId, leadId, "captured");
  const flowId = MILESTONE_FLOW[key];
  if (flowId && !o.silent && (out.fresh || o.refire)) await fireFlow(creatorId, flowId, lead, { eventAt: o.eventAt, key: o.ctxKey, extra: o.extra });
  return out.fresh;
}

async function creditActed(creatorId: string, leadId: string, key: Milestone) {
  const msgs = await store.find("msgLog", [["userId", creatorId], ["leadId", leadId]]);
  const ops = msgs.filter((x) => x.goal === key && !x.actedAt).map((x) => ({ type: "update" as const, coll: "msgLog", id: x.id, patch: { actedAt: now() } }));
  if (ops.length) await store.write(ops);
}

export async function logEvent(creatorId: string, leadId: string, type: string, detail?: string) {
  await store.tx(async (t) => {
    const l = await t.get("crm", leadId);
    if (!l || l.userId !== creatorId) return;
    t.update("crm", leadId, { events: [...(((l.events as Lead["events"]) || []).slice(-199)), { at: now(), type, ...(detail ? { detail } : {}) }] });
  });
}

/* ------------------------------------------------------------------ alerts to the coach */

export async function alertCoach(creatorId: string, text: string) {
  try {
    const [u, g] = await Promise.all([store.get("users", creatorId), getGrowth(creatorId)]);
    if (!u) return;
    const user = asUser(u);
    await store.write([{ type: "set", coll: "notifications", id: newId(), data: { userId: creatorId, createdAt: now(), read: false, text } }]);
    await sendEmail({ to: g?.alertEmail || user.email, subject: text.slice(0, 90), text: `${text}\n\nOpen your leads: ${appUrl()}/web/dashboard/growth-leads`, userId: creatorId, kind: "alert" });
    const wa = phone10(g?.alertWhatsapp);
    if (wa.length === 10) await sendWhatsApp(wa, text, creatorId);
  } catch {
    /* alerts must never break the action that triggered them */
  }
}

/* ------------------------------------------------------------------ workflows */

type FlowDoc = { id: string; flowId: string; enabled?: boolean; overrides?: Record<string, { subject?: string; body?: string; off?: boolean }> };
async function flowDoc(creatorId: string, flowId: string) {
  const [d] = await store.find("flows", [["userId", creatorId], ["flowId", flowId]], { limit: 1 });
  return (d as unknown as FlowDoc) || null;
}

type RunStep = { key: string; channel: "email" | "whatsapp"; dueAt: string; status: "pending" | "sent" | "skipped" | "stopped" | "failed"; note?: string };
type Run = { id: string; userId: string; leadId: string; flowId: string; key?: string; eventAt?: string; extra?: Record<string, string>; steps: RunStep[]; done: boolean; alerted?: boolean };

export async function fireFlow(creatorId: string, flowId: string, lead: Lead, ctx: { eventAt?: string; key?: string; extra?: Record<string, string> } = {}) {
  const def = FLOW_BY_ID[flowId];
  if (!def) return;
  const doc = await flowDoc(creatorId, flowId);
  if (doc?.enabled === false) return;
  if (def.sales && lead.m?.paid) return;
  if (def.stopOn.some((k) => lead.m?.[k])) return;
  const runs = await store.find("flowRuns", [["userId", creatorId], ["leadId", lead.id]]);
  if (runs.some((r) => r.flowId === flowId && (ctx.key ? r.key === ctx.key : !r.key && !r.done))) return;
  const t0 = Date.now();
  const steps: RunStep[] = [];
  for (const s of def.steps) {
    if (doc?.overrides?.[s.key]?.off) continue;
    let due: number;
    if (s.rel === "event") {
      if (!ctx.eventAt) continue;
      due = new Date(ctx.eventAt).getTime() + s.at * 60000;
      if (due < t0 - 60000) {
        steps.push({ key: s.key, channel: s.channel, dueAt: new Date(due).toISOString(), status: "skipped", note: "too late to send" });
        continue;
      }
    } else due = t0 + s.at * 60000;
    steps.push({ key: s.key, channel: s.channel, dueAt: new Date(due).toISOString(), status: "pending" });
  }
  if (!steps.length) return;
  const rid = newId();
  await store.write([{ type: "set", coll: "flowRuns", id: rid, data: { userId: creatorId, leadId: lead.id, flowId, key: ctx.key, eventAt: ctx.eventAt, extra: ctx.extra, createdAt: now(), steps, done: false } }]);
  await processRun(rid).catch(() => {});
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function toHtml(text: string, msgId: string, links: string[]) {
  const body = esc(text).replace(/https?:\/\/[^\s<]+/g, (u) => {
    const clean = u.replace(/[.,;)]+$/, "");
    const tail = u.slice(clean.length);
    const raw = clean.replace(/&amp;/g, "&");
    links.push(raw);
    return `<a href="${appUrl()}/api/t/c/${msgId}?u=${encodeURIComponent(raw)}">${clean}</a>${tail}`;
  });
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#222">${body.replace(/\n/g, "<br>")}<img src="${appUrl()}/api/t/o/${msgId}" width="1" height="1" alt="" style="display:none"></div>`;
}

type Ctx = { user: User; g: Growth; lead: Lead; run: Run };
export async function varsFor({ user, g, lead, run }: Ctx): Promise<Record<string, string>> {
  const base = appUrl();
  const first = (lead.name || "there").split(/\s+/)[0];
  const mcId = String(run.extra?.masterclassId || lead.masterclassId || "");
  const mc = mcId ? await store.get("masterclasses", mcId) : null;
  const pr = lead.pattern;
  const patterns = g.quiz?.patterns || [];
  const nameOf = (pid?: string) => patterns.find((p) => p.id === pid)?.name || "";
  const mango = g.programmeMango ? `${base}/checkout/${g.programmeMango}` : `${base}/call/${g.slug}`;
  const resultCfg = pr ? g.resultEmails?.[pr.primary] : undefined;
  return {
    name: lead.name, first, coach: g.coachName || user.name, programme: g.programme || "the programme",
    quiz_link: `${base}/q/${g.slug}`, mc_link: `${base}/m/${g.slug}`,
    book_link: `${base}/call/${g.slug}?e=${encodeURIComponent(lead.email)}`,
    enrol_link: mango, pay_link: mango, portal_link: `${base}/portal`, kickoff: g.kickoff || "to be announced",
    testimonial_link: `${base}/t/${g.slug}?l=${lead.id}`, result_link: `${base}/q/${g.slug}/r/${lead.id}`,
    replay_link: mcId ? `${base}/api/replay/${mcId}?l=${lead.id}` : `${base}/m/${g.slug}`,
    join_link: String(mc?.joinLink || `${base}/m/${g.slug}`), masterclass_title: String(mc?.title || "the free masterclass"),
    masterclass_time: when(mc?.startsAt as string | undefined) || "the scheduled time", seat: lead.seat ? `#${lead.seat}` : "reserved",
    call_time: when(lead.callAt) || "the scheduled time", call_link: lead.callLink || g.callLink || "the link in your calendar invite",
    pattern: nameOf(pr?.primary), pct: pr ? String(pr.pct[pr.primary] ?? "") : "",
    secondary_line: pr?.secondary ? ` You also show a strong thread of ${nameOf(pr.secondary)} (${pr.pct[pr.secondary]}%).` : "",
    pdf_line: resultCfg?.pdfUrl ? `\nYour PDF: ${resultCfg.pdfUrl}\n` : "", boundary: g.boundaryLine || "", referral: g.referralLine || "",
  };
}

/** Send one due step. Returns the step's new status. */
async function sendStep(c: Ctx, def: FlowDef, s: StepDef, ov: FlowDoc["overrides"]): Promise<{ status: RunStep["status"]; note?: string }> {
  const { user, g, lead } = c;
  const vars = await varsFor(c);
  const custom = ov?.[s.key];
  let subject = custom?.subject || s.subject || def.name;
  let body = custom?.body || s.body;
  if (s.key === "result" && def.id === "pattern_done" && lead.pattern) {
    const cfg = g.resultEmails?.[lead.pattern.primary];
    if (cfg?.subject && !custom?.subject) subject = cfg.subject;
    if (cfg?.body && !custom?.body) body = cfg.body;
  }
  subject = fill(subject, vars);
  body = fill(body, vars).replace(/\n{3,}/g, "\n\n");

  const msgId = newId();
  const log = { userId: user.id, leadId: lead.id, flowId: def.id, stepKey: s.key, channel: s.channel, goal: def.goal, createdAt: now(), to: s.channel === "email" ? lead.email : lead.phone, subject, links: [] as string[] };

  if (s.channel === "email") {
    if (!/^\S+@\S+\.\S+$/.test(lead.email || "")) return { status: "skipped", note: "no email" };
    const off = await store.find("unsubscribed", [["userId", user.id], ["email", lead.email]], { limit: 1 });
    if (off.length) return { status: "skipped", note: "unsubscribed" };
    const html = toHtml(body + `\n\n—\nTo stop these emails, reply "unsubscribe".`, msgId, log.links);
    const r = await sendEmail({ to: lead.email, subject, text: body, html, userId: user.id, kind: `flow:${def.id}`, fromName: g.coachName || user.name, replyTo: g.alertEmail || user.email });
    await store.write([{ type: "set", coll: "msgLog", id: msgId, data: { ...log, sentAt: r.ok ? now() : undefined, mode: r.mode, error: r.error } }]);
    return r.ok ? { status: "sent", note: r.mode } : { status: "failed", note: r.error };
  }
  if (!lead.whatsappOptIn) return { status: "skipped", note: "no WhatsApp opt-in" };
  if (phone10(lead.phone).length !== 10) return { status: "skipped", note: "no phone" };
  const r = await sendWhatsApp(phone10(lead.phone), body, user.id);
  await store.write([{ type: "set", coll: "msgLog", id: msgId, data: { ...log, sentAt: r.ok ? now() : undefined, mode: r.mode, error: r.error } }]);
  return r.ok ? { status: "sent", note: r.mode } : { status: "failed", note: r.error };
}

/** Send every due, still-valid step of one run; cancel the rest if a stop rule has been met. */
export async function processRun(runId: string) {
  const run = (await store.get("flowRuns", runId)) as unknown as Run | null;
  if (!run || run.done) return 0;
  const def = FLOW_BY_ID[run.flowId];
  const [u, g, leadRaw, doc] = await Promise.all([store.get("users", run.userId), getGrowth(run.userId), store.get("crm", run.leadId), flowDoc(run.userId, run.flowId)]);
  if (!def || !u || !g || !leadRaw || asUser(u).suspended) {
    await store.write([{ type: "update", coll: "flowRuns", id: runId, patch: { done: true } }]);
    return 0;
  }
  const lead = leadRaw as unknown as Lead;
  const steps = run.steps.map((s) => ({ ...s }));
  const stopped = doc?.enabled === false || def.stopOn.some((k) => lead.m?.[k]) || (def.sales && !!lead.m?.paid);
  let sent = 0;
  for (const s of steps) {
    if (s.status !== "pending") continue;
    if (stopped) {
      s.status = "stopped";
      continue;
    }
    if (new Date(s.dueAt).getTime() > Date.now()) continue;
    const sd = def.steps.find((x) => x.key === s.key);
    if (!sd) {
      s.status = "skipped";
      continue;
    }
    const r = await sendStep({ user: asUser(u), g, lead, run }, def, sd, doc?.overrides).catch((e) => ({ status: "failed" as const, note: (e as Error).message }));
    s.status = r.status;
    if (r.note) s.note = r.note;
    if (r.status === "sent") sent++;
  }
  const done = steps.every((s) => s.status !== "pending");
  await store.write([{ type: "update", coll: "flowRuns", id: runId, patch: { steps, done } }]);
  if (done && run.flowId === "enrol_unpaid" && !run.alerted && !lead.m?.paid && !stopped) {
    await store.write([{ type: "update", coll: "flowRuns", id: runId, patch: { alerted: true } }]);
    await alertCoach(run.userId, `${lead.name} started enrolling but has not paid after 72 hours. Send a personal message.`);
  }
  return sent;
}

export async function processFlows() {
  let n = 0;
  for (const r of await store.find("flowRuns", [["done", false]])) n += await processRun(r.id).catch(() => 0);
  return n;
}

/* ------------------------------------------------------------------ results and alerts for the Pattern Check */

export function describeResult(g: Growth, r: { pct: Record<string, number>; primary: string; secondary?: string; third?: string; type: string; flag?: string }) {
  const nm = (id?: string) => g.quiz?.patterns.find((p) => p.id === id)?.name || id || "";
  const parts = [r.primary, r.secondary, r.third].filter(Boolean).map((id) => `${nm(id)} (${r.pct[id!]}%)`);
  return `${r.type}: ${parts.join(" + ")}${r.flag ? ` · ${r.flag === "low" ? "low across all 4" : "high across all 4"}` : ""}`;
}

/* ------------------------------------------------------------------ hooks from checkout */

/** A buyer started checkout for the programme (or any product): moves a matching lead to "enrolment started". */
export async function onCheckoutStarted(creatorId: string, mangoId: string, p: { name?: string; email: string; phone?: string }) {
  const g = await getGrowth(creatorId);
  if (!g || g.programmeMango !== mangoId) return;
  const lead = await upsertLead(creatorId, { name: p.name, email: p.email, phone: p.phone, source: "checkout" });
  await mark(creatorId, lead.id, "enrolStarted");
}

/** Payment succeeded for the programme: mark the lead paid, open the portal and start the welcome flow. */
export async function onPurchase(creatorId: string, mangoId: string, p: { name: string; email: string; phone?: string }) {
  const g = await getGrowth(creatorId);
  if (!g || g.programmeMango !== mangoId) return;
  const lead = await upsertLead(creatorId, { name: p.name, email: p.email, phone: p.phone, source: "checkout" });
  await enrol(creatorId, lead);
  await mark(creatorId, lead.id, "enrolStarted", { silent: true });
  await mark(creatorId, lead.id, "paid");
  await alertCoach(creatorId, `New enrolment: ${lead.name} paid for ${g.programme || "the programme"}.`);
}

/** Give a lead portal access (enrolment row + a learner login if none exists). Safe to call twice. */
export async function enrol(creatorId: string, lead: Lead) {
  const have = await store.find("enrolments", [["userId", creatorId], ["email", lead.email]], { limit: 1 });
  if (!have.length) await store.write([{ type: "set", coll: "enrolments", id: newId(), data: { userId: creatorId, createdAt: now(), leadId: lead.id, name: lead.name, email: lead.email, phone: lead.phone, lessonsDone: [], attended: [], missed: [], status: "active" } }]);
  const { findUserByEmail, createUser } = await import("../auth");
  if (!(await findUserByEmail(lead.email))) {
    // the phone may already belong to another login; the learner signs in by email, so fall back to no phone
    const u = (await createUser({ name: lead.name, email: lead.email, phone: lead.phone || "", marketingOptIn: !!lead.whatsappOptIn })) || (await createUser({ name: lead.name, email: lead.email, phone: "", marketingOptIn: !!lead.whatsappOptIn }));
    if (u) await store.write([{ type: "update", coll: "users", id: u.id, patch: { role: "learner" } }]);
  }
}

/* ------------------------------------------------------------------ one-off notices (class reminders, feedback, announcements) */

type Person = { id?: string; name: string; email: string; phone?: string; whatsappOptIn?: boolean };

/** Send a portal notice by email (and WhatsApp for opted-in learners), logged under "Class, assignment and feedback notices". */
export async function sendNotice(creatorId: string, p: Person, stepKey: string, subject: string, body: string, week = 0) {
  const g = await getGrowth(creatorId);
  const u = await store.get("users", creatorId);
  if (!g || !u || asUser(u).suspended) return false;
  const user = asUser(u);
  const extra = week >= 4 && (g.boundaryLine || g.referralLine) ? `\n\n${[g.boundaryLine, g.referralLine].filter(Boolean).join("\n")}` : "";
  const text = `${body}${extra}\n\n— ${g.coachName || user.name}\n${g.programme || ""}`.trim();
  const off = p.email ? await store.find("unsubscribed", [["userId", creatorId], ["email", norm(p.email)]], { limit: 1 }) : [];
  let any = false;
  if (/^\S+@\S+\.\S+$/.test(p.email || "") && !off.length) {
    const msgId = newId();
    const links: string[] = [];
    const r = await sendEmail({ to: p.email, subject, text, html: toHtml(text, msgId, links), userId: creatorId, kind: "flow:class_notices", fromName: g.coachName || user.name, replyTo: g.alertEmail || user.email });
    await store.write([{ type: "set", coll: "msgLog", id: msgId, data: { userId: creatorId, leadId: p.id || "", flowId: "class_notices", stepKey, channel: "email", goal: null, createdAt: now(), sentAt: r.ok ? now() : undefined, mode: r.mode, error: r.error, to: p.email, subject, links } }]);
    any = r.ok;
  }
  if (p.whatsappOptIn && phone10(p.phone).length === 10) {
    const r = await sendWhatsApp(phone10(p.phone), `${subject}\n${body}`.slice(0, 900), creatorId);
    await store.write([{ type: "set", coll: "msgLog", id: newId(), data: { userId: creatorId, leadId: p.id || "", flowId: "class_notices", stepKey, channel: "whatsapp", goal: null, createdAt: now(), sentAt: r.ok ? now() : undefined, mode: r.mode, error: r.error, to: p.phone, subject } }]);
    any = any || r.ok;
  }
  return any;
}

/** Everyone currently enrolled, with their lead's WhatsApp opt-in. */
export async function activeLearners(creatorId: string) {
  const rows = (await store.find("enrolments", [["userId", creatorId]])).filter((e) => e.status !== "paused");
  const leads = await store.find("crm", [["userId", creatorId]]);
  return rows.map((e) => {
    const l = leads.find((x) => x.id === e.leadId) as unknown as Lead | undefined;
    return { ...e, whatsappOptIn: !!l?.whatsappOptIn, lead: l } as Record<string, unknown> & Person & { lead?: Lead; lessonsDone?: string[]; attended?: string[]; missed?: string[]; overdue?: string[] };
  });
}

/** A learner missed a class or let an assignment run 3 days late: warm message from the coach; second miss alerts the coach. */
export async function recordMiss(creatorId: string, enrolmentId: string, kind: "class" | "assignment", refId: string) {
  const e = await store.get("enrolments", enrolmentId);
  if (!e || e.userId !== creatorId) return;
  const missed = [...((e.missed as string[]) || [])];
  const tag = `${kind[0]}:${refId}`;
  if (missed.includes(tag)) return;
  missed.push(tag);
  await store.write([{ type: "update", coll: "enrolments", id: enrolmentId, patch: { missed } }]);
  const lead = (e.leadId ? await store.get("crm", String(e.leadId)) : await findLead(creatorId, String(e.email))) as unknown as Lead | null;
  if (!lead) return;
  if (!lead.m?.missedClass) await mark(creatorId, lead.id, "missedClass", { detail: tag });
  else {
    await fireFlow(creatorId, "rescue", lead, { key: tag });
    if (missed.length >= 2) await alertCoach(creatorId, `${lead.name} has now missed ${missed.length} sessions or deadlines. Time for a personal call.`);
  }
}
