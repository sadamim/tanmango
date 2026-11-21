"use client";
import { useEffect, useState } from "react";

type Props = { mangoId: string; title: string; price: number; type: string; cycle?: string; terms?: string; successText?: string; successButton?: string; redirectUrl?: string };

export default function CheckoutBox({ mangoId, title, price, type, cycle, terms, successText, successButton, redirectUrl }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coupon, setCoupon] = useState("");
  const [agree, setAgree] = useState(false);
  const [ref, setRef] = useState<string>();
  const [final, setFinal] = useState(price);
  const [msg, setMsg] = useState<{ t: string; ok: boolean }>();
  const [done, setDone] = useState<{ price: number; saleId: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const r = new URLSearchParams(location.search).get("ref");
    if (r) {
      setRef(r);
      setCoupon((c) => c || r.toUpperCase());
    }
  }, []);

  const call = (preview: boolean) =>
    fetch("/api/public/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mangoId, name, email, phone, coupon, preview, ref }) }).then((r) => r.json());

  if (done) {
    return (
      <div className="animate-soft-fade rounded-2xl border border-[#ededed] bg-white p-6 text-center shadow-[0_20px_50px_-25px_rgba(0,0,0,0.3)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#2e9e4f] text-[26px] text-white">✓</div>
        <p className="mt-3 text-[20px] font-semibold">Payment Successful</p>
        <p className="text-[24px] font-bold">₹{done.price.toLocaleString("en-IN")}</p>
        <div className="mt-4 space-y-1.5 rounded-lg bg-[#f7f7f8] p-4 text-left text-[13px]">
          {[["Transaction ID", done.saleId.toUpperCase()], ["Service", title], ["Payment Method", "Test checkout"], ["Payment Time", new Date().toLocaleString("en-IN")], ["Billing Details", `${name} · ${email}`]].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><span className="text-[#6b6b7b]">{k}</span><b className="truncate">{v}</b></div>)}
        </div>
        {successText ? <p className="mt-4 whitespace-pre-wrap text-left text-[14px] text-[#4a4a59]">{successText}</p> : null}
        <a href={redirectUrl || "/web/login"} className="mt-5 block rounded-lg bg-[#f2962c] py-3 font-semibold text-white">{successButton || "Login Now"}</a>
      </div>
    );
  }

  const inp = "w-full rounded-lg border border-[#e1e1e1] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#f2962c]";
  return (
    <form
      className="space-y-3 rounded-2xl border border-[#ededed] bg-white p-6 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.3)]"
      onSubmit={async (e) => {
        e.preventDefault();
        if (terms && !agree) return setMsg({ t: "Please accept the Terms & Conditions", ok: false });
        setBusy(true);
        const r = await call(false);
        setBusy(false);
        if (r.error) return setMsg({ t: r.error, ok: false });
        setDone({ price: r.price, saleId: r.saleId });
      }}
    >
      <p className="text-[13px] text-[#6b6b7b]">{type === "Subscription" ? `${cycle || "Monthly"} subscription` : type === "Free" ? "Free" : "One-time payment"}</p>
      <p className="text-[30px] font-bold">
        {final ? `₹${final.toLocaleString("en-IN")}` : "Free"}
        {final !== price && <s className="ml-2 text-[16px] font-normal text-[#9b9bab]">₹{price.toLocaleString("en-IN")}</s>}
      </p>
      <input className={inp} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className={inp} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => /^\S+@\S+\.\S+$/.test(email) && fetch("/api/public/dropoff", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mangoId, email, name }) }).catch(() => {})} required />
      <input className={inp} inputMode="numeric" maxLength={10} placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
      {type !== "Subscription" && price > 0 && (
        <div className="flex gap-2">
          <input className={inp} placeholder="Have a coupon?" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} />
          <button type="button" className="shrink-0 rounded-lg border border-[#e1e1e1] px-4 text-[14px]" onClick={async () => {
            if (!coupon) return;
            const r = await call(true);
            if (r.error) { setFinal(price); return setMsg({ t: r.error, ok: false }); }
            setFinal(r.price);
            setMsg({ t: "Coupon applied", ok: true });
          }}>Apply</button>
        </div>
      )}
      {terms ? (
        <label className="flex gap-2 text-[12px] text-[#4a4a59]"><input type="checkbox" className="mt-0.5 accent-[#f2962c]" checked={agree} onChange={(e) => setAgree(e.target.checked)} /><span>I agree to the <details className="inline"><summary className="inline cursor-pointer text-[#1677ff]">Terms &amp; Conditions</summary><span className="mt-1 block whitespace-pre-wrap">{terms}</span></details></span></label>
      ) : null}
      {msg && <p className={`text-[13px] ${msg.ok ? "text-[#00a400]" : "text-[#ff4d4f]"}`}>{msg.t}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-[#f2962c] py-3 font-semibold text-white transition hover:bg-[#e8861a] disabled:opacity-60">
        {busy ? "Processing…" : final ? `Proceed to pay ₹${final.toLocaleString("en-IN")}` : "Get access"}
      </button>
      <p className="text-center text-[11px] text-[#9b9bab]">Test mode — no real payment is taken.</p>
    </form>
  );
}
