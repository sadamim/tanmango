import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import About from "@/components/nitienaa/About";
import { PageHero } from "@/components/nitienaa/kit";

export const metadata: Metadata = { title: "About Nitienaa", description: "Meet Nitienaa, the person behind THE HUMAN OS™, and read stories from learners who completed it." };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="About"
          segments={[{ text: "Meet" }, { text: "Nitienaa", gradient: true }]}
          sub="The person behind THE HUMAN OS™, and the learners who have been through it."
          pills={[["About Nitienaa", "about-nitienaa"], ["Stories and proof", "stories"]]}
        />
        <About />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}
