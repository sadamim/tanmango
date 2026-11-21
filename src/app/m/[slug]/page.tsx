import { notFound } from "next/navigation";
import { MasterclassClient, PublicShell } from "@/components/growth/Public";
import { growthBySlug, publicGrowth } from "@/lib/growth/core";
import { store } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Free masterclass" };

export default async function Masterclass({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ src?: string }> }) {
  const { slug } = await params;
  const { src } = await searchParams;
  const g0 = await growthBySlug(slug);
  if (!g0) notFound();
  const g = publicGrowth(g0);
  const all = await store.find("masterclasses", [["userId", g0.userId]]);
  const crm = await store.find("crm", [["userId", g0.userId]]);
  const list = all
    .filter((m) => m.published !== false && new Date(String(m.startsAt)).getTime() + Number(m.duration || 120) * 60000 > Date.now())
    .sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt)))
    .map((m) => ({ id: m.id, title: String(m.title), startsAt: String(m.startsAt), seats: m.seats ? Number(m.seats) : undefined, taken: crm.filter((c) => c.masterclassId === m.id).length, description: m.description ? String(m.description) : undefined }));
  return (
    <PublicShell coach={g.coachName} programme={g.programme}>
      <MasterclassClient slug={slug} list={list} consent={g.consentLine} src={src} />
    </PublicShell>
  );
}
