import "server-only";
import crypto from "crypto";
import { store } from "./db";
import { appUrl } from "./growth/core";

/**
 * Built-in video calls through Metered (metered.ca), so the coach never needs Zoom or Google Meet.
 * METERED_APP_DOMAIN = "yourapp.metered.live", METERED_SECRET_KEY = from Metered dashboard › Developers.
 * Every masterclass, discovery slot and class gets its own room, opened at <site>/room/<token>.
 */
export const videoDomain = () => (process.env.METERED_APP_DOMAIN || "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
export const videoConfigured = () => Boolean(videoDomain() && (process.env.METERED_SECRET_KEY || "").trim());

/** Collection → the field that holds its meeting link. */
const LINK_FIELD: Record<string, string> = { masterclasses: "joinLink", slots: "link", classes: "joinLink" };

export async function createRoom(roomName: string) {
  try {
    const r = await fetch(`https://${videoDomain()}/api/v1/room?secretKey=${encodeURIComponent((process.env.METERED_SECRET_KEY || "").trim())}`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ roomName, privacy: "public", enableChat: true, enableScreenSharing: true, joinVideoOn: true, joinAudioOn: true }),
    });
    if (r.ok) return { ok: true as const };
    return { ok: false as const, error: `Metered ${r.status}: ${(await r.text()).slice(0, 160)}` };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
}

export const newRoomToken = () => "tm" + crypto.randomBytes(10).toString("hex");
export const roomLink = (token: string) => `${appUrl()}/room/${token}`;

/** If the coach left the meeting link empty and Metered is set up, make a room and fill the link in. */
export async function attachRoom<T extends Record<string, unknown>>(coll: string, row: T & { id: string }): Promise<T & { id: string }> {
  const field = LINK_FIELD[coll];
  if (!field || !videoConfigured() || row[field]) return row;
  const token = newRoomToken();
  const made = await createRoom(token);
  if (!made.ok) return row;
  const link = roomLink(token);
  await store.write([{ type: "update", coll, id: row.id, patch: { [field]: link, videoRoom: token } }]);
  return { ...row, [field]: link, videoRoom: token };
}
