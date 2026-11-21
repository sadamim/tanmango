"use client";
import { useCallback, useEffect, useState } from "react";
import { api, fmtDateTime, patchMe, toast, useMe } from "@/lib/client";
import { Btn, Confirm, Field, Gate, Panel, Pill, Title, inputCls } from "@/components/dash/kit";

type S = { id: string; userAgent: string; ip: string; createdAt: string; current: boolean };

const device = (ua: string) => {
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "Unknown OS";
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : /curl|python|node/i.test(ua) ? "API client" : "Browser";
  return `${br} on ${os}`;
};

function Sessions() {
  const { me, setMe } = useMe();
  const [list, setList] = useState<S[]>([]);
  const [limit, setLimit] = useState(String(me.settings?.maxDevices || ""));
  const [confirm, setConfirm] = useState<"others" | string | null>(null);
  const load = useCallback(async () => setList((await api<{ sessions: S[] }>("/api/sessions")).sessions), []);
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Panel className="p-5">
        <Title sub="See where you're signed in and sign out devices you don't recognise.">Manage Login Sessions</Title>
        <div className="mt-4 flex max-w-xl items-end gap-2">
          <Field label="Maximum devices signed in at once" hint="When a new login exceeds this, the oldest session is signed out. Leave empty for no limit."><input type="number" min={1} max={10} className={inputCls} value={limit} onChange={(e) => setLimit(e.target.value)} /></Field>
          <Btn className="mb-[22px]" onClick={async () => { const n = limit ? Math.max(1, Math.min(10, Number(limit))) : 0; const r = await patchMe({ settings: { maxDevices: n } }); setMe(r.user); toast(n ? `Limit set to ${n} device(s)` : "Device limit removed"); }}>Save</Btn>
        </div>
      </Panel>
      <Panel className="mt-5 p-5" delay={0.05}>
        <Title right={<Btn variant="danger" disabled={list.length < 2} onClick={() => setConfirm("others")}>Sign out all other devices</Btn>}>Active sessions ({list.length})</Title>
        <div className="mt-4 divide-y divide-[#f0f0f0] rounded-[10px] border border-[#ededed]">
          {list.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-[220px] flex-1"><p className="flex items-center gap-2 font-medium">{device(s.userAgent)} {s.current && <Pill>This device</Pill>}</p><p className="text-[12px] text-[#6b6b7b]">IP {s.ip} · signed in {fmtDateTime(s.createdAt)}</p></div>
              {!s.current && <Btn variant="outline" className="h-8 px-3 text-[13px]" onClick={() => setConfirm(s.id)}>Sign out</Btn>}
            </div>
          ))}
        </div>
      </Panel>
      {confirm && (
        <Confirm
          title={confirm === "others" ? "Sign out all other devices?" : "Sign out this device?"}
          text="They'll need to log in again with an OTP."
          okLabel="Sign out"
          onOk={async () => { await api(`/api/sessions?${confirm === "others" ? "others=1" : `id=${confirm}`}`, "DELETE"); await load(); toast("Signed out"); }}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

export default function Page() {
  return <Gate feature="restrict-login-devices" title="Manage Login Sessions"><Sessions /></Gate>;
}
