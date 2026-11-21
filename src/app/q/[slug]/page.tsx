import { notFound } from "next/navigation";
import { PublicShell, QuizClient } from "@/components/growth/Public";
import { growthBySlug, publicGrowth } from "@/lib/growth/core";
import { DEFAULT_PATTERNS } from "@/lib/growth/model";

export const dynamic = "force-dynamic";
export const metadata = { title: "The Pattern Check" };

export default async function Quiz({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ src?: string }> }) {
  const { slug } = await params;
  const { src } = await searchParams;
  const g0 = await growthBySlug(slug);
  if (!g0) notFound();
  const g = publicGrowth(g0);
  const patterns = (g.quiz?.patterns?.length ? g.quiz.patterns : DEFAULT_PATTERNS).map((p) => ({ id: p.id, name: p.name, bullets: p.bullets.map((b) => ({ id: b.id, text: b.text })) }));
  return (
    <PublicShell coach={g.coachName} programme={g.programme}>
      <QuizClient slug={slug} patterns={patterns} consent={g.consentLine} src={src} programme={g.programme} />
    </PublicShell>
  );
}
