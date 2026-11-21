import Link from 'next/link';
import { Ph, Crumbs } from '@/components/coach/ui';

import { href } from '@/lib/coach/content';
export const metadata = {
  title: 'Press and media',
  description: 'Press coverage, bios, photos and the speaker kit for Nitienaa and THE HUMAN OS™.',
};

const coverage = ['Interview', 'Podcast', 'Feature', 'Talk'];

export default function Press() {
  return (
    <>
      <section className="sec sm">
        <div className="wrap stack lg">
          <Crumbs items={[{ l: 'Home', h: href('/') }, { l: 'Press and media' }]} />
          <p className="eyebrow">Press and media</p>
          <h1 className="h1" style={{ maxWidth: 900 }}>Press, features and speaker kit</h1>
          <p className="lead">For interviews, podcasts and speaking requests, download the media kit or contact us directly.</p>
          <div className="row">
            {/* TODO: put media-kit.zip in /public */}
            <a className="btn pri" href="/media-kit.zip" download>Download media kit (ZIP)</a>
            <Link className="btn" href={href("/contact")}>Media enquiry</Link>
          </div>
        </div>
      </section>

      <section className="sec sm alt">
        <div className="wrap stack lg">
          <p className="eyebrow">As featured in</p>
          <div className="g4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))' }}>
            {[1, 2, 3, 4, 5].map((i) => <Ph key={i} label="[PUBLICATION LOGO]" h={88} />)}
          </div>
        </div>
      </section>

      <section className="sec sm">
        <div className="wrap stack lg">
          <h2 className="h2">Coverage</h2>
          <div className="stack" style={{ gap: 0 }}>
            {coverage.map((t) => (
              <a key={t} href="#" className="row between cardlink" style={{ padding: '24px 0', borderBottom: '1px solid #D6DCD8', gap: 20 }}>
                <span className="row" style={{ gap: 20 }}>
                  <span className="tag">{t}</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600 }}>[Headline of the feature]</span>
                </span>
                <span className="small muted">[Publication] · [Date] ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sm alt">
        <div className="wrap g2">
          <div className="stack lg">
            <h2 className="h2">Bios</h2>
            <div className="card stack"><p className="eyebrow">Short bio · 50 words</p><p>[Short bio for event listings.]</p></div>
            <div className="card stack"><p className="eyebrow">Long bio · 150 words</p><p>[Long bio for introductions and press.]</p></div>
          </div>
          <div className="stack lg">
            <h2 className="h2">Photos and assets</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
              <Ph label="[HEADSHOT]" h={200} /><Ph label="[ON STAGE]" h={200} />
              <Ph label="[LOGO — light]" h={120} /><Ph label="[LOGO — dark]" h={120} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
