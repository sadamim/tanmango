'use client';

import { useEffect, useState } from 'react';

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  useEffect(() => { setUrl(window.location.href); }, []);
  const enc = encodeURIComponent;
  return (
    <div className="row" style={{ gap: 8 }}>
      <span className="small muted">Share:</span>
      <a className="btn sm" href={`https://wa.me/?text=${enc(title + ' ' + url)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a className="btn sm" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <button
        className="btn sm"
        onClick={async () => {
          try { await navigator.clipboard.writeText(window.location.href); } catch {}
          setCopied(true);
        }}
      >
        {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  );
}
