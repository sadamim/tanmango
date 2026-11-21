import { NextResponse } from "next/server";
import { readBody, remove, resolve, update } from "@/lib/dataApi";

type Ctx = { params: Promise<{ collection: string; id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { collection, id } = await params;
  const r = await resolve(collection, "u");
  if (r instanceof NextResponse) return r;
  const b = await readBody(req);
  if (!b.body) return NextResponse.json({ error: b.error }, { status: 400 });
  return update(r.coll, r.me, r.rule, id, b.body);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { collection, id } = await params;
  const r = await resolve(collection, "d");
  if (r instanceof NextResponse) return r;
  return remove(r.coll, r.me, id);
}
