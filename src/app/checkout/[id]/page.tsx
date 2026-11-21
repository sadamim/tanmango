import { notFound } from "next/navigation";
import CheckoutBox from "@/components/CheckoutBox";
import TrackView from "@/components/TrackView";
import { findMango } from "@/lib/public";

export const dynamic = "force-dynamic";

export default async function Checkout({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await findMango(id);
  if (!data) notFound();
  const { mango: m, creator } = data;
  const price = m.type === "Free" ? 0 : Number(m.discountPrice || m.price || 0);
  return (
    <div className="font-app min-h-screen bg-[#fff5ec] px-4 py-10 text-[#0f0f0f]">
      <TrackView kind="checkout" refId={m.id} />
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="animate-rise">
          {m.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={String(m.cover)} alt="" className="aspect-video w-full rounded-2xl object-cover" />
          ) : (
            <div className="grid aspect-video w-full place-items-center rounded-2xl bg-gradient-to-br from-[#ff6a00] to-[#f6bb22] text-[40px] font-bold text-white">{String(m.title).slice(0, 1)}</div>
          )}
          <p className="mt-4 text-[13px] text-[#6b6b7b]">by <b className="text-[#0f0f0f]">{creator?.name}</b></p>
          <h1 className="mt-1 text-[28px] font-bold">{String(m.title)}</h1>
          {m.description ? <p className="mt-2 whitespace-pre-wrap text-[#4a4a59]">{String(m.description)}</p> : null}
          <p className="mt-6 text-[11px] text-[#9b9bab]">You agree to share information entered on this page with the creator (owner of this page), adhering to applicable laws.</p>
        </div>
        <div className="animate-rise md:sticky md:top-6 md:self-start" style={{ ["--delay" as string]: "0.1s" }}>
          <CheckoutBox mangoId={m.id} title={String(m.title)} price={price} type={String(m.type)} cycle={m.cycle as string | undefined} terms={m.terms as string | undefined} successText={m.successText as string | undefined} successButton={m.successButton as string | undefined} redirectUrl={m.redirectUrl as string | undefined} />
        </div>
      </div>
    </div>
  );
}
