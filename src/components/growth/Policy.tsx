import Link from "next/link";

export function Policy({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-10 text-[#171717]" style={{ fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
      <article className="mx-auto max-w-2xl space-y-4 text-[15px] leading-relaxed [&_h2]:mt-6 [&_h2]:text-[18px] [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6">
        <h1 className="text-[28px] font-semibold">{title}</h1>
        <p className="rounded-lg bg-[#f1efe8] p-3 text-[13px] text-[#555]">Template text for you to review with a lawyer and edit before launch. Replace the bracketed items.</p>
        {children}
        <p className="pt-6 text-[13px] text-[#777]"><Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link> · <Link href="/refund-policy" className="underline">Refund policy</Link></p>
      </article>
    </div>
  );
}
