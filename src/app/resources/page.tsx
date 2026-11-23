import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Resources from "@/components/nitienaa/Resources";
import { PageHero } from "@/components/nitienaa/kit";

export const metadata: Metadata = { title: "Resources", description: "Articles from Nitienaa, the latest post, and a free resource delivered to your inbox." };

export default function ResourcesPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Resources"
          segments={[{ text: "Notes on" }, { text: "being human", gradient: true }]}
          sub="Articles from Nitienaa, the latest post, and a free resource to start with."
          pills={[["Latest article", "article"], ["Blog", "blog"], ["Free resource", "free-resource"]]}
        />
        <Resources />
        <Footer />
      </main>
    </>
  );
}
