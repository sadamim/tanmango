"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCollection } from "@/lib/client";
import { Btn, EmptyBox, Panel } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";
import { useCustomers } from "@/components/dash/hooks";

/** Direct messages to your customers, one thread per customer. */
export default function Messages() {
  const { list } = useCustomers();
  const msgs = useCollection("messages");
  const [active, setActive] = useState<string>();
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const end = useRef<HTMLDivElement>(null);

  const people = useMemo(() => {
    const m = new Map<string, { name: string; email: string; mangoes: string[] }>();
    for (const c of list) {
      const e = m.get(c.email) || { name: c.name, email: c.email, mangoes: [] };
      e.mangoes.push(c.mango);
      m.set(c.email, e);
    }
    return [...m.values()].filter((p) => `${p.name} ${p.email}`.toLowerCase().includes(q.toLowerCase()));
  }, [list, q]);
  const cur = people.find((p) => p.email === active) || people[0];
  const thread = msgs.rows.filter((m) => m.to === cur?.email).slice().reverse();
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [thread.length, cur?.email]);

  if (!list.length) return <div className="mx-auto max-w-4xl"><Panel><EmptyBox title="No conversations yet" text="Once people buy your mangoes, you can message them here." /></Panel></div>;

  return (
    <Panel className="mx-auto grid h-[calc(100vh-170px)] min-h-[480px] max-w-6xl overflow-hidden md:grid-cols-[300px_1fr]">
      <div className="flex min-h-0 flex-col border-r border-[#ededed]">
        <div className="border-b border-[#ededed] p-3">
          <label className="flex h-10 items-center gap-2 rounded-md border border-[#e1e1e1] px-3"><Icon name="search" className="h-4 w-4 text-[#9b9bab]" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people" className="w-full text-[14px] outline-none" /></label>
        </div>
        <div className="flex-1 overflow-y-auto">
          {people.map((p) => {
            const last = msgs.rows.find((m) => m.to === p.email);
            return (
              <button key={p.email} onClick={() => setActive(p.email)} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${cur?.email === p.email ? "bg-[#fdefdf]" : "hover:bg-[#fafafa]"}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fdefdf] font-semibold text-[#c7740f]">{p.name[0]?.toUpperCase()}</span>
                <span className="min-w-0 flex-1"><b className="block truncate text-[14px]">{p.name}</b><span className="block truncate text-[12px] text-[#6b6b7b]">{last ? String(last.text) : p.email}</span></span>
              </button>
            );
          })}
        </div>
      </div>
      {cur && (
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-3 border-b border-[#ededed] px-5 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#fdefdf] font-semibold text-[#c7740f]">{cur.name[0]?.toUpperCase()}</span>
            <div><p className="font-semibold">{cur.name}</p><p className="text-[12px] text-[#6b6b7b]">{cur.mangoes.join(", ")}</p></div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto bg-[#f7f7f8] p-5">
            {thread.length === 0 && <p className="pt-10 text-center text-[13px] text-[#9b9bab]">Say hello to {cur.name.split(" ")[0]} 👋</p>}
            {thread.map((m) => (
              <div key={m.id} className="animate-soft-fade ml-auto w-fit max-w-[75%] rounded-2xl rounded-br-sm bg-[#f2962c] px-4 py-2 text-[14px] text-white">
                {String(m.text)}<span className="mt-0.5 block text-right text-[10px] text-white/75">{new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
            <div ref={end} />
          </div>
          <form className="flex gap-2 border-t border-[#ededed] p-3" onSubmit={async (e) => { e.preventDefault(); const t = text.trim(); if (!t) return; setText(""); await msgs.create({ to: cur.email, text: t }); }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="h-10 flex-1 rounded-md border border-[#e1e1e1] px-3.5 text-[14px] outline-none focus:border-[#f2962c]" />
            <Btn aria-label="Send" icon="send" />
          </form>
        </div>
      )}
    </Panel>
  );
}
