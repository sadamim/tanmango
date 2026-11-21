import type { Metadata } from "next";
import "../nitienaa/coach.css";
import { hosFonts } from "@/components/coach/fonts";

export const metadata: Metadata = { title: "Learning portal | THE HUMAN OS™", robots: { index: false } };

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className={hosFonts}>{children}</div>;
}
