import { notFound } from "next/navigation";
import VideoRoom from "@/components/growth/VideoRoom";
import { videoDomain } from "@/lib/video";

export const dynamic = "force-dynamic";
export const metadata = { title: "Video call", robots: { index: false } };

export default async function Room({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-z0-9_-]{6,60}$/i.test(token)) notFound();
  return <VideoRoom roomURL={videoDomain() ? `${videoDomain()}/${token}` : ""} />;
}
