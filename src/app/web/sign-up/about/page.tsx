"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { ErrorText, OrangeButton } from "@/components/auth/fields";

const categories = ["Fitness & Health", "Finance & Trading", "Spirituality & Astrology", "Education & Exams", "Business & Marketing", "Art, Music & Dance", "Tech & Coding", "Other"];
const audiences = ["Just starting", "Under 10K", "10K – 100K", "100K – 1M", "1M+"];
const goals = ["Launch my first course", "Run a paid community", "Host live workshops", "1:1 coaching", "Move from another platform"];

function Chips({ options, value, onChange }: { options: string[]; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] transition ${value === o ? "border-[#fb8a1b] bg-orange-50 font-medium text-[#c25f00]" : "border-[#d9d9d9] text-ink/70 hover:border-ink/30"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function About() {
  const router = useRouter();
  const [category, setCategory] = useState<string>();
  const [audience, setAudience] = useState<string>();
  const [goal, setGoal] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function save(skip = false) {
    setLoading(true);
    const r = await fetch("/api/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(skip ? {} : { about: { category, audience, goal } }),
    });
    setLoading(false);
    if (r.status === 401) return router.push("/web/login");
    if (!r.ok) return setError("Something went wrong. Please try again.");
    router.push("/web/dashboard/getstarted");
  }

  return (
    <AuthLayout step={2}>
      <div className="max-w-[440px]">
        <h1 className="text-[30px] font-semibold leading-tight">Tell us about yourself</h1>
        <p className="mt-2 text-[14px] text-ink/80">We&apos;ll tailor your dashboard to what you do.</p>
        <div className="mt-8 space-y-6">
          <div>
            <p className="mb-2.5 text-[14px] font-medium">What do you create?</p>
            <Chips options={categories} value={category} onChange={setCategory} />
          </div>
          <div>
            <p className="mb-2.5 text-[14px] font-medium">How big is your audience?</p>
            <Chips options={audiences} value={audience} onChange={setAudience} />
          </div>
          <div>
            <p className="mb-2.5 text-[14px] font-medium">What do you want to do first?</p>
            <Chips options={goals} value={goal} onChange={setGoal} />
          </div>
          <ErrorText>{error}</ErrorText>
          <OrangeButton disabled={!category || !audience || !goal} loading={loading} onClick={() => save()}>
            Continue to dashboard
          </OrangeButton>
          <button className="w-full text-center text-[13px] text-ink/60 hover:text-ink" onClick={() => save(true)}>
            Skip for now
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
