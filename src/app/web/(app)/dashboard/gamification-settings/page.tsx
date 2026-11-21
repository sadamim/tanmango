"use client";
import { useState } from "react";
import { patchMe, toast, useMe } from "@/lib/client";
import { Btn, Gate, Panel, Tabs, Title, Toggle, inputCls } from "@/components/dash/kit";

const ACTIVATIONS = [
  ["Show leaderboard to members", "leaderboard"],
  ["Show points on member profiles", "profilePoints"],
  ["Award badges automatically", "autoBadges"],
  ["Daily streaks", "streaks"],
  ["Celebrate milestones in the feed", "milestones"],
] as const;

function Settings() {
  const { me, setMe } = useMe();
  const g = (me.settings?.gamification || {}) as { act?: Record<string, boolean>; tags?: string[] };
  const [tab, setTab] = useState<"Activations" | "Tags">("Activations");
  const [tag, setTag] = useState("");
  async function save(next: Partial<typeof g>, msg = "Saved") {
    const r = await patchMe({ settings: { gamification: { ...g, ...next } } });
    setMe(r.user);
    toast(msg);
  }
  const tags = g.tags || [];
  return (
    <Panel className="p-5">
      <Title>Gamification Settings</Title>
      <div className="mt-3"><Tabs tabs={["Activations", "Tags"]} value={tab} onChange={setTab} /></div>
      {tab === "Activations" ? (
        <div className="mt-4 divide-y divide-[#f0f0f0] rounded-[10px] border border-[#ededed]">
          {ACTIVATIONS.map(([label, k]) => (
            <label key={k} className="flex items-center justify-between px-4 py-3 text-[14px]">{label}<Toggle on={g.act?.[k] ?? true} onChange={(v) => save({ act: { ...g.act, [k]: v } })} label={label} /></label>
          ))}
        </div>
      ) : (
        <div className="mt-4 max-w-xl">
          <p className="text-[13px] text-[#6b6b7b]">Tags group members (e.g. “Beginner”, “VIP”) so you can target them with broadcasts and paths.</p>
          <div className="mt-3 flex gap-2"><input className={inputCls} placeholder="New tag" value={tag} onChange={(e) => setTag(e.target.value)} /><Btn variant="black" onClick={() => { const t = tag.trim(); if (!t) return; if (tags.includes(t)) return toast("Tag already exists", "err"); save({ tags: [...tags, t] }, "Tag added"); setTag(""); }}>Add</Btn></div>
          <div className="mt-3 flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[#fdefdf] px-3 py-1 text-[13px] text-[#c7740f]">{t}<button aria-label={`Remove ${t}`} onClick={() => save({ tags: tags.filter((x) => x !== t) }, "Tag removed")}>×</button></span>)}{!tags.length && <span className="text-[13px] text-[#9b9bab]">No tags yet.</span>}</div>
        </div>
      )}
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="gamification-settings" title="Gamification Settings"><Settings /></Gate>;
}
