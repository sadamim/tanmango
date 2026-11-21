export type Block = { id: string; kind: "hero" | "text" | "features" | "testimonial" | "cta" | "faq"; title?: string; body?: string; items?: string; button?: string; link?: string };

export default function SiteRender({ blocks, color }: { blocks: Block[]; color: string }) {
  return (
    <div className="font-app bg-white text-[#0f0f0f]">
      {blocks.length === 0 && <p className="p-10 text-center text-[13px] text-[#9b9bab]">Add sections from the left.</p>}
      {blocks.map((b) => {
        const items = (b.items || "").split("\n").map((x) => x.trim()).filter(Boolean);
        if (b.kind === "hero") return <section key={b.id} className="px-8 py-16 text-center text-white" style={{ background: `linear-gradient(135deg, ${color}, #1d0f08)` }}><h1 className="text-[34px] font-bold leading-tight">{b.title}</h1>{b.body && <p className="mx-auto mt-3 max-w-xl opacity-90">{b.body}</p>}{b.button && <a href={b.link || "#"} className="mt-6 inline-block rounded-md bg-white px-6 py-2.5 font-semibold" style={{ color }}>{b.button}</a>}</section>;
        if (b.kind === "features") return <section key={b.id} className="px-8 py-12"><h2 className="text-center text-[24px] font-semibold">{b.title}</h2>{b.body && <p className="mt-2 text-center text-[#6b6b7b]">{b.body}</p>}<div className="mt-6 grid gap-3 sm:grid-cols-3">{items.map((it) => <div key={it} className="rounded-lg border border-[#ededed] p-4"><span className="mb-2 block h-1.5 w-8 rounded" style={{ background: color }} />{it}</div>)}</div></section>;
        if (b.kind === "testimonial") return <section key={b.id} className="bg-[#fafafa] px-8 py-12 text-center"><p className="mx-auto max-w-2xl text-[20px] italic">“{b.body || "Add a testimonial quote"}”</p><p className="mt-3 font-semibold">{b.title}</p></section>;
        if (b.kind === "faq") return <section key={b.id} className="px-8 py-12"><h2 className="text-[24px] font-semibold">{b.title}</h2><div className="mt-4 divide-y divide-[#ededed]">{items.map((it) => { const [q, a] = it.split("|"); return <details key={it} className="py-3"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-1 text-[#6b6b7b]">{a}</p></details>; })}</div></section>;
        if (b.kind === "cta") return <section key={b.id} className="px-8 py-14 text-center" style={{ background: `${color}15` }}><h2 className="text-[26px] font-semibold">{b.title}</h2>{b.body && <p className="mt-2 text-[#6b6b7b]">{b.body}</p>}{b.button && <a href={b.link || "#"} className="mt-5 inline-block rounded-md px-6 py-2.5 font-semibold text-white" style={{ background: color }}>{b.button}</a>}</section>;
        return <section key={b.id} className="px-8 py-10"><h2 className="text-[22px] font-semibold">{b.title}</h2><p className="mt-2 whitespace-pre-wrap text-[#4a4a59]">{b.body}</p></section>;
      })}
    </div>
  );
}

