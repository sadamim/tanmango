import { NextResponse } from "next/server";
import { id, now, store } from "@/lib/db";
import { rateLimited } from "@/lib/ratelimit";

/** Lead form submission from a public Mango Page → Customers › Leads › Form Responses. */
export async function POST(req: Request) {
  if (await rateLimited("lead", 10)) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim().slice(0, 80);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
  const phone = String(body.phone || "").replace(/\D/g, "").slice(-10);
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter your name and a valid email" }, { status: 400 });
  const [page] = await store.find("pages", [["slug", String(body.slug || "")], ["published", true]], { limit: 1 });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  await store.write([{ type: "set", coll: "leads", id: id(), data: { userId: page.userId, createdAt: now(), type: "form", name, email, phone, mango: page.mango, pageTitle: page.title } }]);
  return NextResponse.json({ ok: true });
}
