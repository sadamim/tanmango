import type { Metadata } from "next";
import "./coach.css";
import Header from "@/components/coach/Header";
import Footer from "@/components/coach/Footer";
import { hosFonts } from "@/components/coach/fonts";

export const metadata: Metadata = {
  title: { default: "Nitienaa | THE HUMAN OS™", template: "%s | Nitienaa" },
  description: "THE HUMAN OS™ is a live 6-week cohort programme with Nitienaa: live classes, lessons, assignments and a certificate.",
  openGraph: { siteName: "Nitienaa", type: "website", locale: "en_IN" },
};

export default function CoachSiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={hosFonts}>
      <a href="#main" className="skip">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
