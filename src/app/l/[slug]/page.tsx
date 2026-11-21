import { notFound } from "next/navigation";
import { PublicShell } from "@/components/growth/Public";
import { growthBySlug, publicGrowth } from "@/lib/growth/core";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const g = await growthBySlug((await params).slug);
  return { title: g?.coachName || "Links" };
}

export default async function Bio({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g0 = await growthBySlug(slug);
  if (!g0) notFound();
  const g = publicGrowth(g0);
  const buttons = (g.bio?.buttons || []).filter((b) => b.label && b.url);
  return (
    <PublicShell programme={g.programme}>
      <div className="text-center">
        <h1 className="text-[28px] font-semibold">{g.bio?.headline || g.coachName}</h1>
        {g.bio?.sub && <p className="mt-2 text-[15px] text-[#555]">{g.bio.sub}</p>}
      </div>
      <div className="mt-8 space-y-3">
        {buttons.map((b) => <a key={b.id} href={`/api/bio/${slug}/${b.id}`} className="block rounded-xl bg-[#111] px-5 py-4 text-center text-[16px] font-medium text-white">{b.label}</a>)}
        {!buttons.length && <p className="text-center text-[#888]">No links yet.</p>}
      </div>
    </PublicShell>
  );
}
