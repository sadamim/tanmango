"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { postJson } from "@/lib/coach/content";
import { input, label, mangoBtn, inkBtn } from "./kit";

type RzpHandlerResp = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RzpInstance = { open: () => void; on: (evt: string, cb: (r: unknown) => void) => void };
type Order = { error?: string; test?: boolean; mangoId?: string; keyId?: string; id?: string; amount?: number; currency?: string; programme?: string; prefill?: Record<string, string> };

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    const w = window as unknown as { Razorpay?: unknown };
    if (w.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Enrol and pay. /api/coach/order prices the programme on the server; with Razorpay keys it opens Razorpay
 * Checkout and /api/coach/verify records the payment (the webhook does too). Without keys it uses the test checkout.
 * Success → /nitienaa/confirmation with the receipt.
 */
export default function Checkout({ price, programmeName, cohort }: { price: string; programmeName: string; cohort: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "working" | "pending" | "failed">("idle");
  const [err, setErr] = useState("");
  const [testMode, setTestMode] = useState(false);

  async function pay(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    const learner = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setErr("");
    setStatus("working");
    const order = await postJson<Order>("/api/coach/order", learner);
    if (order.error) { setErr(order.error); setStatus("idle"); return; }

    if (order.test) {
      setTestMode(true);
      const r = await postJson<{ saleId?: string }>("/api/public/checkout", { mangoId: order.mangoId, name: learner.name, email: learner.email, phone: learner.whatsapp });
      if (r.error) { setErr(r.error); setStatus("failed"); return; }
      router.push(`/nitienaa/confirmation?sale=${encodeURIComponent(r.saleId || "")}`);
      return;
    }

    const RZ = (await loadRazorpay()) ? (window as unknown as { Razorpay?: new (o: Record<string, unknown>) => RzpInstance }).Razorpay : undefined;
    if (!RZ) { setErr("Could not load the secure payment window. Check your connection and try again."); setStatus("failed"); return; }
    const rzp = new RZ({
      key: order.keyId, order_id: order.id, amount: order.amount, currency: order.currency,
      name: "Nitienaa", description: `${order.programme || programmeName} · Cohort ${cohort}`, prefill: order.prefill, theme: { color: "#ff6a00" },
      handler: async (resp: RzpHandlerResp) => {
        setStatus("working");
        const v = await postJson<{ status?: string; paymentId?: string }>("/api/coach/verify", resp);
        if (v.error) { setErr(v.error); setStatus("failed"); return; }
        if (v.status === "paid") router.push(`/nitienaa/confirmation?payment_id=${encodeURIComponent(v.paymentId || resp.razorpay_payment_id)}`);
        else setStatus(v.status === "failed" ? "failed" : "pending");
      },
      modal: { ondismiss: () => setStatus((s) => (s === "working" ? "idle" : s)) },
    });
    rzp.on("payment.failed", () => setStatus("failed"));
    rzp.open();
  }

  return (
    <form onSubmit={pay} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="en-name" className={label}>Full name</label><input id="en-name" name="name" autoComplete="name" required className={input} /></div>
        <div><label htmlFor="en-em" className={label}>Email</label><input id="en-em" name="email" type="email" autoComplete="email" required className={input} /></div>
        <div><label htmlFor="en-wa" className={label}>WhatsApp number</label><input id="en-wa" name="whatsapp" type="tel" placeholder="+91" required className={input} /></div>
        <div><label htmlFor="en-gst" className={label}>GSTIN <span className="font-normal text-ink/50">(optional)</span></label><input id="en-gst" name="gstin" className={input} /></div>
      </div>
      <p className="text-sm text-ink/60">Your learning portal account is created with these details once payment succeeds.</p>
      <label className="flex items-start gap-3 text-sm text-ink/70"><input type="checkbox" name="terms" required className="mt-1 h-4 w-4 accent-orange-500" /><span>I have read the <a href="/terms" className="underline">terms</a> and <a href="/refund-policy" className="underline">refund policy</a>.</span></label>

      {status !== "pending" && status !== "failed" && (
        <button type="submit" disabled={status === "working"} className={`${mangoBtn} w-full !py-4 text-base`}>
          {status === "working" ? "Opening secure checkout…" : `Pay ${price} securely`}
        </button>
      )}
      {err && status === "idle" && <p role="alert" className="text-sm text-red-600">{err}</p>}
      {status === "pending" && (
        <div role="status" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <b>Payment pending.</b> Your bank hasn&apos;t confirmed it yet. We&apos;ll email and WhatsApp you as soon as it clears — no need to pay again. If it doesn&apos;t clear, you&apos;ll get a reminder with your payment link.
          <button type="button" onClick={() => setStatus("idle")} className="mt-3 block font-semibold underline">Back</button>
        </div>
      )}
      {status === "failed" && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <b>Payment failed.</b> {err || "The payment didn't go through and you haven't been charged."} Try again or choose another method. We&apos;ll also send a reminder with your payment link.
          <button type="button" onClick={() => { setErr(""); setStatus("idle"); }} className={`${inkBtn} mt-3 !px-5 !py-2 text-sm`}>Try again</button>
        </div>
      )}
      <p className="flex flex-wrap items-center gap-2 text-xs text-ink/50">
        <span>Secured by Razorpay · UPI, cards, net banking and wallets</span>
        {testMode && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">Test mode — no money moves</span>}
      </p>
    </form>
  );
}
