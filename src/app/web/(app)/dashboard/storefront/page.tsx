"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { copy, patchMe, toast, useCollection, useMe } from "@/lib/client";
import { Btn, Panel, Title, Toggle, Walkthrough } from "@/components/dash/kit";
import { FormDrawer } from "@/components/dash/forms";
import { Icon } from "@/components/dash/icons";

function Inner() {
  const { me, setMe } = useMe();
  const mangoes = useCollection("mangoes");
  const params = useSearchParams();
  const [edit, setEdit] = useState(false);
  useEffect(() => { if (params.get("edit") === "1") setEdit(true); }, [params]);
  const s = (me.settings?.store || {}) as Record<string, unknown>;
  const url = typeof window !== "undefined" ? `${location.origin}/web/lite/store/${me.id}` : "";
  const hidden = (s.hidden as string[]) || [];
  const active = s.active !== false;

  return (
    <>
      <Walkthrough title="Setup your storefront" />
      <Panel className="p-5">
        <Title right={<Btn variant="black" onClick={() => setEdit(true)}>Edit storefront</Btn>}>Storefront</Title>
        <div className="mt-6 flex flex-col items-center rounded-[10px] border border-[#ededed] px-6 py-10 text-center">
          <span className={`grid h-14 w-14 place-items-center rounded-full ${active ? "bg-[#e9f9ee] text-[#00a400]" : "bg-[#f2f2f2] text-[#8c8c8c]"}`}><Icon name={active ? "check" : "close"} className="h-7 w-7" /></span>
          <p className="mt-3 text-[20px] font-semibold">{active ? "Your storefront is now active" : "Your storefront is turned off"}</p>
          <p className="mt-1 text-[13px] text-[#6b6b7b]">Your storefront link is given below.</p>
          <p className="mt-5 text-[13px] font-medium">Share storefront link</p>
          <div className="mt-2 flex w-full max-w-xl items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-dashed border-[#9fb7e0] bg-[#f5f8ff] px-3 py-2 text-left text-[13px] text-[#1677ff]">{url}</code>
            <Btn variant="soft" className="text-[#1677ff]" onClick={() => copy(url)}>COPY LINK</Btn>
          </div>
          <a href={`/web/lite/store/${me.id}`} target="_blank" rel="noreferrer" className="mt-4 text-[13px] text-[#1677ff] hover:underline">Open storefront ↗</a>
        </div>
        <div className="mt-6">
          <p className="mb-2 text-[15px] font-semibold">Mangoes on your storefront</p>
          <div className="divide-y divide-[#f0f0f0] rounded-[10px] border border-[#ededed]">
            {mangoes.rows.filter((m) => m.active).length === 0 && <p className="p-4 text-[13px] text-[#9b9bab]">No active mangoes yet.</p>}
            {mangoes.rows.filter((m) => m.active).map((m) => (
              <label key={m.id} className="flex items-center justify-between px-4 py-3 text-[14px]">
                {String(m.title)}
                <Toggle on={!hidden.includes(m.id)} onChange={async (v) => { const next = v ? hidden.filter((x) => x !== m.id) : [...hidden, m.id]; const r = await patchMe({ settings: { store: { ...s, hidden: next } } }); setMe(r.user); toast(v ? "Shown on storefront" : "Hidden from storefront"); }} label={`Show ${String(m.title)}`} />
              </label>
            ))}
          </div>
        </div>
      </Panel>
      {edit && (
        <FormDrawer
          title="Edit storefront"
          fields={[
            { key: "active", label: "Storefront active", type: "toggle" },
            { key: "name", label: "Display name", required: true, maxLength: 60 },
            { key: "tagline", label: "Tagline", maxLength: 120, placeholder: "e.g. Fitness coach · 5L+ lives impacted" },
            { key: "bio", label: "About you", type: "textarea" },
            { key: "avatar", label: "Profile photo URL", type: "url" },
            { key: "color", label: "Theme colour", type: "color" },
            { key: "instagram", label: "Instagram link", type: "url" },
            { key: "youtube", label: "YouTube link", type: "url" },
          ]}
          initial={{ active: true, name: me.name, color: "#f2962c", ...s }}
          submitLabel="Save"
          onClose={() => setEdit(false)}
          onSubmit={async (d) => { const r = await patchMe({ settings: { store: { ...s, ...d } } }); setMe(r.user); toast("Storefront updated"); }}
        />
      )}
    </>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
