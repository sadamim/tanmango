"use client";
import { patchMe, toast, useMe } from "@/lib/client";
import { Gate, Panel, Title, Toggle } from "@/components/dash/kit";

const DEFAULT_POINTS: [string, number][] = [
  ["Daily login", 5],
  ["Create a post", 10],
  ["Comment on a post", 3],
  ["Like a post", 1],
  ["Attend a workshop", 25],
  ["Complete a course chapter", 5],
  ["Complete a course", 50],
  ["Purchase a mango", 20],
  ["Refer a friend who purchases", 100],
];

function Points() {
  const { me, setMe } = useMe();
  const rules = (me.settings?.points || {}) as Record<string, { pts: number; on: boolean }>;
  const get = (k: string, d: number) => rules[k] || { pts: d, on: true };
  async function set(k: string, d: number, patch: Partial<{ pts: number; on: boolean }>) {
    const r = await patchMe({ settings: { points: { ...rules, [k]: { ...get(k, d), ...patch } } } });
    setMe(r.user);
    toast("Points updated");
  }
  return (
    <Panel className="p-5">
      <Title sub="Members earn points for activity. Points drive the leaderboard and badges.">Points</Title>
      <div className="mt-4 divide-y divide-[#f0f0f0] rounded-[10px] border border-[#ededed]">
        {DEFAULT_POINTS.map(([k, d]) => {
          const r = get(k, d);
          return (
            <div key={k} className="flex items-center gap-3 px-4 py-3">
              <span className="flex-1 text-[14px]">{k}</span>
              <input type="number" min={0} max={1000} className="h-9 w-24 rounded-md border border-[#e1e1e1] px-2 text-[14px] outline-none focus:border-[#f2962c]" defaultValue={r.pts} onBlur={(e) => { const v = Math.max(0, Math.min(1000, Number(e.target.value) || 0)); if (v !== r.pts) set(k, d, { pts: v }); }} aria-label={`${k} points`} />
              <span className="w-10 text-[12px] text-[#6b6b7b]">pts</span>
              <Toggle on={r.on} onChange={(v) => set(k, d, { on: v })} label={`Enable ${k}`} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="points" title="Points"><Points /></Gate>;
}
