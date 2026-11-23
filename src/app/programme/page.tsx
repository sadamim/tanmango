import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Programme from "@/components/nitienaa/Programme";
import { PageHero } from "@/components/nitienaa/kit";
import { getCoach } from "@/lib/coach/server";

export const metadata: Metadata = { title: "THE HUMAN OS™ — the 6-week programme", description: "Six weeks of live classes, lessons and assignments with Nitienaa: the week-by-week plan, the method and upcoming events." };
// Live price and cohort come from the coach's programme mango.
export const dynamic = "force-dynamic";

export default async function ProgrammePage() {
  const { programme } = await getCoach();
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Programme"
          segments={[{ text: "THE HUMAN" }, { text: "OS™", gradient: true }]}
          sub={`A live, guided ${programme.weeks}-week cohort programme. ${programme.description}`}
          pills={[["THE HUMAN OS™", "the-human-os"], ["The method", "method"], ["Events and workshops", "events"]]}
        />
        <Programme programme={programme} />
        <Faq />
        <Footer />
      </main>
    </>
  );
}
