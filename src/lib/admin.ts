import "server-only";
import { NextResponse } from "next/server";
import { currentUser } from "./auth";
import { id, now, type User } from "./db";

/**
 * Who is a platform admin? Anyone whose login email is listed in the ADMIN_EMAILS
 * environment variable (comma separated). There is deliberately no in-app way to
 * grant admin rights, so a creator can never promote themselves.
 */
export const adminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email: string) => adminEmails().includes(email.toLowerCase());
export const isAdminUser = (u: { email: string } | null | undefined) => Boolean(u && isAdminEmail(u.email));

export async function requireAdmin(): Promise<User | null> {
  const u = await currentUser();
  return isAdminUser(u) ? u : null;
}

export const deny = () => NextResponse.json({ error: "Admin access required" }, { status: 403 });

type Writer = { set(coll: string, id: string, data: Record<string, unknown>): void };

/** Append an entry to the admin audit log (pass the transaction so it is saved with the change). */
export function logAudit(t: Writer, admin: User, action: string, target: string, detail = "") {
  const i = id();
  t.set("audit", i, { userId: admin.id, createdAt: now(), admin: admin.email, action, target, detail });
}

/** Drop a notification into a creator's bell menu. */
export function notify(t: Writer, userId: string, text: string, extra: Record<string, unknown> = {}) {
  t.set("notifications", id(), { userId, createdAt: now(), read: false, text, ...extra });
}
