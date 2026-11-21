import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { rateLimited } from "@/lib/ratelimit";
import { createRoom, newRoomToken, roomLink, videoConfigured } from "@/lib/video";

/** Coach: make an instant video room and get its link. */
export async function POST() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (await rateLimited("room", 20)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!videoConfigured()) return NextResponse.json({ error: "Video isn't set up yet. Add METERED_APP_DOMAIN and METERED_SECRET_KEY." }, { status: 503 });
  const token = newRoomToken();
  const r = await createRoom(token);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 502 });
  return NextResponse.json({ link: roomLink(token) });
}
