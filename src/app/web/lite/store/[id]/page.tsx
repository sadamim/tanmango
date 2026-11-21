import Link from "next/link";
import { notFound } from "next/navigation";
import TrackView from "@/components/TrackView";
import { findStore } from "@/lib/public";

export const dynamic = "force-dynamic";

export default async function Store({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ref?: string }> }) {
  const { id } = await params;
  const { ref } = await searchParams;
  const data = await findStore(id);
  if (!data) notFound();
  if (data.off) {
    return <div className="font-app grid min-h-screen place-items-center bg-[#fafafa] p-6 text-center"><div><p className="text-[22px] font-semibold">{data.creator.name}</p><p className="mt-2 text-[#6b6b7b]">This storefront is currently unavailable.</p></div></div>;
  }
  const c = data.creator;
  const q = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  return (
    <div className="font-app min-h-screen bg-[#fafafa] text-[#0f0f0f]">
      <TrackView kind="store" refId={id} />
      <header className="px-4 py-16 text-center text-white" style={{ background: `linear-gradient(135deg, ${c.color}, #1d0f08)` }}>
        {c.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.avatar} alt="" className="animate-rise mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-white/30" />
        ) : (
          <span className="animate-rise mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/25 text-[32px] font-bold">{c.name[0]?.toUpperCase()}</span>
        )}
        <h1 className="animate-rise mt-4 text-[32px] font-bold" style={{ ["--delay" as string]: "0.08s" }}>{c.name}</h1>
        {c.tagline && <p className="animate-rise text-white/85" style={{ ["--delay" as string]: "0.14s" }}>{c.tagline}</p>}
        {c.bio && <p className="animate-rise mx-auto mt-3 max-w-xl text-[14px] text-white/80" style={{ ["--delay" as string]: "0.2s" }}>{c.bio}</p>}
        <div className="mt-4 flex justify-center gap-3 text-[13px]">
          {c.instagram && <a href={c.instagram} target="_blank" rel="noreferrer" className="rounded-full bg-white/15 px-3 py-1">Instagram</a>}
          {c.youtube && <a href={c.youtube} target="_blank" rel="noreferrer" className="rounded-full bg-white/15 px-3 py-1">YouTube</a>}
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-5 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {data.mangoes.length === 0 && <p className="col-span-full text-center text-[#6b6b7b]">Nothing on sale right now.</p>}
        {data.mangoes.map((m, i) => (
          <Link key={m.id} href={`/checkout/${m.id}${q}`} className="animate-rise group overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg" style={{ ["--delay" as string]: `${0.1 + i * 0.06}s` }}>
            {m.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(m.cover)} alt="" className="aspect-video w-full object-cover" />
            ) : (
              <div className="grid aspect-video place-items-center text-[28px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${c.color}, #f6bb22)` }}>{String(m.title).slice(0, 1)}</div>
            )}
            <div className="p-5">
              <p className="text-[18px] font-semibold">{String(m.title)}</p>
              <p className="mt-1 line-clamp-2 text-[14px] text-[#6b6b7b]">{String(m.description || "")}</p>
              <p className="mt-3 text-[22px] font-bold">{m.type === "Free" ? "Free" : `₹${Number(m.discountPrice || m.price).toLocaleString("en-IN")}`}<span className="ml-1 text-[12px] font-normal text-[#6b6b7b]">{m.type === "Subscription" ? `/ ${String(m.cycle || "Monthly").toLowerCase()}` : ""}</span></p>
              <span className="mt-3 inline-block font-medium transition group-hover:translate-x-1" style={{ color: c.color }}>Get access →</span>
            </div>
          </Link>
        ))}
      </main>
      <p className="pb-8 text-center text-[12px] text-[#9b9bab]">Powered by tag<span className="text-[#f2962c]">mango</span></p>
    </div>
  );
}
