"use client";
import { useState } from "react";

export default function LeadForm({ slug }: { slug: string }) {
  const [d, setD] = useState({ name: "", email: "", phone: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState<string>();
  if (state === "done") return <p className="animate-soft-fade rounded-lg bg-[#e9f9ee] p-4 text-[14px] text-[#166534]">Thanks! The creator will get in touch with you soon.</p>;
  const inp = "w-full rounded-lg border border-[#e1e1e1] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#f2962c]";
  return (
    <form
      className="space-y-2 rounded-xl border border-dashed border-[#f2962c]/60 p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("busy");
        const r = await fetch("/api/public/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, ...d }) }).then((x) => x.json());
        if (r.error) { setErr(r.error); setState("idle"); } else setState("done");
      }}
    >
      <p className="font-semibold">Want more details first?</p>
      <input className={inp} placeholder="Name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} required />
      <input className={inp} type="email" placeholder="Email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} required />
      <input className={inp} inputMode="numeric" maxLength={10} placeholder="Phone (optional)" value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value.replace(/\D/g, "") })} />
      {err && <p className="text-[13px] text-[#ff4d4f]">{err}</p>}
      <button disabled={state === "busy"} className="w-full rounded-lg bg-[#0f0f0f] py-2.5 text-[14px] font-semibold text-white">{state === "busy" ? "Sending…" : "Get details"}</button>
    </form>
  );
}
