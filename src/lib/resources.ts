import "server-only";
import type { Tx } from "./store";
import { asUser, type User } from "./db";
import { hasFeature } from "./plans";
import { balanceOf } from "./money";

/**
 * Server-side rules for the generic /api/data/<collection> endpoints. The browser is never trusted:
 * every collection lists which operations a creator may perform, which plan feature it needs,
 * which fields may change, and which values must be unique.
 */
export type Ctx = { me: User; t: Tx; data: Record<string, unknown>; existing?: Record<string, unknown> };

export type Rule = {
  /** r=list, c=create, u=update, d=delete */
  ops: string;
  /** Plan feature (see MIN_PLAN in nav.ts) required to create/update/delete. Reading is always allowed. */
  gate?: string;
  required?: string[];
  /** When set, only these fields may be updated. */
  updatable?: string[];
  /** Fields stripped from every create/update body (server-owned). */
  protect?: string[];
  /** Unique per creator, case-insensitive. */
  unique?: string[];
  /** Unique across the whole platform, case-insensitive. */
  globalUnique?: string[];
  /** Fields removed from what the creator sees. */
  hide?: string[];
  /** Custom validation; return an error message to reject. */
  check?: (c: Ctx, op: "c" | "u") => string | void | Promise<string | void>;
  /** Replace the generic insert (e.g. withdrawals). Return the document to store. */
  build?: (c: Ctx) => Promise<Record<string, unknown>>;
};

const email = (v: unknown) => /^\S+@\S+\.\S+$/.test(String(v || ""));
const SLUG = /^[a-z0-9][a-z0-9-]{1,59}$/;
const num = (v: unknown) => Number(v);

