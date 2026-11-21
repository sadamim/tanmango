import "server-only";
import nodemailer from "nodemailer";
import { id, now, store } from "./db";

/**
 * Outbound email (SMTP) and SMS (Twilio). Both are optional:
 *  - Without SMTP, emails are written to the `outbox` collection in development (so you can inspect them)
 *    and skipped in production unless EMAIL_OUTBOX=1.
 *  - Without Twilio, SMS is skipped.
 */
export const emailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
export const emailjsGenericConfigured = () => Boolean(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_GENERIC_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY && process.env.EMAILJS_PRIVATE_KEY);
export const emailjsConfigured = () => Boolean(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY && process.env.EMAILJS_PRIVATE_KEY);
export const smsConfigured = () => Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);

const g = globalThis as { __tmMail?: nodemailer.Transporter };
function transport() {
  if (!g.__tmMail) {
    const port = Number(process.env.SMTP_PORT || 587);
    g.__tmMail = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  }
  return g.__tmMail;
}

export type SendResult = { ok: boolean; mode: "smtp" | "emailjs" | "outbox" | "sms" | "skipped"; error?: string };

export async function sendEmail(m: { to: string; subject: string; text: string; html?: string; userId?: string; kind?: string; fromName?: string; replyTo?: string }): Promise<SendResult> {
  if (!/^\S+@\S+\.\S+$/.test(m.to)) return { ok: false, mode: "skipped", error: "invalid recipient" };
  if (emailConfigured()) {
    try {
      await transport().sendMail({ from: m.fromName ? `"${m.fromName.replace(/"/g, "")}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>` : process.env.SMTP_FROM || process.env.SMTP_USER, replyTo: m.replyTo, to: m.to, subject: m.subject, text: m.text, html: m.html });
      return { ok: true, mode: "smtp" };
    } catch (e) {
      return { ok: false, mode: "smtp", error: (e as Error).message };
    }
  }
  if (emailjsGenericConfigured()) {
    try {
      const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const html = m.html || `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#222">${esc(m.text).replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}">${u}</a>`).replace(/\n/g, "<br>")}</div>`;
      const r = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_GENERIC_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          accessToken: process.env.EMAILJS_PRIVATE_KEY,
          template_params: { to_email: m.to, subject: m.subject, message: m.text, message_html: html, from_name: m.fromName || "TagMango", reply_to: m.replyTo || "" },
        }),
      });
      return r.ok ? { ok: true, mode: "emailjs" } : { ok: false, mode: "emailjs", error: `EmailJS ${r.status}: ${(await r.text()).slice(0, 160)}` };
    } catch (e) {
      return { ok: false, mode: "emailjs", error: (e as Error).message };
    }
  }
  if (process.env.NODE_ENV !== "production" || process.env.EMAIL_OUTBOX === "1") {
    const oid = id();
    await store.write([{ type: "set", coll: "outbox", id: oid, data: { userId: m.userId || "system", createdAt: now(), to: m.to, subject: m.subject, text: m.text, kind: m.kind || "email" } }]);
    return { ok: true, mode: "outbox" };
  }
  return { ok: false, mode: "skipped", error: "SMTP is not configured" };
}

export async function sendSms(phone10: string, body: string): Promise<SendResult> {
  if (!smsConfigured()) return { ok: false, mode: "skipped", error: "Twilio is not configured" };
  try {
    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { authorization: "Basic " + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"), "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: `+91${phone10}`, From: process.env.TWILIO_FROM!, Body: body }),
    });
    return r.ok ? { ok: true, mode: "sms" } : { ok: false, mode: "sms", error: `Twilio ${r.status}: ${(await r.text()).slice(0, 160)}` };
  } catch (e) {
    return { ok: false, mode: "sms", error: (e as Error).message };
  }
}

/**
 * WhatsApp via Twilio (set TWILIO_WHATSAPP_FROM, e.g. "whatsapp:+14155238886"). Without it, messages are written to the
 * outbox in development so flows can be tested. Free-form messages only reach people who messaged you in the last 24 hours;
 * outside that window WhatsApp requires Meta-approved templates, so production use needs a template-capable provider.
 */
export const metaWhatsappConfigured = () => Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

/**
 * Meta WhatsApp Cloud API (free tier, no card). Free-form text works only inside the 24-hour window after the person
 * messaged you. Outside it WhatsApp error 131047 comes back; if WHATSAPP_TEMPLATE_NAME is set (an approved template with one
 * variable, e.g. "{{1}}"), the message is re-sent through that template instead.
 */
async function sendMeta(phone10: string, body: string): Promise<SendResult> {
  const url = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const call = async (payload: object) => {
    const r = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "content-type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", to: `91${phone10}`, ...payload }) });
    const j = (await r.json().catch(() => ({}))) as { error?: { code?: number; message?: string } };
    return { ok: r.ok, code: j.error?.code, error: j.error?.message };
  };
  try {
    const first = await call({ type: "text", text: { body: body.slice(0, 4000), preview_url: true } });
    if (first.ok) return { ok: true, mode: "sms" };
    const tpl = process.env.WHATSAPP_TEMPLATE_NAME;
    if (first.code === 131047 && tpl) {
      const flat = body.replace(/\s*\n+\s*/g, " | ").replace(/\s{4,}/g, "   ").slice(0, 900);
      const second = await call({ type: "template", template: { name: tpl, language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" }, components: [{ type: "body", parameters: [{ type: "text", text: flat }] }] } });
      return second.ok ? { ok: true, mode: "sms" } : { ok: false, mode: "sms", error: `WhatsApp template: ${second.error}` };
    }
    return { ok: false, mode: "sms", error: `WhatsApp: ${first.error || "failed"}${first.code === 131047 ? " (outside the 24-hour window; set WHATSAPP_TEMPLATE_NAME to use an approved template)" : ""}` };
  } catch (e) {
    return { ok: false, mode: "sms", error: (e as Error).message };
  }
}

export async function sendWhatsApp(phone10: string, body: string, userId?: string): Promise<SendResult> {
  if (metaWhatsappConfigured()) return sendMeta(phone10, body);
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (from && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: { authorization: "Basic " + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"), "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ To: `whatsapp:+91${phone10}`, From: from, Body: body }),
      });
      return r.ok ? { ok: true, mode: "sms" } : { ok: false, mode: "sms", error: `Twilio ${r.status}: ${(await r.text()).slice(0, 160)}` };
    } catch (e) {
      return { ok: false, mode: "sms", error: (e as Error).message };
    }
  }
  if (process.env.NODE_ENV !== "production" || process.env.EMAIL_OUTBOX === "1") {
    await store.write([{ type: "set", coll: "outbox", id: id(), data: { userId: userId || "system", createdAt: now(), to: `+91${phone10}`, subject: "WhatsApp", text: body, kind: "whatsapp" } }]);
    return { ok: true, mode: "outbox" };
  }
  return { ok: false, mode: "skipped", error: "WhatsApp is not configured" };
}

/** Send a login code by SMS (preferred when a phone is given and Twilio is set up) or email. */
export async function deliverOtp(o: { code: string; phone?: string; email?: string; name?: string }) {
  const text = `Your TagMango verification code is ${o.code}. It expires in 5 minutes. Don't share it with anyone.`;
  if (o.phone && smsConfigured()) {
    const r = await sendSms(o.phone, text);
    if (r.ok) return { delivered: true, channel: "sms" as const };
  }
  if (o.email && emailjsConfigured()) {
    try {
      const r = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          accessToken: process.env.EMAILJS_PRIVATE_KEY,
          template_params: { to_email: o.email, to_name: o.name || "there", otp: o.code, expires_in: "5 minutes", reply_to: process.env.EMAILJS_REPLY_TO || o.email },
        }),
      });
      if (r.ok) return { delivered: true, channel: "email" as const };
    } catch {
      /* fall through to SMTP */
    }
  }
  if (o.email && emailConfigured()) {
    const r = await sendEmail({ to: o.email, subject: "Your TagMango verification code", text, kind: "otp" });
    if (r.ok) return { delivered: true, channel: "email" as const };
  }
  return { delivered: false as const };
}

/** Replace {name}-style variables in an email template. */
export function fill(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}
