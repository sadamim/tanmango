import { notFound } from "next/navigation";
import { CallClient, PublicShell } from "@/components/growth/Public";
import { growthBySlug, publicGrowth } from "@/lib/growth/core";
import { store } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book a conversation" };

export default async function Call({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ src?: string; e?: string }> }) {
  const { slug } = await params;
  const { src, e } = await searchParams;
  const g0 = await growthBySlug(slug);
  if (!g0) notFound();
  const g = publicGrowth(g0);
  const slots = (await store.find("slots", [["userId", g0.userId]])).filter((s) => !s.leadId && new Date(String(s.startsAt)).getTime() > Date.now() + 36e5).sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt))).slice(0, 80).map((s) => ({ id: s.id, startsAt: String(s.startsAt) }));
  return (
    <PublicShell coach={g.coachName} programme={g.programme}>
      <CallClient slug={slug} slots={slots} consent={g.consentLine} src={src} email={e} />
    </PublicShell>
  );
}
