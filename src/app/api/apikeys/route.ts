import { NextResponse } from "next/server";
import crypto from "crypto";
import { asUser, store } from "@/lib/db";
import { currentUser, selfView } from "@/lib/auth";

/** Generate (or rotate) an API key for Zapier / Pabbly. Stored on the user's settings. */
export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const provider = body.provider === "pabbly" ? "pabbly" : body.provider === "zapier" ? "zapier" : null;
  if (!provider) return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  const key = `tm_${provider === "zapier" ? "zap" : "pab"}_${crypto.randomBytes(20).toString("hex")}`;
  const user = await store.tx(async (t) => {
    const u = asUser(await t.get("users", me.id));
    const settings = { ...u.settings, apiKeys: { ...((u.settings?.apiKeys as object) || {}), [provider]: { key, createdAt: new Date().toISOString() } } };
    t.update("users", me.id, { settings });
    return selfView({ ...u, settings });
  });
  return NextResponse.json({ user });
}
