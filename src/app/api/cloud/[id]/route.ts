import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { fileStorage } from "@/lib/store/files";

type Ctx = { params: Promise<{ id: string }> };

/** Stream an uploaded file back to its owner. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const row = await store.get("cloud", id);
  if (!row || row.userId !== me.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const buf = await fileStorage().get(me.id, id);
  if (!buf) return NextResponse.json({ error: "File missing" }, { status: 404 });
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "content-type": String(row.mime || "application/octet-stream"),
      "content-disposition": `inline; filename="${encodeURIComponent(String(row.title))}"`,
      "x-content-type-options": "nosniff",
    },
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const row = await store.get("cloud", id);
  if (!row || row.userId !== me.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await store.write([{ type: "delete", coll: "cloud", id }]);
  await fileStorage().remove(me.id, id);
  return NextResponse.json({ ok: true });
}
