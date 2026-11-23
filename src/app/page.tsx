import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductTabs from "@/components/ProductTabs";
import OnePlace from "@/components/OnePlace";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProductTabs />
        <OnePlace />
        <Features />
        <Testimonials />
        <Faq />
        <Footer />
      </main>
    </>
  );
}
