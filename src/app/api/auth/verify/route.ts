import { NextResponse } from "next/server";
import { checkOtp, createUser, findUserByEmail, findUserByPhone, normEmail, normPhone, startSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const phone = normPhone(body.phone);
  const email = normEmail(body.email);
  const code = String(body.code || "").trim();
  const key = body.mode !== "signup" && email ? `email:${email}` : `phone:${phone}`;

  if (!(await checkOtp(key, code))) {
    return NextResponse.json({ error: "Incorrect or expired OTP" }, { status: 400 });
  }

  if (body.mode === "signup") {
    const name = String(body.name || "").trim().slice(0, 80);
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || phone.length !== 10) return NextResponse.json({ error: "Invalid sign-up details" }, { status: 400 });
    const user = await createUser({ name, email, phone, marketingOptIn: Boolean(body.marketing) });
    if (!user) return NextResponse.json({ error: "Account already exists. Please login." }, { status: 409 });
    await startSession(user.id);
    return NextResponse.json({ ok: true, next: "/web/sign-up/about" });
  }

  const user = email ? await findUserByEmail(email) : await findUserByPhone(phone);
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  if (user.suspended) return NextResponse.json({ error: "This account has been suspended. Please contact support." }, { status: 403 });
  await startSession(user.id);
  return NextResponse.json({ ok: true, next: "/web/dashboard/getstarted" });
}
