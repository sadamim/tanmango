import { store } from "@/lib/db";

const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

/** Email open pixel. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await store.get("msgLog", id);
  if (m && !m.openedAt) await store.write([{ type: "update", coll: "msgLog", id, patch: { openedAt: new Date().toISOString() } }]).catch(() => {});
  return new Response(new Uint8Array(GIF), { headers: { "content-type": "image/gif", "cache-control": "no-store" } });
}
