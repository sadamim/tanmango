import "server-only";
import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { asUser, authCache, now, sha, id, store, type Session, type User } from "./db";

export const SESSION_COOKIE = "tm_session";
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

export const normPhone = (p: string) => (p || "").replace(/\D/g, "").slice(-10);
export const normEmail = (e: string) => (e || "").trim().toLowerCase();

/* ------------------------------------------------------------------ one-time codes */

const otpDoc = (key: string) => sha(`otp:${key}`);
const codeHash = (key: string, code: string) => sha(`${key}:${code}`);

/** Create (replacing any previous) a 6-digit code for `key` ("phone:…" / "email:…"). Only a hash is stored. */
export async function issueOtp(key: string) {
  const code = String(crypto.randomInt(100000, 1000000));
  await store.write([{ type: "set", coll: "otps", id: otpDoc(key), data: { key, hash: codeHash(key, code), expires: Date.now() + OTP_TTL_MS, attempts: 0 } }]);
  return code;
}

/** Verify and consume a code. Five wrong guesses burn it. */
export async function checkOtp(key: string, code: string) {
  return store.tx(async (t) => {
    const d = await t.get("otps", otpDoc(key));
    if (!d || Number(d.expires) < Date.now()) {
      if (d) t.delete("otps", d.id);
      return false;
    }
    if (d.hash === codeHash(key, code)) {
      t.delete("otps", d.id);
      return true;
    }
    const attempts = Number(d.attempts || 0) + 1;
    if (attempts >= MAX_OTP_ATTEMPTS) t.delete("otps", d.id);
    else t.update("otps", d.id, { attempts });
    return false;
  });
}

/* ------------------------------------------------------------------ users */

export async function findUserByEmail(email: string) {
  const [u] = await store.find("users", [["email", normEmail(email)]], { limit: 1 });
  return u ? asUser(u) : null;
}
export async function findUserByPhone(phone: string) {
  const [u] = await store.find("users", [["phone", normPhone(phone)]], { limit: 1 });
  return u ? asUser(u) : null;
}

/** Create a user, atomically claiming their email and phone so two sign-ups can't race to the same identity. */
export async function createUser(input: { name: string; email: string; phone: string; marketingOptIn: boolean }): Promise<User | null> {
  const uid = id();
  const ce = sha(`email:${input.email}`);
  const cp = sha(`phone:${input.phone}`);
  return store.tx(async (t) => {
    const [a, b, ue, up] = await Promise.all([t.get("claims", ce), input.phone ? t.get("claims", cp) : null, t.find("users", [["email", input.email]], { limit: 1 }), input.phone ? t.find("users", [["phone", input.phone]], { limit: 1 }) : []]);
    if (a || b || ue.length || up.length) return null; // also checks users directly: accounts created before claims existed
    const user: User = { id: uid, name: input.name, email: input.email, phone: input.phone, marketingOptIn: input.marketingOptIn, createdAt: now() };
    t.set("users", uid, user);
    t.set("claims", ce, { userId: uid, kind: "email" });
    if (input.phone) t.set("claims", cp, { userId: uid, kind: "phone" });
    return user;
  });
}

/* ------------------------------------------------------------------ sessions */

export async function startSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const h = await headers();
  const sid = sha(token);
  await store.tx(async (t) => {
    const [user, mine] = await Promise.all([t.get("users", userId), t.find("sessions", [["userId", userId]])]);
    const at = now();
    t.set("sessions", sid, { userId, createdAt: at, lastSeen: at, userAgent: h.get("user-agent") || "Unknown device", ip: (h.get("x-forwarded-for") || "").split(",")[0].trim() || "127.0.0.1" });
    // "Manage Login Sessions" device limit: keep only the newest (limit - 1) existing sessions plus this one
    const limit = Number(asUser(user)?.settings?.maxDevices || 0);
    if (limit > 0) {
      const sorted = (mine as unknown as Session[]).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      for (const s of sorted.slice(0, Math.max(0, sorted.length - (limit - 1)))) t.delete("sessions", s.id);
    }
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await store.write([{ type: "delete", coll: "sessions", id: sha(token) }]);
  jar.delete(SESSION_COOKIE);
}

export async function currentToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value || null;
}

/** Public, non-secret handle for a session (first 16 hex chars of its stored id). */
export const publicSessionId = (storedId: string) => storedId.slice(0, 16);

export async function currentUser(): Promise<User | null> {
  const token = await currentToken();
  if (!token) return null;
  const key = sha(token);
  const hit = authCache.get(key);
  if (hit) return structuredClone(hit.user) as User; // a copy, so a request can never change what other requests see
  const s = await store.get("sessions", key);
  if (!s) return null;
  const u = await store.get("users", String(s.userId));
  const user = u && !(u as unknown as User).suspended ? asUser(u) : null;
  if (user) authCache.set(key, structuredClone(user));
  return user;
}

/** What a creator may see about their own account: admin-only fields removed, PAN masked. */
export function selfView(u: User) {
  const v: Record<string, unknown> = { plan: "basic", ...u };
  delete v.adminNote;
  delete v.suspendReason;
  if (u.kyc) v.kyc = { ...u.kyc, pan: `XXXXX${u.kyc.pan.slice(5)}` };
  return v;
}

/** OTPs are shown on screen in development because no SMS/email provider is wired up. */
export const SHOW_DEV_OTP = process.env.NODE_ENV !== "production" || process.env.SHOW_DEV_OTP === "1";
