import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductTabs from "@/components/ProductTabs";
import OnePlace from "@/components/OnePlace";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import About from "@/components/nitienaa/About";
import Programme from "@/components/nitienaa/Programme";
import Resources from "@/components/nitienaa/Resources";
import ApplyEnrol from "@/components/nitienaa/ApplyEnrol";
import { getCoach } from "@/lib/coach/server";

// Live price and cohort come from the coach's programme mango.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { programme, mangoId } = await getCoach();
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProductTabs />
        <OnePlace />
        <Features />
        {/* Header topics, each with its own sections */}
        <About />
        <Programme programme={programme} />
        <Resources />
        <ApplyEnrol programme={programme} mangoId={mangoId} />
        <Testimonials />
        <Faq />
        <Footer />
      </main>
    </>
  );
}
