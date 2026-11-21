/* eslint-disable @next/next/no-img-element */
import { Arrow, PrimaryButton } from "./ui";
import Reveal from "./Reveal";
import SplitHeading from "./SplitHeading";

const B = "/tagmango/bento";

const cards = [
  { t: "Run challenges", d: "Engagement on autopilot. Members show up daily, and the next offer sells itself.", img: "feature-1-v6", span: "lg:col-span-3" },
  { t: "Build landing pages with AI", d: "Describe the offer. The page is live before you've finished your coffee.", img: "feature-2-v6", span: "lg:col-span-3" },
  { t: "Collect payments globally", d: "India or abroad, the right gateway picks itself. Rupees, dollars, instalments.", img: "feature-3-v6", span: "lg:col-span-2" },
  { t: "Host custom tools", d: "A tracker, a calculator, a thing only your learners get. Living inside your app.", img: "feature-4-v6", span: "lg:col-span-2" },
  { t: "Activate affiliates", d: "Let your members sell for you. Each one gets a link, a cut, and a reason to share.", img: "feature-5-v6", span: "lg:col-span-2" },
  { t: "Automate your emails", d: "Reminders, replays, win-backs. Written once, sent on their own.", img: "feature-6-v6", span: "lg:col-span-3" },
  { t: "Know your business", d: "Track what sold, what didn't, and who's gone quiet. Before it costs you.", img: "feature-7-v6", span: "lg:col-span-3" },
];

const STAGGER = [0, 0.08, 0, 0.08, 0.16, 0, 0.08];

export default function Features() {
  return (
    <section className="relative z-10 rounded-b-[32px] bg-[linear-gradient(180deg,#ffffff_0%,#f6f2ef_100%)] px-4 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center">
          <SplitHeading
            className="font-display text-[30px] font-bold leading-[1.15] tracking-tight text-ink md:text-[52px]"
            segments={[{ text: "80% of creators here" }, { text: "outgrow", gradient: true, br: true }, { text: "their first product." }]}
          />
          <Reveal delay={0.3}>
            <p className="mt-4 text-ink/60 md:text-lg">Because every tool it takes to scale is already built in.</p>
          </Reveal>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-6">
          {cards.map((c, k) => (
            <li key={c.t} className={c.span}>
              <Reveal delay={STAGGER[k]} className="h-full">
                <article className="group flex h-full flex-col gap-2 overflow-hidden rounded-[24px] bg-white p-2 lg:rounded-[32px]">
                  <div className="relative aspect-[612/364] w-full overflow-hidden rounded-[6px] bg-[#f6f2ef] md:rounded-[24px]">
                    <img src={`${B}/${c.img}.webp`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-[1.03]" />
                  </div>
                  <div className="px-3 pb-4 pt-3 md:px-4">
                    <h3 className="font-display text-[20px] font-semibold text-ink md:text-[24px]">{c.t}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink/60">{c.d}</p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}

          <li className="md:col-span-2 lg:col-span-6">
            <Reveal>
              <div className="relative isolate h-full overflow-hidden rounded-[24px] bg-white lg:min-h-[262px] lg:rounded-[32px]">
                <div className="flex h-full flex-col lg:flex-row">
                  <div className="relative z-10 flex flex-col justify-center p-6 md:p-10 lg:w-[426px]">
                    <h3 className="font-display text-[24px] font-bold leading-tight text-ink md:text-[30px]">Unlock your own Play Store and App Store apps.</h3>
                    <p className="mt-3 text-ink/60">Your icon, their home screen. We take care of Apple, Google and every update after.</p>
                    <PrimaryButton href="/demo" className="mt-6 w-fit !px-6 !py-3">
                      Book a Demo Call <Arrow />
                    </PrimaryButton>
                  </div>
                  <img src="/tagmango/store/strip-mobile-v3.webp" alt="" loading="lazy" className="w-full lg:hidden" />
                  <div className="hidden overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-[854px] lg:max-w-[calc(100%-426px)]">
                    <img src="/tagmango/store/visual-light-v3.webp" alt="" loading="lazy" className="h-full w-full object-cover object-center lg:object-right" />
                  </div>
                </div>
              </div>
            </Reveal>
          </li>
        </ul>
      </div>
    </section>
  );
}
