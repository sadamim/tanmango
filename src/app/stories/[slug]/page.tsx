import { notFound } from "next/navigation";
import { PublicShell } from "@/components/growth/Public";
import { growthBySlug } from "@/lib/growth/core";
import { store } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stories and proof" };

/** Only real, named testimonials with permission, approved by the coach. */
export default async function Stories({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = await growthBySlug(slug);
  if (!g) notFound();
  const list = (await store.find("testimonials", [["userId", g.userId]])).filter((t) => t.status === "approved" && t.permission === true).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return (
    <PublicShell coach={g.coachName} programme={g.programme} narrow={false}>
      <h1 className="text-center text-[30px] font-semibold">Stories and proof</h1>
      <div className="mt-8 space-y-5">
        {list.map((t) => (
          <figure key={t.id} className="rounded-xl border border-[#e6e6e0] bg-white p-5">
            {((t.answers as string[]) || []).filter(Boolean).map((a, i) => <blockquote key={i} className="text-[16px] leading-relaxed text-[#333]">{a}</blockquote>)}
            <figcaption className="mt-3 text-[14px] font-semibold">{String(t.name)}</figcaption>
          </figure>
        ))}
        {!list.length && <p className="text-center text-[#888]">Stories will appear here.</p>}
      </div>
    </PublicShell>
  );
}
