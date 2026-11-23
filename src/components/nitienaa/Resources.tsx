import Link from "next/link";
import Reveal from "../Reveal";
import { Arrow } from "../ui";
import { posts } from "@/lib/coach/content";
import LeadForm from "./LeadForm";
import { Photo, SubHead, TopicHead, card } from "./kit";

/** Header topic "Resources": Blog + Latest article + Free resource. */
export default function Resources() {
  const featured = posts.find((p) => p.featured) || posts[0];
  const rest = posts.filter((p) => p !== featured).slice(0, 3);
  return (
    <section id="resources" className="relative scroll-mt-24 bg-[linear-gradient(180deg,#ffffff_0%,#f6f2ef_100%)] px-4 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <TopicHead
          eyebrow="Resources"
          segments={[{ text: "Notes on" }, { text: "being human", gradient: true }]}
          sub="Articles from Nitienaa, the latest post, and a free resource to start with."
          pills={[["Latest article", "article"], ["Blog", "blog"], ["Free resource", "free-resource"]]}
        />

        {/* Latest article */}
        <div className="mt-14">
          <SubHead id="article" eyebrow="Latest article" title={featured.title} />
          <Reveal>
            <Link href={`/nitienaa/blog/${featured.slug}`} className="group mt-6 grid overflow-hidden rounded-[32px] bg-white p-2 md:grid-cols-2">
              <Photo label="[Featured post image — migrated]" className="aspect-[16/10] w-full md:aspect-auto md:min-h-[320px]" />
              <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
                <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">{featured.category}</span>
                <p className="text-ink/60">{featured.excerpt}</p>
                <p className="text-sm text-ink/50">Nitienaa · {featured.date} · {featured.read}</p>
                <span className="inline-flex w-fit items-center gap-2 font-semibold text-ink group-hover:underline">Read the article <Arrow /></span>
              </div>
            </Link>
          </Reveal>
        </div>

        {/* Blog */}
        <div className="mt-20">
          <SubHead id="blog" eyebrow="Blog" title="More articles" sub="All existing posts, moved across with their images." />
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {rest.map((p, i) => (
              <li key={p.slug}>
                <Reveal delay={i * 0.08} className="h-full">
                  <Link href={`/nitienaa/blog/${p.slug}`} className="group flex h-full flex-col gap-2 rounded-[24px] bg-white p-2 md:rounded-[32px]">
                    <Photo label="[Migrated image]" className="aspect-[16/10] w-full" />
                    <div className="px-3 pb-4 pt-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">{p.category}</p>
                      <h4 className="mt-1 font-display text-lg font-semibold text-ink group-hover:underline">{p.title}</h4>
                      <p className="mt-1 text-sm text-ink/50">{p.date} · {p.read}</p>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        {/* Free resource */}
        <div id="free-resource" className="mt-20 grid scroll-mt-28 items-center gap-8 rounded-[32px] bg-white p-4 md:grid-cols-2 md:p-10">
          <div>
            <SubHead id="free-resource-intro" eyebrow="Free resource" title="[Lead magnet title]" sub="[What the reader gets and the result it helps them reach.] Delivered to your inbox, with an optional WhatsApp confirmation." />
            <ul className="mt-6 space-y-2 text-[15px] text-ink/70">
              {["one", "two", "three"].map((n) => <li key={n} className="flex gap-3"><span className="text-orange-500">✓</span>[What is inside — point {n}]</li>)}
            </ul>
          </div>
          <div className={`${card} border border-black/5`}><LeadForm /></div>
        </div>
      </div>
    </section>
  );
}
