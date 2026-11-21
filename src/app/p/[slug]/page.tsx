import { notFound } from "next/navigation";
import CheckoutBox from "@/components/CheckoutBox";
import LeadForm from "@/components/LeadForm";
import TrackView from "@/components/TrackView";
import { tpl } from "@/components/dash/templates";
import { findPage } from "@/lib/public";

export const dynamic = "force-dynamic";

export default async function MangoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await findPage(slug);
  if (!data) notFound();
  const { page, mango, creator } = data;
  const t = tpl(page.template);
  const bullets = String(page.bullets || "").split("\n").map((b) => b.trim()).filter(Boolean);
  const price = mango ? (mango.type === "Free" ? 0 : Number(mango.discountPrice || mango.price || 0)) : 0;

  return (
    <div className="font-app min-h-screen bg-[#fafafa] text-[#0f0f0f]">
      <TrackView kind="page" refId={page.id} />
      <section className="px-4 pb-28 pt-20" style={{ background: t.bg, color: t.text }}>
        <div className={`mx-auto max-w-5xl ${t.layout === "center" ? "text-center" : ""}`}>
          {creator && <p className="animate-rise text-[13px] font-medium uppercase tracking-[0.2em] opacity-80">By {creator.name}</p>}
          <h1 className={`animate-rise mt-3 text-[36px] font-bold leading-tight md:text-[52px] ${t.layout === "center" ? "mx-auto" : ""} max-w-3xl`} style={{ ["--delay" as string]: "0.08s" }}>{String(page.headline)}</h1>
          {page.subheadline ? <p className={`animate-rise mt-4 max-w-2xl text-[17px] opacity-90 ${t.layout === "center" ? "mx-auto" : ""}`} style={{ ["--delay" as string]: "0.16s" }}>{String(page.subheadline)}</p> : null}
          <span className="mt-6 inline-block h-1.5 w-16 rounded" style={{ background: t.accent }} />
        </div>
      </section>
      <section className="mx-auto -mt-16 grid max-w-5xl gap-8 px-4 pb-20 md:grid-cols-[1.4fr_1fr]">
        <div className="animate-rise space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8" style={{ ["--delay" as string]: "0.2s" }}>
          <div>
            <h2 className="text-[22px] font-semibold">{mango ? String(mango.title) : String(page.title)}</h2>
            {mango?.description ? <p className="mt-2 whitespace-pre-wrap text-[#4a4a59]">{String(mango.description)}</p> : null}
          </div>
          {bullets.length > 0 && (
            <ul className="space-y-3">{bullets.map((b) => <li key={b} className="flex gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#2e9e4f] text-[11px] text-white">✓</span>{b}</li>)}</ul>
          )}
          {page.leadForm ? <LeadForm slug={String(page.slug)} /> : null}
        </div>
        <div className="animate-rise md:sticky md:top-6 md:self-start" style={{ ["--delay" as string]: "0.28s" }}>
          {mango ? (
            <CheckoutBox mangoId={mango.id} title={String(mango.title)} price={price} type={String(mango.type)} cycle={mango.cycle as string | undefined} terms={mango.terms as string | undefined} successText={mango.successText as string | undefined} successButton={mango.successButton as string | undefined} redirectUrl={mango.redirectUrl as string | undefined} />
          ) : (
            <div className="rounded-2xl bg-white p-6 text-center text-[#6b6b7b] ring-1 ring-black/5">This offering isn&apos;t available right now.</div>
          )}
        </div>
      </section>
      <p className="pb-8 text-center text-[12px] text-[#9b9bab]">Powered by tag<span className="text-[#f2962c]">mango</span></p>
    </div>
  );
}