export const RULES: Record<string, Rule> = {
  mangoes: {
    ops: "rcud",
    required: ["title"],
    unique: ["title"],
    check: ({ data }) => {
      if ("price" in data && !(num(data.price) >= 0)) return "Price must be 0 or more";
    },
  },
  courses: { ops: "rcud", required: ["title"] },
  workshops: { ops: "rcud", required: ["title"] },
  events: { ops: "rcud", required: ["title"] },
  bookings: {
    ops: "ru",
    updatable: ["status"],
    check: ({ data }) => (data.status === "Cancelled" ? undefined : "Bookings can only be cancelled"),
  },
  sales: {
    ops: "ru",
    updatable: ["autoRenew"],
    check: ({ data }) => (typeof data.autoRenew === "boolean" ? undefined : "Invalid value"),
  },
  withdrawals: {
    ops: "rc",
    hide: ["processedBy"],
    build: async ({ me, t, data }) => {
      const amount = num(data.amount);
      const u = asUser(await t.get("users", me.id));
      if (!u.bank) throw new Error("Add your bank account first");
      if (!(u.kycDone || u.kyc?.status === "verified")) throw new Error(u.kyc?.status === "pending" ? "Your KYC is awaiting review" : "Complete KYC first");
      if (!Number.isFinite(amount) || amount < 100) throw new Error("Minimum withdrawal is ₹100");
      const b = await balanceOf(t, u);
      if (amount > b.withdrawable) throw new Error("Amount is more than your withdrawable balance");
      // touching the user document serialises concurrent withdrawals so a balance can't be spent twice
      t.update("users", u.id, { lastWithdrawalAt: new Date().toISOString() });
      return { amount: Math.round(amount * 100) / 100, account: u.bank.account, status: "Processing" };
    },
  },
  pages: {
    ops: "rcud",
    required: ["slug"],
    globalUnique: ["slug"],
    check: ({ data }) => (SLUG.test(String(data.slug ?? "ok-slug")) ? undefined : "Link must be 2–60 letters, numbers or dashes"),
  },
  sites: {
    ops: "rcud",
    gate: "landing-page",
    required: ["slug"],
    globalUnique: ["slug"],
    check: ({ data }) => (SLUG.test(String(data.slug ?? "ok-slug")) ? undefined : "Link must be 2–60 letters, numbers or dashes"),
  },
  leads: { ops: "rd" },
  broadcasts: {
    ops: "rcud",
    protect: ["sentAt", "delivered"],
    check: ({ me, data }, op) => {
      if (op === "c" && data.kind === "WhatsApp" && !hasFeature(me, "whatsapp-broadcast")) return "Upgrade your plan to send WhatsApp broadcasts";
    },
  },
  banners: { ops: "rcud", gate: "feed-banners" },
  coupons: {
    ops: "rcud",
    required: ["code"],
    unique: ["code"],
    check: ({ data }) => {
      if ("discount" in data && !(num(data.discount) >= 1 && num(data.discount) <= 80)) return "Discount must be between 1% and 80%";
      if (data.start && data.end && new Date(String(data.end)) < new Date(String(data.start))) return "End must be after start";
    },
  },
  unsubscribed: { ops: "rcud", gate: "unsubscribed-users", required: ["email"], unique: ["email"], check: ({ data }) => (!("email" in data) || email(data.email) ? undefined : "Enter a valid email") },
  paths: { ops: "rcud", gate: "path" },
  waTemplates: { ops: "rcud", gate: "whatsapp-templates" },
  certificates: { ops: "rcud" },
  affiliates: {
    ops: "rcud",
    gate: "affiliate",
    required: ["code"],
    unique: ["code"],
    check: ({ data }) => {
      if ("commission" in data && !(num(data.commission) >= 1 && num(data.commission) <= 90)) return "Commission must be between 1% and 90%";
    },
  },
  badges: { ops: "rcud", gate: "badges", required: ["name"], unique: ["threshold"], check: ({ data }) => ("threshold" in data && !(num(data.threshold) >= 1) ? "Points needed must be at least 1" : undefined) },
  team: { ops: "rcud", gate: "team-management", required: ["email"], unique: ["email"], check: ({ data }) => (!("email" in data) || email(data.email) ? undefined : "Enter a valid email") },
  cloud: { ops: "r" },
  invoices: { ops: "r" },
  reports: { ops: "rcu", updatable: ["resolved"] },
  blocked: { ops: "rcud", gate: "blocked-users", required: ["email"], unique: ["email"] },
  customers: {
    ops: "rcud",
    required: ["email", "mango"],
    check: ({ me, data }, op) => (op === "c" && !data.revoked && !hasFeature(me, "add-customers") ? "Upgrade your plan to add customers manually" : undefined),
  },
  posts: { ops: "rcud", required: ["text"] },
  comments: { ops: "rcud", required: ["text"] },
  messages: { ops: "rc", required: ["text"] },
  notifications: { ops: "ru", updatable: ["read"] },
  views: { ops: "r" },
  outbox: { ops: "r" },
};

const CODE = /^[a-z0-9][a-z0-9_-]{1,38}$/i;

