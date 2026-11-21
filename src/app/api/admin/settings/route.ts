import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { store } from "@/lib/db";
import { ALL_COLLECTIONS } from "@/lib/collections";
import { dataDir } from "@/lib/store/file";
import { adminEmails, deny, requireAdmin } from "@/lib/admin";
import { emailConfigured, smsConfigured } from "@/lib/messaging";

async function dirSize(dir: string): Promise<{ files: number; bytes: number }> {
  try {
    let files = 0;
    let bytes = 0;
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        const s = await dirSize(path.join(dir, e.name));
        files += s.files;
        bytes += s.bytes;
      } else {
        files++;
        bytes += (await fs.stat(path.join(dir, e.name)).catch(() => null))?.size || 0;
      }
    }
    return { files, bytes };
  } catch {
    return { files: 0, bytes: 0 };
  }
}

/** Platform info for the admin Settings page. Admin emails come from the ADMIN_EMAILS env var (read-only here). */
export async function GET() {
  const me = await requireAdmin();
  if (!me) return deny();
  const counts = await Promise.all(ALL_COLLECTIONS.map(async (name) => ({ name, count: await store.count(name) })));
  const local = store.kind === "file";
  const dbFile = local ? await fs.stat(path.join(dataDir(), "db.json")).catch(() => null) : null;
  return NextResponse.json({
    admins: adminEmails(),
    you: me.email,
    env: process.env.NODE_ENV,
    otpOnScreen: process.env.NODE_ENV !== "production" || process.env.SHOW_DEV_OTP === "1",
    database: store.kind === "firestore" ? "Firebase Firestore" : "Local JSON file",
    email: emailConfigured() ? "SMTP" : "not configured",
    sms: smsConfigured() ? "Twilio" : "not configured",
    users: counts.find((c) => c.name === "users")?.count || 0,
    sessions: counts.find((c) => c.name === "sessions")?.count || 0,
    dbBytes: dbFile?.size || 0,
    uploads: local ? await dirSize(path.join(dataDir(), "uploads")) : { files: 0, bytes: 0 },
    collections: counts.filter((c) => !["users", "sessions", "otps", "claims"].includes(c.name)).sort((a, b) => b.count - a.count),
  });
}
