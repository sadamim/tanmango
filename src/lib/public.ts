import "server-only";
import { asRows, asUser, store, type Row } from "./db";

/** Read-only lookups for public pages (no login). Only published/active data is exposed. */
const owner = async (userId: string) => {
  const u = await store.get("users", userId);
  return u ? asUser(u) : null;
};

export async function findPage(slug: string) {
  const [page] = await store.find("pages", [["slug", slug], ["published", true]], { limit: 1 });
  if (!page) return null;
  const o = await owner(String(page.userId));
  if (o?.suspended) return null;
  const [mango] = await store.find("mangoes", [["userId", page.userId], ["title", page.mango], ["active", true]], { limit: 1 });
  return { page: page as Row, mango: (mango as Row) || null, creator: o ? { name: o.name } : null };
}

export async function findStore(userId: string) {
  const o = await owner(userId);
  if (!o || o.suspended) return null;
  const st = (o.settings?.store || {}) as Record<string, unknown>;
  if (st.active === false) return { off: true as const, creator: { name: o.name } };
  const hidden = new Set((st.hidden as string[]) || []);
  const mangoes = asRows(await store.find("mangoes", [["userId", userId], ["active", true]])).filter((m) => !hidden.has(m.id));
  return { off: false as const, creator: { name: String(st.name || o.name), tagline: String(st.tagline || o.about?.category || ""), bio: String(st.bio || ""), avatar: String(st.avatar || ""), color: String(st.color || "#f2962c"), instagram: String(st.instagram || ""), youtube: String(st.youtube || "") }, mangoes };
}

export async function findMango(id: string) {
  const mango = await store.get("mangoes", id);
  if (!mango || !mango.active) return null;
  const o = await owner(String(mango.userId));
  if (o?.suspended) return null;
  return { mango: mango as Row, creator: o ? { name: o.name } : null };
}

export async function findEvent(id: string) {
  const ev = await store.get("events", id);
  if (!ev || ev.active === false) return null;
  const o = await owner(String(ev.userId));
  if (o?.suspended) return null;
  const overlap = Boolean(o?.settings?.overlappingSlots);
  const taken = new Set((await store.find("bookings", [["userId", ev.userId]])).filter((b) => b.status !== "Cancelled").map((b) => String(b.slot)));
  const slots = ((ev.slots as string[]) || []).filter((s) => new Date(s).getTime() > Date.now() && (overlap || !taken.has(s))).sort();
  return { ev: { id: ev.id, title: String(ev.title), description: String(ev.description || ""), duration: Number(ev.duration || 30) }, slots, creator: o ? { name: o.name } : null };
}

export async function findSite(slug: string) {
  const [site] = await store.find("sites", [["slug", slug], ["published", true]], { limit: 1 });
  if (!site || (await owner(String(site.userId)))?.suspended) return null;
  return site as Row;
}
