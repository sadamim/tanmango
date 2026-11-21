import { NextResponse } from "next/server";
import { asUser, id, now, store } from "@/lib/db";
import { rateLimited } from "@/lib/ratelimit";
import { automatedEmail } from "@/lib/automation";

/** Book a 1-1 consultation slot from the public booking page. */
export async function POST(req: Request) {
  if (await rateLimited("book", 10)) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim().slice(0, 80);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
  const phone = String(body.phone || "").replace(/\D/g, "").slice(-10);
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter your name and a valid email" }, { status: 400 });
  try {
    const booking = await store.tx(async (t) => {
      const ev = await t.get("events", String(body.eventId || ""));
      if (!ev || ev.active === false) throw new Error("This event isn't available");
      const owner = asUser(await t.get("users", String(ev.userId)));
      if (!owner || owner.suspended) throw new Error("This event isn't available");
      const slot = String(body.slot || "");
      if (!((ev.slots as string[]) || []).includes(slot)) throw new Error("Pick one of the available slots");
      if (new Date(slot).getTime() < Date.now()) throw new Error("That slot is in the past");
      const all = (await t.find("bookings", [["userId", ev.userId]])).filter((b) => b.status !== "Cancelled");
      if (!owner.settings?.overlappingSlots && all.some((b) => b.slot === slot)) throw new Error("That slot was just booked. Pick another.");
      const perUser = Number(ev.slotsPerUser || 1);
      if (all.filter((b) => b.eventId === ev.id && b.email === email).length >= perUser) throw new Error(`You can book up to ${perUser} slot(s) for this event`);
      const bid = id();
      const b = { userId: String(ev.userId), createdAt: now(), eventId: ev.id, event: ev.title, slot, duration: ev.duration, name, email, phone, status: "Confirmed", link: ev.link };
      t.set("bookings", bid, b);
      t.set("notifications", id(), { userId: ev.userId, createdAt: now(), read: false, text: `New booking: ${name} booked “${ev.title}”` });
      return { ...b, id: bid };
    });
    await automatedEmail(booking.userId, "Confirmation Email on 1-1 Consultation booking", email, { name, event: String(booking.event), slot: new Date(booking.slot).toLocaleString("en-IN"), link: String(booking.link || "") }, {
      subject: `Booking confirmed: ${booking.event}`,
      body: `Hi {name},\n\nYour booking for "{event}" on {slot} is confirmed.\n{link}\n\n— {creator}`,
    });
    return NextResponse.json({ ok: true, booking: { slot: booking.slot, event: booking.event, link: booking.link } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
