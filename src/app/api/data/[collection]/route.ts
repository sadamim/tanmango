import { NextResponse } from "next/server";
import { create, list, readBody, resolve } from "@/lib/dataApi";

type Ctx = { params: Promise<{ collection: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const r = await resolve((await params).collection, "r");
  if (r instanceof NextResponse) return r;
  return list(r.coll, r.me, r.rule);
}

export async function POST(req: Request, { params }: Ctx) {
  const r = await resolve((await params).collection, "c");
  if (r instanceof NextResponse) return r;
  const b = await readBody(req);
  if (!b.body) return NextResponse.json({ error: b.error }, { status: 400 });
  return create(r.coll, r.me, r.rule, b.body);
}
