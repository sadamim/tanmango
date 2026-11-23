import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import ApplyEnrol from "@/components/nitienaa/ApplyEnrol";
import { PageHero } from "@/components/nitienaa/kit";
import { getCoach } from "@/lib/coach/server";

export const metadata: Metadata = { title: "Apply and enrol", description: "Apply for THE HUMAN OS™, pay securely with Razorpay, and see what happens after you enrol." };
// Live price and cohort come from the coach's programme mango.
export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const { programme, mangoId, demo } = await getCoach();
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Apply and enrol"
          segments={[{ text: "Secure your seat in" }, { text: `Cohort ${programme.cohort}`, gradient: true }]}
          sub={`Next cohort starts ${programme.startDate}. Seats are limited per cohort.`}
          pills={[["Apply", "apply"], ["Enrol and pay", "enrol"], ["Confirmation", "confirmation"]]}
        />
        <ApplyEnrol programme={programme} mangoId={mangoId} demo={demo} />
        <Faq />
        <Footer />
      </main>
    </>
  );
}
