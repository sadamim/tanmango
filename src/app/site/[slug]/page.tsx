import { notFound } from "next/navigation";
import SiteRender, { type Block } from "@/components/dash/SiteRender";
import TrackView from "@/components/TrackView";
import { findSite } from "@/lib/public";

export const dynamic = "force-dynamic";

export default async function Site({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await findSite(slug);
  if (!site) notFound();
  return (
    <>
      <TrackView kind="site" refId={site.id} />
      <SiteRender blocks={(site.blocks as Block[]) || []} color={String(site.color || "#f2962c")} />
    </>
  );
}
