"use client";

const compact = (n: number, money: boolean) => {
  const v = Math.abs(n) >= 1e7 ? `${(n / 1e7).toFixed(1)}Cr` : Math.abs(n) >= 1e5 ? `${(n / 1e5).toFixed(1)}L` : Math.abs(n) >= 1e3 ? `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}k` : String(Math.round(n));
  return money ? `₹${v}` : v;
};

export type Series = { name: string; color: string; values: number[] };

/** Smooth-ish line chart with area fill under the first series. Pure SVG, no dependencies. */
export function LineChart({ labels, series, height = 220, money = false }: { labels: string[]; series: Series[]; height?: number; money?: boolean }) {
  const W = 760, H = height, L = 44, R = 12, T = 12, B = 26;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const x = (i: number) => L + (i / Math.max(1, labels.length - 1)) * (W - L - R);
  const y = (v: number) => H - B - (v / top) * (H - B - T);
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const gid = `g${series[0]?.color.replace("#", "")}${height}`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={series.map((s) => s.name).join(", ")}>
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={series[0]?.color} stopOpacity=".22" />
            <stop offset="1" stopColor={series[0]?.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={L} x2={W - R} y1={y(top * f)} y2={y(top * f)} stroke="#000" strokeOpacity=".06" />
            <text x={L - 8} y={y(top * f) + 4} fontSize="10" fill="#9b9bab" textAnchor="end">{compact(top * f, money)}</text>
          </g>
        ))}
        {series[0] && <path d={`${path(series[0].values)} L${x(labels.length - 1)},${y(0)} L${x(0)},${y(0)}Z`} fill={`url(#${gid})`} />}
        {series.map((s) => (
          <g key={s.name}>
            <path d={path(s.values)} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" className="[stroke-dasharray:4000] [stroke-dashoffset:4000] animate-[draw_1.2s_var(--ease-out-expo)_forwards]" />
            {s.values.map((v, i) => (v ? <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="#fff" stroke={s.color} strokeWidth="2"><title>{`${labels[i]} · ${s.name}: ${money ? "₹" : ""}${Math.round(v).toLocaleString("en-IN")}`}</title></circle> : null))}
          </g>
        ))}
        {labels.map((l, i) => (i % Math.max(1, Math.ceil(labels.length / 7)) === 0 ? <text key={l} x={x(i)} y={H - 8} fontSize="10" fill="#9b9bab" textAnchor="middle">{new Date(l).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</text> : null))}
      </svg>
      <style>{`@keyframes draw{to{stroke-dashoffset:0}}`}</style>
      {series.length > 1 && (
        <div className="mt-1 flex justify-center gap-5 text-[12px] text-[#4a4a59]">
          {series.map((s) => <span key={s.name} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name}</span>)}
        </div>
      )}
    </div>
  );
}

/** Horizontal bars with a label, a value and an optional sub-label. */
export function HBar({ items }: { items: { label: string; value: number; text?: string; sub?: string; color: string }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-4">
      {items.map((i) => (
        <div key={i.label}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="font-medium">{i.label}{i.sub && <span className="ml-2 text-[12px] font-normal text-[#9b9bab]">{i.sub}</span>}</span>
            <b>{i.text ?? i.value}</b>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f0f0f0]">
            <div className="h-full rounded-full transition-all duration-700 [transition-timing-function:var(--ease-out-expo)]" style={{ width: `${(i.value / max) * 100}%`, background: i.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
