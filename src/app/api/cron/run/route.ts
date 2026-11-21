import { NextResponse } from "next/server";
import { runBroadcasts, runGrowth, runReminders } from "@/lib/cron";

/**
 * Scheduled jobs: sends due broadcasts and reminder emails. Call every few minutes
 * (Vercel Cron, Cloud Scheduler, or `curl -H "Authorization: Bearer $CRON_SECRET" .../api/cron/run`).
 * In production CRON_SECRET is required.
 */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret ? req.headers.get("authorization") !== `Bearer ${secret}` : process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const broadcasts = await runBroadcasts();
  const reminders = await runReminders();
  const growth = await runGrowth();
  return NextResponse.json({ ok: true, broadcasts, reminders, growth });
}
export const GET = handle;
export const POST = handle;
