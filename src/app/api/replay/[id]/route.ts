import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import { getGrowth, mark } from "@/lib/growth/core";

/** Replay link in emails: valid for N hours after the masterclass, counted as a replay view. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const leadId = new URL(req.url).searchParams.get("l") || "";
  const [mc, lead] = await Promise.all([store.get("masterclasses", id), store.get("crm", leadId)]);
  if (!mc || !lead || lead.userId !== mc.userId || !mc.replayUrl) return new Response("This replay link isn't valid.", { status: 404 });
  const g = await getGrowth(String(mc.userId));
  const hours = Number(g?.replayHours || 48);
  const until = new Date(String(mc.startsAt)).getTime() + Number(mc.duration || 120) * 60000 + hours * 3600e3;
  if (Date.now() > until) return new Response(`This replay was available for ${hours} hours and has now closed. Please book a conversation to continue.`, { status: 410 });
  await mark(String(mc.userId), leadId, "replay").catch(() => {});
  return NextResponse.redirect(String(mc.replayUrl));
}
