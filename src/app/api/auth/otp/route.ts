import { NextResponse } from "next/server";
import { findUserByEmail, findUserByPhone, issueOtp, normEmail, normPhone, SHOW_DEV_OTP } from "@/lib/auth";
import { deliverOtp } from "@/lib/messaging";

const mask = (e: string) => e.replace(/^(.).*(@.*)$/, "$1***$2");

async function respond(code: string, o: { phone?: string; email?: string; name?: string }, sentTo: string) {
  const r = await deliverOtp({ code, ...o });
  if (!r.delivered && !SHOW_DEV_OTP) return NextResponse.json({ error: "We couldn't send the code. SMS/email delivery isn't configured." }, { status: 503 });
  return NextResponse.json({ ok: true, sentTo, ...(SHOW_DEV_OTP && { devOtp: code }) });
}

/**
 * Request an OTP.
 *  mode "login":  account must exist (by phone or email)
 *  mode "signup": phone and email must NOT be taken yet
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const mode = body.mode === "signup" ? "signup" : "login";
  const phone = normPhone(body.phone);
  const email = normEmail(body.email);

  if (mode === "signup") {
    const name = String(body.name || "").trim();
    if (!name || name.length > 80) return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
    if (phone.length !== 10) return NextResponse.json({ error: "Please enter a valid 10-digit phone number" }, { status: 400 });
    if (!body.terms) return NextResponse.json({ error: "Please accept the Terms of Service" }, { status: 400 });
    if (await findUserByPhone(phone)) return NextResponse.json({ error: "This phone number is already registered. Please login." }, { status: 409 });
    if (await findUserByEmail(email)) return NextResponse.json({ error: "This email is already registered. Please login." }, { status: 409 });
    const code = await issueOtp(`phone:${phone}`);
    return respond(code, { phone, email, name }, `+91 ${phone}`);
  }

  if (!email && phone.length !== 10) return NextResponse.json({ error: "Please enter a valid 10-digit phone number" }, { status: 400 });
  const user = email ? await findUserByEmail(email) : await findUserByPhone(phone);
  if (!user) return NextResponse.json({ error: "No account found. Please sign up first." }, { status: 404 });
  if (user.suspended) return NextResponse.json({ error: "This account has been suspended. Please contact support." }, { status: 403 });
  const code = await issueOtp(email ? `email:${email}` : `phone:${phone}`);
  return respond(code, { phone: user.phone, email: user.email, name: user.name }, email ? mask(email) : `+91 ${phone}`);
}
