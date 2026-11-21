import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Ph, Crumbs, Avatar } from '@/components/coach/ui';
import ShareButtons from '@/components/coach/ShareButtons';
import { posts , href } from '@/lib/coach/content';

// Article template — every migrated blog post renders through this file.
export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt, openGraph: { type: 'article', title: post.title, description: post.excerpt } };
}

export default async function Article({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article>
        <header className="sec sm">
          <div className="narrow stack lg">
            <Crumbs items={[{ l: 'Home', h: href('/') }, { l: 'Blog', h: href('/blog') }, { l: post.category }]} />
            <span className="tag" style={{ alignSelf: 'flex-start' }}>{post.category}</span>
            <h1 className="h2" style={{ fontSize: 'clamp(34px, 5vw, 56px)' }}>{post.title}</h1>
            <p className="lead">[Standfirst: one or two sentences summarising the article.]</p>
            <div className="row" style={{ gap: 14 }}>
              <Avatar />
              <span className="small"><strong>Nitienaa</strong><br /><span className="muted">{post.date} · {post.read}</span></span>
            </div>
          </div>
        </header>

        <div className="wrap"><Ph label="[ARTICLE HERO IMAGE — migrated with the post]" h={520} /></div>

        <div className="sec sm">
          <div className="narrow prose">
            <p>[Opening paragraph of the migrated article.]</p>
            <h2>[Section heading — H2]</h2>
            <p>[Body paragraph.]</p>
            <ul><li>[List item]</li><li>[List item]</li><li>[List item]</li></ul>
            <blockquote style={{ margin: '32px 0', padding: '28px 32px', background: '#F3F5F2', borderRadius: 18, fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, lineHeight: 1.35 }}>
              “[Pull quote from the article]”
            </blockquote>
            <h3>[Sub-heading — H3]</h3>
            <p>[Body paragraph.]</p>
            <figure style={{ margin: '32px 0' }}>
              <Ph label="[INLINE IMAGE]" h={320} />
              <figcaption className="small muted" style={{ marginTop: 10 }}>[Image caption]</figcaption>
            </figure>
            <p>[Closing paragraph.]</p>
          </div>
        </div>

        <div className="narrow stack lg" style={{ paddingBottom: 64 }}>
          <div className="row" style={{ gap: 8 }}><span className="small muted">Tags:</span><span className="tag">[tag]</span><span className="tag">[tag]</span></div>
          <ShareButtons title={post.title} />
          <div className="card flat row" style={{ gap: 20, alignItems: 'flex-start' }}>
            <Avatar size={80} />
            <div className="stack" style={{ flex: '1 1 300px', gap: 8 }}>
              <p className="eyebrow">About the author</p>
              <p><strong>Nitienaa</strong> — [one-line author bio].</p>
              <Link href={href("/about")}>More about Nitienaa</Link>
            </div>
          </div>
          <div className="card stack" style={{ background: '#F0A830', borderColor: '#F0A830' }}>
            <h2 className="h3">Ready to go deeper?</h2>
            <p>THE HUMAN OS™ is a 6-week live cohort programme. Next cohort starts [START DATE].</p>
            <div className="row"><Link className="btn dk sm" href={href("/programme")}>See the programme</Link><Link className="btn sm" href={href("/free-resource")}>Free resource</Link></div>
          </div>
        </div>
      </article>

      <section className="sec sm alt">
        <div className="wrap stack lg">
          <h2 className="h3">Related articles</h2>
          <div className="g3">
            {related.map((p) => (
              <Link key={p.slug} href={href(`/blog/${p.slug}`)} className="stack cardlink">
                <Ph label="[IMAGE]" h={180} />
                <h3 className="h3" style={{ fontSize: 19 }}>{p.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
