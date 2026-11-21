import Link from 'next/link';
import { Ph, Crumbs } from '@/components/coach/ui';
import { BlogGrid } from '@/components/coach/Filters';
import { posts , href } from '@/lib/coach/content';

export const metadata = {
  title: 'Blog',
  description: 'Articles from Nitienaa on clarity, habits and the inner operating system we all run on.',
};

export default function Blog() {
  const featured = posts.find((p) => p.featured) || posts[0];
  const rest = posts.filter((p) => p !== featured);
  return (
    <>
      <section className="sec sm">
        <div className="wrap stack lg">
          <Crumbs items={[{ l: 'Home', h: href('/') }, { l: 'Resources' }, { l: 'Blog' }]} />
          <div className="stack"><p className="eyebrow">The blog</p><h1 className="h1">Notes on being human</h1></div>
        </div>
      </section>

      <section className="sec sm" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Link href={href(`/blog/${featured.slug}`)} className="card g2 cardlink" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
            <Ph label="[FEATURED POST IMAGE — migrated]" h={380} style={{ borderRadius: 0, border: 0 }} />
            <div className="stack lg" style={{ padding: 'clamp(24px, 4vw, 48px)', justifyContent: 'center' }}>
              <span className="tag sun" style={{ alignSelf: 'flex-start' }}>Featured</span>
              <h2 className="h2">{featured.title}</h2>
              <p className="muted">{featured.excerpt}</p>
              <p className="small muted">{featured.date} · {featured.read}</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="sec sm alt">
        <div className="wrap stack lg">
          <BlogGrid posts={rest} />
          <nav className="row" aria-label="Pagination" style={{ justifyContent: 'center' }}>
            <span className="btn sm dk" aria-current="page">1</span>
            <span className="btn sm" aria-disabled="true">2</span>
            <span className="btn sm" aria-disabled="true">Next</span>
          </nav>
        </div>
      </section>

      <section className="sec sm">
        <div className="wrap">
          <div className="card row between" style={{ background: '#13212B', color: '#FFFFFF', borderColor: '#13212B', padding: 'clamp(24px, 4vw, 48px)' }}>
            <div className="stack" style={{ maxWidth: 560 }}><h2 className="h2">Get the free resource</h2><p style={{ color: '#C3CED3' }}>[Lead magnet one-line promise.]</p></div>
            <Link className="btn pri" href={href("/free-resource")}>Download it free</Link>
          </div>
        </div>
      </section>
    </>
  );
}
