import "server-only";
import { asUser, store } from "./db";
import { fill, sendEmail } from "./messaging";

type Tpl = { enabled?: boolean; subject?: string; body?: string };
type EmailSettings = { fromName?: string; replyTo?: string; templates?: Record<string, Tpl> };

/**
 * Send one of the creator's automated emails (Email Automation page). Disabled templates are skipped, and a
 * customised subject/body replaces the default. Never throws: automation must not break the action that triggered it.
 */
export async function automatedEmail(creatorId: string, template: string, to: string, vars: Record<string, string>, fallback: { subject: string; body: string }) {
  try {
    const u = await store.get("users", creatorId);
    if (!u) return;
    const s = ((asUser(u).settings?.email || {}) as EmailSettings);
    const t = s.templates?.[template];
    if (t?.enabled === false) return;
    const v = { creator: asUser(u).name, ...vars };
    await sendEmail({
      to,
      subject: fill(t?.subject || fallback.subject, v),
      text: fill(t?.body || fallback.body, v),
      userId: creatorId,
      kind: template,
      fromName: s.fromName || asUser(u).name,
      replyTo: s.replyTo || asUser(u).email,
    });
  } catch {
    /* ignore */
  }
}
