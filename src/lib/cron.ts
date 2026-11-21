import "server-only";
import { asUser, now, store } from "./db";
import { activeCustomers } from "./customers";
import { automatedEmail } from "./automation";
import { fill, sendEmail } from "./messaging";
import { processFlows } from "./growth/core";
import { runClassNotices } from "./growth/portal";
import { runWeeklyReports } from "./growth/report";

/** Send every Email broadcast whose time has come (scheduled or immediate). WhatsApp broadcasts are only recorded. */
export async function runBroadcasts(onlyUser?: string) {
  const due = (await store.find("broadcasts", onlyUser ? [["userId", onlyUser]] : [])).filter((b) => !b.isTemplate && !b.sentAt && new Date(String(b.sendAt || b.createdAt)).getTime() <= Date.now());
  let sent = 0;
  for (const b of due) {
    // claim first so two overlapping runs can't both send it
    const claimed = await store.tx(async (t) => {
      const cur = await t.get("broadcasts", b.id);
      if (!cur || cur.sentAt) return false;
      t.update("broadcasts", b.id, { sentAt: now() });
      return true;
    });
    if (!claimed) continue;
    const owner = await store.get("users", String(b.userId));
    if (!owner || asUser(owner).suspended) continue;
    const people = await activeCustomers(String(b.userId), (b.mangoes as string[]) || []);
    let delivered = 0;
    if (b.kind === "Email") {
      const s = (asUser(owner).settings?.email || {}) as { fromName?: string; replyTo?: string };
      for (const c of people) {
        const vars = { name: c.name || "there" };
        const text = `${fill(String(b.body || ""), vars)}${b.link ? `\n\n${b.button || "Open"}: ${b.link}` : ""}`;
        const r = await sendEmail({ to: c.email, subject: fill(String(b.subject || b.name || "Update"), vars), text, userId: String(b.userId), kind: "broadcast", fromName: s.fromName || asUser(owner).name, replyTo: s.replyTo || asUser(owner).email });
        if (r.ok) delivered++;
      }
    }
    await store.write([{ type: "update", coll: "broadcasts", id: b.id, patch: { recipients: people.length, delivered } }]);
    sent++;
  }
  return sent;
}

/** One-day-before-expiry reminders and checkout drop-off reminders. */
export async function runReminders() {
  let n = 0;
  const t = Date.now();
  for (const s of await store.find("sales")) {
    if (s.status !== "Success" || !s.expires || s.expiryReminded || s.autoRenew === false) continue;
    const left = new Date(String(s.expires)).getTime() - t;
    if (left <= 0 || left > 864e5) continue;
    await store.write([{ type: "update", coll: "sales", id: s.id, patch: { expiryReminded: true } }]);
    await automatedEmail(String(s.userId), "Reminder Email One Day Before Expiry", String(s.email), { name: String(s.customer), mango: String(s.mango) }, { subject: `Your access to ${s.mango} ends soon`, body: `Hi {name},\n\nYour access to "{mango}" expires within a day.\n\n— {creator}` });
    n++;
  }
  for (const l of await store.find("leads", [["type", "dropoff"]])) {
    if (l.reminded || t - new Date(String(l.createdAt)).getTime() < 36e5) continue;
    await store.write([{ type: "update", coll: "leads", id: l.id, patch: { reminded: true } }]);
    await automatedEmail(String(l.userId), "Reminder Email on Purchase Drop-off", String(l.email), { name: String(l.name), mango: String(l.mango) }, { subject: `Still interested in ${l.mango}?`, body: `Hi {name},\n\nYou left "{mango}" at checkout. Come back whenever you're ready.\n\n— {creator}` });
    n++;
  }
  return n;
}

/** Growth: due workflow messages, class/assignment notices, and the Monday report. */
export async function runGrowth() {
  return { flows: await processFlows(), notices: await runClassNotices(), reports: await runWeeklyReports() };
}
