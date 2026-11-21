"use client";
import { useState } from "react";
import { patchMe, toast, useMe } from "@/lib/client";
import { Btn, Confirm, Field, Gate, Panel, Pill, Title, inputCls } from "@/components/dash/kit";

function Account() {
  const { me, setMe } = useMe();
  const acc = (me.settings?.waAccount || null) as null | { provider: string; phone: string; key: string; connectedAt: string };
  const [provider, setProvider] = useState("Interakt");
  const [phone, setPhone] = useState("");
  const [key, setKey] = useState("");
  const [confirm, setConfirm] = useState(false);
  return (
    <Panel className="p-5">
      <Title sub="**You can connect any WhatsApp API Provider">Account Management</Title>
      {acc ? (
        <div className="mt-4 max-w-xl rounded-[10px] border border-[#ededed] p-4">
          <div className="flex items-center justify-between"><p className="font-semibold">{acc.provider}</p><Pill>Connected</Pill></div>
          <p className="mt-1 text-[13px] text-[#6b6b7b]">+91 {acc.phone} · key ••••{acc.key.slice(-4)}</p>
          <Btn variant="danger" className="mt-4" onClick={() => setConfirm(true)}>Disconnect</Btn>
        </div>
      ) : (
        <div className="mt-4 grid max-w-xl gap-4">
          <Field label="WhatsApp API provider" required><select className={inputCls} value={provider} onChange={(e) => setProvider(e.target.value)}>{["Interakt", "Wati", "AiSensy", "Gupshup", "Meta Cloud API", "Other"].map((p) => <option key={p}>{p}</option>)}</select></Field>
          <Field label="WhatsApp business number" required><input className={inputCls} inputMode="numeric" maxLength={10} placeholder="10-digit number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} /></Field>
          <Field label="API key / token" required hint="Stored for this clone only; messages aren't actually sent."><input className={inputCls} type="password" value={key} onChange={(e) => setKey(e.target.value)} /></Field>
          <div><Btn onClick={async () => {
            if (phone.length !== 10) return toast("Enter a 10-digit number", "err");
            if (key.length < 8) return toast("Enter a valid API key", "err");
            const r = await patchMe({ settings: { waAccount: { provider, phone, key, connectedAt: new Date().toISOString() } } });
            setMe(r.user);
            toast("WhatsApp account connected");
          }}>Connect</Btn></div>
        </div>
      )}
      {confirm && <Confirm title="Disconnect WhatsApp?" text="WhatsApp broadcasts and automations will stop." okLabel="Disconnect" onOk={async () => { const r = await patchMe({ settings: { waAccount: null } }); setMe(r.user); toast("Disconnected"); }} onClose={() => setConfirm(false)} />}
    </Panel>
  );
}

export default function Page() {
  return <Gate feature="whatsapp-account-management" title="Account Management"><Account /></Gate>;
}
