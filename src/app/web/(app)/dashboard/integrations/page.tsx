"use client";
import { useState } from "react";
import { api, copy, fmtDateTime, toast, useMe, type Me } from "@/lib/client";
import { Btn, Confirm, Panel, Title } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";

function Provider({ id, name, url }: { id: "zapier" | "pabbly"; name: string; url: string }) {
  const { me, setMe } = useMe();
  const key = ((me.settings?.apiKeys as Record<string, { key: string; createdAt: string }>) || {})[id];
  const [show, setShow] = useState(false);
  const [confirm, setConfirm] = useState(false);
  async function gen() {
    const r = await api<{ user: Me }>("/api/apikeys", "POST", { provider: id });
    setMe(r.user);
    setShow(true);
    toast(key ? "API key regenerated" : "API key generated");
  }
  return (
    <Panel className="p-5">
      <Title>{name}</Title>
      <p className="mt-3 text-[13px] font-medium">{name === "Zapier" ? "Zapier API Key" : "Pabbly API Key"}</p>
      {key ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="max-w-full truncate rounded-md border border-[#e1e1e1] bg-[#f7f7f8] px-3 py-2 font-mono text-[13px]">{show ? key.key : key.key.slice(0, 10) + "•".repeat(24)}</code>
          <Btn variant="soft" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</Btn>
          <Btn variant="soft" onClick={() => copy(key.key, "API key")}>Copy</Btn>
          <Btn variant="black" icon="refresh" onClick={() => setConfirm(true)}>Regenerate</Btn>
          <span className="w-full text-[12px] text-[#9b9bab]">Created {fmtDateTime(key.createdAt)}</span>
        </div>
      ) : (
        <Btn variant="black" className="mt-2" onClick={gen}><Icon name="refresh" className="h-4 w-4" />Generate API Key</Btn>
      )}
      <p className="mt-3 text-[13px] text-[#4a4a59]"><a href={url} target="_blank" rel="noreferrer" className="text-[#1677ff] hover:underline">Click Here</a> to use our {id} app.</p>
      {confirm && <Confirm title="Regenerate API key?" text={`Any ${name} workflows using the old key will stop working until you update them.`} okLabel="Regenerate" danger={false} onOk={gen} onClose={() => setConfirm(false)} />}
    </Panel>
  );
}

export default function Integrations() {
  return (
    <div className="space-y-5">
      <Provider id="zapier" name="Zapier" url="https://zapier.com/apps" />
      <Provider id="pabbly" name="Pabbly Connect" url="https://www.pabbly.com/connect/" />
    </div>
  );
}
