import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import { findEvent } from "@/lib/public";

export const dynamic = "force-dynamic";

export default async function Book({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await findEvent(id);
  if (!data) notFound();
  return (
    <div className="font-app min-h-screen bg-[#fff5ec] px-4 py-12 text-[#0f0f0f]">
      <div className="mx-auto max-w-2xl">
        <p className="text-center text-[13px] uppercase tracking-[0.2em] text-[#6b6b7b]">{data.creator?.name}</p>
        <h1 className="mt-1 text-center text-[28px] font-bold">{data.ev.title}</h1>
        <p className="mt-1 text-center text-[14px] text-[#6b6b7b]">1-1 consultation · {data.ev.duration} minutes</p>
        {data.ev.description && <p className="mx-auto mt-3 max-w-lg text-center text-[14px] text-[#4a4a59]">{data.ev.description}</p>}
        <div className="mt-8"><BookingForm eventId={data.ev.id} slots={data.slots} /></div>
      </div>
    </div>
  );
}
