import { notFound } from "next/navigation";
import { PublicShell, TestimonialClient } from "@/components/growth/Public";
import { growthBySlug } from "@/lib/growth/core";
import { store } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Share your experience", robots: { index: false } };

export default async function Testimonial({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ l?: string }> }) {
  const { slug } = await params;
  const { l } = await searchParams;
  const g = await growthBySlug(slug);
  const lead = l ? await store.get("crm", l) : null;
  if (!g || !lead || lead.userId !== g.userId) notFound();
  return (
    <PublicShell coach={g.coachName} programme={g.programme}>
      <TestimonialClient slug={slug} lead={lead.id} name={String(lead.name)} />
    </PublicShell>
  );
}
