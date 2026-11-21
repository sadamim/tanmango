import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import PricingPlans from "@/components/PricingPlans";
import SplitHeading from "@/components/SplitHeading";

export const metadata: Metadata = { title: "Pricing Plans for Creators & Communities" };

export default function Pricing() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-ink px-4 pb-24 pt-36 text-center text-white">
          <div className="pointer-events-none absolute -bottom-40 left-1/2 h-72 w-[900px] -translate-x-1/2 rounded-[50%] bg-[#ff6a00]/30 blur-[90px]" />
          <SplitHeading
            as="h1"
            auto
            delay={0.1}
            className="relative font-display text-[36px] font-bold leading-[1.1] tracking-tight md:text-[60px]"
            segments={[{ text: "The Last Pricing Page", br: true }, { text: "Before Your First Launch", gradient: true }]}
          />
          <p className="animate-rise relative mt-5 text-white/70 md:text-lg" style={{ ["--delay" as string]: "0.5s" }}>Pick your setup, power it with a plan. Simple.</p>
          <p style={{ ["--delay" as string]: "0.6s" }} className="ai-border animate-rise relative mx-auto mt-6 w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
            ✨ AI features just landed — add them to any plan. Yes, even Basic.
          </p>
        </section>
        <PricingPlans />
        <Testimonials />
        <Faq />
        <Footer />
      </main>
    </>
  );
}
