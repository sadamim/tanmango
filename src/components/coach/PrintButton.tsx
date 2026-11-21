'use client';

export default function PrintButton({ label = 'Download receipt (PDF)' }: { label?: string }) {
  return (
    <button className="btn" onClick={() => window.print()}>
      {label}
    </button>
  );
}
