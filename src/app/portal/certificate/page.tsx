"use client";
import { useEffect, useState } from "react";

export default function Certificate() {
  const [p, setP] = useState<{ coach: string; programme: string; completed: boolean; enrolment: { name: string } } | null>(null);
  useEffect(() => { fetch("/api/portal").then((r) => r.json()).then(setP); }, []);
  if (!p) return null;
  if (!p.completed) return <p className="p-10 text-center">Finish every lesson and assignment to unlock your certificate.</p>;
  return (
    <div className="grid min-h-screen place-items-center bg-white p-6 print:p-0" style={{ fontFamily: "Georgia, serif" }}>
      <div className="w-full max-w-3xl border-[6px] border-double border-[#111] p-12 text-center">
        <p className="text-[13px] uppercase tracking-[0.3em] text-[#777]">Certificate of completion</p>
        <p className="mt-8 text-[16px] text-[#555]">This certifies that</p>
        <p className="mt-2 text-[38px]">{p.enrolment.name}</p>
        <p className="mt-6 text-[16px] text-[#555]">has completed</p>
        <p className="mt-2 text-[26px]">{p.programme}</p>
        <p className="mt-10 text-[15px]">{p.coach}</p>
        <p className="mt-1 text-[12px] text-[#888]">{new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
        <button className="mt-8 rounded bg-[#111] px-4 py-2 text-[14px] text-white print:hidden" onClick={() => window.print()}>Print or save as PDF</button>
      </div>
    </div>
  );
}
