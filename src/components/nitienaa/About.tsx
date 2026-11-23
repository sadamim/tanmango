import Reveal from "../Reveal";
import { Avatar } from "../ui";
import { Photo, SubHead, TopicHead, card } from "./kit";

const values = ["[Value one]", "[Value two]", "[Value three]"];
const stories = [
  { theme: "Clarity", cohort: "1" },
  { theme: "Confidence", cohort: "1" },
  { theme: "Habits", cohort: "2" },
];
const proof = [["[#]", "learners completed"], ["[#]", "cohorts run"], ["[#%]", "completion rate"], ["[#]", "average rating"]];

/** Header topic "About": About Nitienaa + Stories and proof. */
export default function About() {
  return (
    <section id="about" className="relative scroll-mt-24 bg-white px-4 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <TopicHead
          eyebrow="About"
          segments={[{ text: "Meet" }, { text: "Nitienaa", gradient: true }]}
          sub="The person behind THE HUMAN OS™, and the learners who have been through it."
          pills={[["About Nitienaa", "about-nitienaa"], ["Stories and proof", "stories"]]}
        />

        <div className="mt-14 grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <Reveal><Photo label="[Portrait of Nitienaa — your photography]" className="aspect-[4/5] w-full" /></Reveal>
          <Reveal delay={0.15}>
            <SubHead id="about-nitienaa" eyebrow="About Nitienaa" title="[Headline about Nitienaa, from your content]"
              sub="[Short introduction: who Nitienaa is, who she works with and what THE HUMAN OS™ helps them change.]">
              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink/70">
                <p>[Paragraph 1 of Nitienaa&apos;s story — background and turning point.]</p>
                <p>[Paragraph 2 — what she learned, and how it became a method.]</p>
              </div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                {values.map((v, i) => (
                  <li key={v} className="rounded-2xl bg-[#f6f2ef] p-4">
                    <span className="font-display text-sm font-bold text-orange-500">0{i + 1}</span>
                    <p className="mt-1 font-semibold text-ink">{v}</p>
                  </li>
                ))}
              </ul>
            </SubHead>
          </Reveal>
        </div>

        <div className="mt-20 rounded-[32px] bg-[linear-gradient(180deg,#ffffff_0%,#f6f2ef_100%)] p-4 md:p-10">
          <SubHead id="stories" eyebrow="Stories and proof" title="Real people. Real cohorts. In their own words." sub="Every quote is shared with permission." />
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {stories.map((s, i) => (
              <li key={i}>
                <Reveal delay={i * 0.08} className="h-full">
                  <figure className={`${card} flex h-full flex-col gap-4`}>
                    <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">{s.theme}</span>
                    <blockquote className="text-[17px] leading-relaxed text-ink">“[Learner quote — supplied by you]”</blockquote>
                    <figcaption className="mt-auto flex items-center gap-3 text-sm">
                      <Avatar name="Learner Name" i={i} className="h-10 w-10 text-xs" />
                      <span><b className="text-ink">[Name]</b><br /><span className="text-ink/50">Cohort {s.cohort}</span></span>
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {proof.map(([n, l]) => (
              <li key={l} className="rounded-2xl bg-white p-5 text-center">
                <p className="text-mango font-display text-[32px] font-bold">{n}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink/50">{l}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
