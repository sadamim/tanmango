import "server-only";
import { NextResponse } from "next/server";
import { currentUser } from "./auth";
import { asUser, id as newId, now, store, type User } from "./db";
import { hasFeature } from "./plans";
import { runBroadcasts } from "./cron";
import { announceUpdate, feedbackReady } from "./growth/portal";
import { attachRoom } from "./video";
import { present, RULES, sanitise, validate, type Rule } from "./resources";

const MAX_BODY = 600_000; // characters; website/course builders store large JSON

type Resolved = { me: User; rule: Rule; coll: string } | NextResponse;

export async function resolve(collection: string, op: "r" | "c" | "u" | "d"): Promise<Resolved> {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (me.role === "learner") return NextResponse.json({ error: "Learner accounts use the portal" }, { status: 403 });
  const rule = Object.prototype.hasOwnProperty.call(RULES, collection) ? RULES[collection] : null;
  if (!rule) return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  if (!rule.ops.includes(op)) return NextResponse.json({ error: "Not allowed" }, { status: 405 });
  if (op !== "r" && rule.gate && !hasFeature(me, rule.gate)) return NextResponse.json({ error: "Upgrade your plan to use this feature" }, { status: 403 });
  return { me, rule, coll: collection };
}

export async function readBody(req: Request) {
  const text = await req.text().catch(() => "");
  if (text.length > MAX_BODY) return { error: "Request is too large" };
  try {
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "Invalid body" };
    return { body: body as Record<string, unknown> };
  } catch {
    return { error: "Invalid body" };
  }
}

const fail = (e: unknown) => NextResponse.json({ error: (e as Error).message }, { status: 400 });

export async function list(coll: string, me: User, rule: Rule) {
  const rows = (await store.find(coll, [["userId", me.id]])).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return NextResponse.json({ rows: rows.map((r) => present(rule, r)) });
}

export async function create(coll: string, me: User, rule: Rule, raw: Record<string, unknown>) {
  try {
    const row = await store.tx(async (t) => {
      const owner = asUser(await t.get("users", me.id));
      if (!owner || owner.suspended) throw new Error("Account unavailable");
      const data = sanitise(rule, raw, "c");
      const c = { me: owner, t, data };
      await validate(rule, c, "c", coll);
      const doc = rule.build ? await rule.build(c) : data;
      const rid = newId();
      const full = { ...doc, userId: me.id, createdAt: now() };
      t.set(coll, rid, full);
      return { id: rid, ...full };
    });
    if (coll === "broadcasts") await runBroadcasts(me.id).catch(() => {}); // send immediately if due; scheduled ones go out via /api/cron/run
    if (coll === "updates") await announceUpdate(me.id, row).catch(() => {});
    const withRoom = await attachRoom(coll, row).catch(() => row); // empty meeting link + Metered set up → a built-in video room
    return NextResponse.json({ row: present(rule, withRoom) }, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}

export async function update(coll: string, me: User, rule: Rule, rid: string, raw: Record<string, unknown>) {
  try {
    const row = await store.tx(async (t) => {
      const cur = await t.get(coll, rid);
      if (!cur || cur.userId !== me.id) return null;
      const data = sanitise(rule, raw, "u");
      if (!Object.keys(data).length) throw new Error("Nothing to update");
      await validate(rule, { me, t, data, existing: cur }, "u", coll);
      const patch = { ...data, updatedAt: now() };
      t.update(coll, rid, patch);
      return { ...cur, ...patch };
    });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (coll === "submissions" && typeof raw.feedback === "string" && raw.feedback.trim()) await feedbackReady(me.id, row).catch(() => {});
    return NextResponse.json({ row: present(rule, row) });
  } catch (e) {
    return fail(e);
  }
}

export async function remove(coll: string, me: User, rid: string) {
  const ok = await store.tx(async (t) => {
    const cur = await t.get(coll, rid);
    if (!cur || cur.userId !== me.id) return false;
    t.delete(coll, rid);
    return true;
  });
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