/* ---- growth funnel + learning portal ---- */
Object.assign(RULES, {
  growth: {
    ops: "ru",
    protect: ["hookKey", "lastReportWeek"],
    globalUnique: ["slug"],
    check: ({ data }) => {
      if ("slug" in data && !SLUG.test(String(data.slug))) return "Link must be 2–60 letters, numbers or dashes";
      if ("alertEmail" in data && data.alertEmail && !email(data.alertEmail)) return "Enter a valid alert email";
      const q = data.quiz as { patterns?: { id?: string; name?: string; bullets?: { id?: string; score?: unknown }[] }[]; rules?: Record<string, unknown> } | undefined;
      if (q) {
        if (!Array.isArray(q.patterns) || q.patterns.length < 2 || q.patterns.length > 8) return "A Pattern Check needs between 2 and 8 patterns";
        const ids = new Set<string>();
        for (const p of q.patterns) {
          if (!p.id || !p.name?.trim()) return "Every pattern needs a name";
          if (!p.bullets?.length) return `“${p.name}” needs at least one statement`;
          for (const b of p.bullets) {
            if (!b.id || ids.has(`${p.id}.${b.id}`)) return "Statement ids must be unique";
            ids.add(`${p.id}.${b.id}`);
            if (!(Number(b.score) >= 0)) return "Scores must be 0 or more";
          }
        }
        for (const k of ["present", "blend", "lowBelow", "highFrom"]) if (!(Number(q.rules?.[k]) >= 0 && Number(q.rules?.[k]) <= 100)) return "Result rules must be percentages between 0 and 100";
      }
    },
  },
  crm: { ops: "rud", updatable: ["notes"] },
  masterclasses: { ops: "rcud", required: ["title", "startsAt"], protect: ["attendanceTaken"], check: ({ data }) => ("seats" in data && data.seats !== "" && !(num(data.seats) >= 1) ? "Seats must be at least 1" : undefined) },
  slots: { ops: "rcud", required: ["startsAt"], unique: ["startsAt"], protect: ["leadId", "bookedAt"] },
  trackedLinks: {
    ops: "rcud",
    required: ["label", "code"],
    globalUnique: ["code"],
    protect: ["clicks"],
    check: ({ data }) => ("code" in data && !CODE.test(String(data.code)) ? "Code must be 2–40 letters, numbers, dashes or underscores" : undefined),
  },
  linkClicks: { ops: "r" },
  flows: { ops: "r" },
  flowRuns: { ops: "r" },
  msgLog: { ops: "r" },
  testimonials: { ops: "rud", updatable: ["status", "featured"] },
  socialStats: { ops: "rcud", required: ["platform", "weekStart"], check: ({ data }) => ("weekStart" in data && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.weekStart)) ? "Pick the Monday of the week" : undefined) },
  lessons: { ops: "rcud", required: ["title", "week"] },
  classes: { ops: "rcud", required: ["title", "startsAt"], protect: ["reminded", "attendanceTaken"] },
  assignments: { ops: "rcud", required: ["title", "week"], protect: ["dueReminded", "overdueHandled"] },
  submissions: { ops: "ru", updatable: ["feedback", "status"] },
  enrolments: { ops: "rud", updatable: ["status", "cohort"] },
  updates: { ops: "rcd", required: ["title", "body"] },
} satisfies Record<string, Rule>);

export const ALWAYS_PROTECTED = ["id", "userId", "createdAt", "updatedAt"];

const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();

/** Throws an Error with a user-facing message if `data` breaks the collection's rules. */
export async function validate(rule: Rule, c: Ctx, op: "c" | "u", coll: string) {
  const { data, t, me } = c;
  if (op === "c") for (const f of rule.required || []) if (data[f] === undefined || data[f] === null || String(data[f]).trim() === "") throw new Error(`${f[0].toUpperCase() + f.slice(1)} is required`);
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string" && v.length > 20000) throw new Error(`${k} is too long`);
    if (k.includes(".") || k.startsWith("__")) throw new Error(`Invalid field: ${k}`);
  }
  for (const f of rule.unique || []) {
    if (!(f in data)) continue;
    const dupes = await t.find(coll, [["userId", me.id]]);
    if (dupes.some((d) => d.id !== c.existing?.id && norm(d[f]) === norm(data[f]))) throw new Error(`That ${f} is already in use`);
  }
  for (const f of rule.globalUnique || []) {
    if (!(f in data)) continue;
    const taken = await t.find(coll, [[f, String(data[f])]]);
    if (taken.some((d) => d.id !== c.existing?.id)) throw new Error(`That ${f} is already taken`);
  }
  const msg = await rule.check?.(c, op);
  if (msg) throw new Error(msg);
}

export function sanitise(rule: Rule, body: Record<string, unknown>, op: "c" | "u") {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (ALWAYS_PROTECTED.includes(k) || rule.protect?.includes(k)) continue;
    if (op === "u" && rule.updatable && !rule.updatable.includes(k)) continue;
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

export function present(rule: Rule, row: Record<string, unknown>) {
  if (!rule.hide?.length) return row;
  const r = { ...row };
  for (const k of rule.hide) delete r[k];
  return r;
}
